import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { loadLocalName, saveLocalName } from "@/lib/userName";
import { clampQuantity, quantityStep } from "@/lib/units";
import { isWeightSold } from "@/lib/weightProducts";
import { requestNotificationPermission } from "@/hooks/useListNotifications";

// כל נתוני הרשימה והפעולות עליה במקום אחד: טעינה, סנכרון חי בין המשתתפים,
// והוספה/עדכון/סימון של פריטים. המסך עצמו נשאר תצוגה בלבד.
export function useShoppingList(listId, { t, onNeedProfile } = {}) {
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const userNameRef = useRef("");
  const itemsRef = useRef([]);
  itemsRef.current = items;
  const favoritesRef = useRef([]);
  favoritesRef.current = favorites;
  const needProfileRef = useRef(onNeedProfile);
  needProfileRef.current = onNeedProfile;

  const loadData = useCallback(async () => {
    const [allLists, allItems, allFavorites] = await Promise.all([
      base44.entities.ShoppingList.filter({ id: listId }),
      base44.entities.ListItem.filter({ list_id: listId }, "-created_date", 200),
      base44.entities.FavoriteProduct.filter({ list_id: listId }, "-created_date", 100)
    ]);
    if (allLists.length > 0) setList(allLists[0]);
    setItems(allItems);
    setFavorites(allFavorites);
    setLoading(false);
  }, [listId]);

  // רענון שקט כל 5 שניות — כל המשתתפים רואים את אותה רשימה
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    loadData();
    base44.auth.me().then(me => {
      setUser(me);
      userNameRef.current = me.full_name || me.email || "";
      if (!me.full_name) {
        const localName = loadLocalName();
        if (localName) {
          base44.auth.updateMe({ full_name: localName });
          setUser(prev => ({ ...prev, full_name: localName }));
        } else {
          needProfileRef.current?.();
        }
      } else {
        saveLocalName(me.full_name);
      }
    });
  }, [loadData]);

  const handleNameUpdated = useCallback((newName) => {
    saveLocalName(newName);
    userNameRef.current = newName;
    setUser(prev => ({ ...prev, full_name: newName }));
  }, []);

  useEffect(() => {
    const unsubscribe = base44.entities.ShoppingList.subscribe((event) => {
      if (event.id !== listId) return;
      if (event.type === "update") setList(prev => prev ? { ...prev, ...event.data } : prev);
    });
    return unsubscribe;
  }, [listId]);

  useEffect(() => {
    const unsubscribe = base44.entities.ListItem.subscribe((event) => {
      if (event.data?.list_id !== listId && event.type !== "delete") return;
      if (event.type === "create") {
        setItems(prev => prev.some(i => i.id === event.data.id) ? prev : [event.data, ...prev]);
      } else if (event.type === "update") {
        setItems(prev => prev.map(i => i.id === event.id ? event.data : i));
      } else if (event.type === "delete") {
        setItems(prev => prev.filter(i => i.id !== event.id));
      }
    });
    return unsubscribe;
  }, [listId, t]);

  useEffect(() => {
    const unsubscribe = base44.entities.FavoriteProduct.subscribe((event) => {
      if (event.type === "delete") {
        setFavorites(prev => prev.filter(favorite => favorite.id !== event.id));
      } else if (event.data?.list_id === listId) {
        setFavorites(prev => event.type === "create"
          ? (prev.some(favorite => favorite.id === event.data.id) ? prev : [event.data, ...prev])
          : prev.map(favorite => favorite.id === event.id ? event.data : favorite));
      }
    });
    return unsubscribe;
  }, [listId]);

  // מי שפותח את הרשימה מסמן "ראיתי" על המוצרים — כדי שיהיה ברור למי כבר יצא לראות
  useEffect(() => {
    const viewer = user?.full_name;
    if (!listId || !viewer) return;
    const unseen = items.filter(item => !(item.viewed_by || []).includes(viewer));
    if (unseen.length === 0) return;
    base44.entities.ListItem.bulkUpdate(unseen.map(item => ({ id: item.id, viewed_by: [...(item.viewed_by || []), viewer] })))
      .catch(() => {});
  }, [items, listId, user?.full_name]);

  const handleUndoBought = useCallback((item) => {
    const restored = { ...item, status: "pending", bought_by: "" };
    setItems(prev => prev.some(i => i.id === item.id) ? prev : [restored, ...prev]);
    base44.entities.ListItem.update(item.id, { status: "pending", bought_by: "" })
      .catch(() => setItems(prev => prev.filter(i => i.id !== item.id)));
  }, []);

  const handleToggleBought = useCallback((item) => {
    const buyerName = userNameRef.current || "List Owner";
    setRemovingIds(prev => new Set([...prev, item.id]));
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== item.id));
      setRemovingIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    }, 300);
    base44.entities.ListItem.update(item.id, { status: "bought", bought_by: buyerName })
      .catch(() => setItems(prev => prev.some(i => i.id === item.id) ? prev : [{ ...item, status: "pending" }, ...prev]));
    // בהיסטוריה נשמר מחיר ליחידה — למוצר גרם זה המחיר לק״ג חלקי 1000
    const isGram = item.unit === "gram";
    base44.entities.PurchaseHistory.create({
      list_id: listId, item_name: item.name,
      price: isGram ? (item.price || 0) / 1000 : (item.price || 0),
      quantity: item.quantity || 1, category: item.category || "אחר",
      bought_by: buyerName
    }).catch(() => {});
  }, [listId]);

  const handleUpdateQuantity = useCallback((item, qty) => {
    // הכמות נשמרת בטווח שהוגדר ליחידה — עד 10 ק״ג למוצר לפי משקל
    const quantity = clampQuantity(item, qty);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity } : i));
    base44.entities.ListItem.update(item.id, { quantity }).catch(() => {});
  }, []);

  const handleUpdateDetails = useCallback((item, details) => {
    const next = details.quantity == null
      ? details
      : { ...details, quantity: clampQuantity({ ...item, unit: details.unit || item.unit }, details.quantity) };
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...next } : i));
    base44.entities.ListItem.update(item.id, next).catch(() => {});
  }, []);

  // תמונה אמיתית שנמצאה למוצר נשמרת על הפריט — כל המשפחה רואה אותה בלי חיפוש חוזר
  const handlePhotoFound = useCallback((item, url) => {
    if (!url || item.image_url === url) return;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, image_url: url } : i));
    base44.entities.ListItem.update(item.id, { image_url: url }).catch(() => {});
  }, []);

  // תזכורת לפריט — נשמרת על המוצר, ומוצגת בהתראה כשמגיע הזמן
  const handleSetReminder = useCallback((item, remindAt) => {
    const patch = { remind_at: remindAt || "", reminder_sent: false };
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...patch } : i));
    base44.entities.ListItem.update(item.id, patch).catch(() => {});
    if (remindAt) requestNotificationPermission();
  }, []);

  const handleUnavailable = useCallback(async (item) => {
    await base44.entities.ListItem.update(item.id, { status: "unavailable" });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "unavailable" } : i));
  }, []);

  const handleRestore = useCallback(async (item) => {
    await base44.entities.ListItem.update(item.id, { status: "pending" });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "pending" } : i));
  }, []);

  const handleToggleFavorite = useCallback(async (product) => {
    const existing = favoritesRef.current.find(favorite => favorite.name === product.name);
    if (existing) {
      await base44.entities.FavoriteProduct.delete(existing.id);
      setFavorites(prev => prev.filter(favorite => favorite.id !== existing.id));
      return;
    }
    const favorite = await base44.entities.FavoriteProduct.create({
      list_id: listId, name: product.name, price: product.price || 0,
      image_url: product.image_url || "", category: product.category || "אחר",
      brand: product.brand || ""
    });
    setFavorites(prev => prev.some(item => item.id === favorite.id) ? prev : [favorite, ...prev]);
  }, [listId]);

  const handleAddProduct = useCallback(async (product) => {
    // מוצר שנמכר לפי משקל נכנס בקילו — ומשם מוסיפים קילו-קילו עד 10 ק״ג
    const unit = isWeightSold(product) ? "kg" : "unit";
    const existing = itemsRef.current.find(i => i.name === product.name && i.status !== "bought");
    if (existing) {
      const newQty = (existing.quantity || 1) + quantityStep(existing.unit || unit);
      setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: newQty, status: "pending" } : i));
      base44.entities.ListItem.update(existing.id, { quantity: newQty, status: "pending" }).catch(() => {});
      return;
    }
    const newItem = await base44.entities.ListItem.create({
      list_id: listId, name: product.name, barcode: product.barcode || "",
      price: product.price || 0,
      image_url: product.image_url || "", category: product.category || "אחר",
      status: "pending", quantity: 1, unit, note: "",
      added_by: userNameRef.current || ""
    });
    setItems(prev => prev.some(i => i.id === newItem.id) ? prev : [newItem, ...prev]);
  }, [listId]);

  const handleAddMultiple = useCallback(async (products) => {
    const rows = products.map(p => ({
      list_id: listId, name: p.name, barcode: p.barcode || "", price: p.price || 0,
      image_url: p.image_url || "", category: p.category || "אחר",
      status: "pending", quantity: 1, unit: isWeightSold(p) ? "kg" : "unit",
      added_by: userNameRef.current || ""
    }));
    try {
      const created = await base44.entities.ListItem.bulkCreate(rows);
      setItems(prev => [...created, ...prev]);
    } catch {
      toast({ title: t("templates.error"), variant: "destructive" });
    }
  }, [listId, t]);

  const handleAddUser = useCallback(async (email) => {
    const updated = [...(list?.shared_with || []), email];
    await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    setList(prev => ({ ...prev, shared_with: updated }));
  }, [list]);

  const handleRemoveUser = useCallback(async (email) => {
    const updated = (list?.shared_with || []).filter(e => e !== email);
    await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    setList(prev => ({ ...prev, shared_with: updated }));
  }, [list]);

  const handleRemoveItem = useCallback((item) => {
    setRemovingIds(prev => new Set([...prev, item.id]));
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== item.id));
      setRemovingIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    }, 300);
    base44.entities.ListItem.delete(item.id).catch(() => {});
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 600);
  }, [loadData]);

  return {
    list, setList, items, setItems, favorites, user, userNameRef,
    loading, refreshing, removingIds,
    loadData, handleRefresh, handleNameUpdated,
    handleToggleBought, handleUndoBought, handleUpdateQuantity, handleUpdateDetails,
    handlePhotoFound, handleSetReminder, handleUnavailable, handleRestore,
    handleToggleFavorite, handleAddProduct, handleAddMultiple,
    handleAddUser, handleRemoveUser, handleRemoveItem,
  };
}