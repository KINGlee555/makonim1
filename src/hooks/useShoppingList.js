import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { loadLocalName, saveLocalName } from "@/lib/userName";
import { clampQuantity, quantityStep } from "@/lib/units";
import { isWeightSold } from "@/lib/weightProducts";
import { requestNotificationPermission } from "@/hooks/useListNotifications";

// All list data and actions in one place: loading, live sync between participants,
// and adding/updating/checking items. The screen itself remains display-only.
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
    // TODO: Fetch list, items, and favorites from your new backend database
    // Mocking basic data so the UI can render
    setList({ id: listId, title: "My List", shared_with: [] });
    setItems([]); // Replace with fetched items
    setFavorites([]); // Replace with fetched favorites
    setLoading(false);
  }, [listId]);

  // Silent refresh every 5 seconds — all participants see the same list
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    loadData();

    // TODO: Fetch current user from your new auth provider
    const mockMe = { email: "user@example.com", full_name: "" }; // Mock user

    Promise.resolve(mockMe).then(me => {
      setUser(me);
      userNameRef.current = me.full_name || me.email || "";
      if (!me.full_name) {
        const localName = loadLocalName();
        if (localName) {
          // TODO: Update user's name in backend
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

  // Real-time Subscriptions
  useEffect(() => {
    // TODO: Implement real-time subscription for ShoppingList updates using your new backend
    const unsubscribe = () => {};
    return unsubscribe;
  }, [listId]);

  useEffect(() => {
    // TODO: Implement real-time subscription for ListItem updates using your new backend
    const unsubscribe = () => {};
    return unsubscribe;
  }, [listId, t]);

  useEffect(() => {
    // TODO: Implement real-time subscription for FavoriteProduct updates using your new backend
    const unsubscribe = () => {};
    return unsubscribe;
  }, [listId]);

  // Whoever opens the list marks products as "viewed" — so it's clear who has already seen them
  useEffect(() => {
    const viewer = user?.full_name;
    if (!listId || !viewer) return;
    const unseen = items.filter(item => !(item.viewed_by || []).includes(viewer));
    if (unseen.length === 0) return;

    // TODO: Bulk update viewed_by array in your backend
    /*
    newBackend.bulkUpdate(unseen.map(item => ({ id: item.id, viewed_by: [...(item.viewed_by || []), viewer] })))
      .catch(() => {});
    */
  }, [items, listId, user?.full_name]);

  const handleUndoBought = useCallback((item) => {
    const restored = { ...item, status: "pending", bought_by: "" };
    setItems(prev => prev.some(i => i.id === item.id) ? prev : [restored, ...prev]);
    // TODO: Update item status to "pending" in your backend
  }, []);

  const handleToggleBought = useCallback((item) => {
    const buyerName = userNameRef.current || "List Owner";
    setRemovingIds(prev => new Set([...prev, item.id]));

    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== item.id));
      setRemovingIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    }, 300);

    // TODO: Update item status to "bought" in your backend
    // If it fails, you can rollback state

    // The history saves price per unit — for a gram product, it's the price per kg divided by 1000
    const isGram = item.unit === "gram";

    // TODO: Create a purchase history record in your backend
    /*
    newBackend.createPurchaseHistory({
      list_id: listId, item_name: item.name,
      price: isGram ? (item.price || 0) / 1000 : (item.price || 0),
      quantity: item.quantity || 1, category: item.category || "Other",
      bought_by: buyerName
    }).catch(() => {});
    */
  }, [listId]);

  const handleUpdateQuantity = useCallback((item, qty) => {
    // Quantity is saved within the defined range for the unit — up to 10 kg for weight-based products
    const quantity = clampQuantity(item, qty);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity } : i));
    // TODO: Update item quantity in your backend
  }, []);

  const handleUpdateDetails = useCallback((item, details) => {
    const next = details.quantity == null
        ? details
        : { ...details, quantity: clampQuantity({ ...item, unit: details.unit || item.unit }, details.quantity) };
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...next } : i));
    // TODO: Update item details in your backend
  }, []);

  // A real photo found for a product is saved on the item — the whole family sees it without re-searching
  const handlePhotoFound = useCallback((item, url) => {
    if (!url || item.image_url === url) return;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, image_url: url } : i));
    // TODO: Update item photo in your backend
  }, []);

  // Item reminder — saved on the product, and shown in a notification when the time comes
  const handleSetReminder = useCallback((item, remindAt) => {
    const patch = { remind_at: remindAt || "", reminder_sent: false };
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...patch } : i));
    // TODO: Update item reminder details in your backend
    if (remindAt) requestNotificationPermission();
  }, []);

  const handleUnavailable = useCallback(async (item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "unavailable" } : i));
    // TODO: Update item status to "unavailable" in your backend
  }, []);

  const handleRestore = useCallback(async (item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "pending" } : i));
    // TODO: Update item status to "pending" in your backend
  }, []);

  const handleToggleFavorite = useCallback(async (product) => {
    const existing = favoritesRef.current.find(favorite => favorite.name === product.name);
    if (existing) {
      setFavorites(prev => prev.filter(favorite => favorite.id !== existing.id));
      // TODO: Delete favorite record from your backend
      return;
    }

    const favorite = {
      id: Date.now().toString(), // Mock ID
      list_id: listId, name: product.name, price: product.price || 0,
      image_url: product.image_url || "", category: product.category || "Other",
      brand: product.brand || ""
    };

    setFavorites(prev => prev.some(item => item.id === favorite.id) ? prev : [favorite, ...prev]);
    // TODO: Create favorite record in your backend
  }, [listId]);

  const handleAddProduct = useCallback(async (product) => {
    // A product sold by weight enters as a kilo — and from there you add kilo by kilo up to 10 kg
    const unit = isWeightSold(product) ? "kg" : "unit";
    const existing = itemsRef.current.find(i => i.name === product.name && i.status !== "bought");

    if (existing) {
      const newQty = (existing.quantity || 1) + quantityStep(existing.unit || unit);
      setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: newQty, status: "pending" } : i));
      // TODO: Update item quantity in your backend
      return;
    }

    const newItem = {
      id: Date.now().toString(), // Mock ID
      list_id: listId, name: product.name, barcode: product.barcode || "",
      price: product.price || 0,
      image_url: product.image_url || "", category: product.category || "Other",
      status: "pending", quantity: 1, unit, note: ""
    };

    setItems(prev => prev.some(i => i.id === newItem.id) ? prev : [newItem, ...prev]);
    // TODO: Create new item in your backend
  }, [listId]);

  const handleAddMultiple = useCallback(async (products) => {
    const rows = products.map((p, index) => ({
      id: Date.now().toString() + index, // Mock ID
      list_id: listId, name: p.name, barcode: p.barcode || "", price: p.price || 0,
      image_url: p.image_url || "", category: p.category || "Other",
      status: "pending", quantity: 1, unit: isWeightSold(p) ? "kg" : "unit"
    }));

    try {
      setItems(prev => [...rows, ...prev]);
      // TODO: Bulk create items in your backend
    } catch {
      toast({ title: t("templates.error"), variant: "destructive" });
    }
  }, [listId, t]);

  const handleAddUser = useCallback(async (email) => {
    const updated = [...(list?.shared_with || []), email];
    setList(prev => ({ ...prev, shared_with: updated }));
    // TODO: Update list shared_with array in your backend
  }, [list]);

  const handleRemoveUser = useCallback(async (email) => {
    const updated = (list?.shared_with || []).filter(e => e !== email);
    setList(prev => ({ ...prev, shared_with: updated }));
    // TODO: Update list shared_with array in your backend
  }, [list]);

  const handleRemoveItem = useCallback((item) => {
    setRemovingIds(prev => new Set([...prev, item.id]));
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== item.id));
      setRemovingIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    }, 300);
    // TODO: Delete item from your backend
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