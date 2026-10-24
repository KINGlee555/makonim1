import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ListHeader from "../components/minimal/ListHeader";
import ListItemRow from "../components/minimal/ListItemRow";
import CategoryHeader from "../components/minimal/CategoryHeader";
import ProfileDialog from "../components/ProfileDialog";
import QuickAddBar from "../components/QuickAddBar";
import ShareDialog from "../components/ShareDialog";
import ProductSearchDialog from "../components/ProductSearchDialog";
import ListExtras from "../components/ListExtras";
import AppFooter from "../components/AppFooter";
import NavigateToStoreDialog from "../components/NavigateToStoreDialog";
import SettingsDialog from "../components/SettingsDialog";
import ListReader from "../components/ListReader";
import SharedWithStrip from "../components/SharedWithStrip";
import { toast } from "@/components/ui/use-toast";
import { loadLocalName, saveLocalName } from "@/lib/userName";
import { usePriceSync } from "@/hooks/usePriceSync";
import { useWarmChainPrices } from "@/hooks/useWarmChainPrices";
import { useListPresence } from "@/hooks/useListPresence";
import { useT } from "@/lib/i18n";
import ShoppingMode from "../components/ShoppingMode";
import BasketComparison from "../components/BasketComparison";
import PriceCompareTable from "../components/PriceCompareTable";
import ListTemplates from "../components/ListTemplates";
import SuggestPhotoDialog from "../components/SuggestPhotoDialog";
import ItemReminderDialog from "../components/ItemReminderDialog";
import { useItemReminders } from "@/hooks/useItemReminders";
import { requestNotificationPermission } from "@/hooks/useListNotifications";
import { useChainDeals } from "@/hooks/useChainDeals";
import { dealForItem } from "@/lib/chainDeals";
import BarcodeScanner from "../components/BarcodeScanner";
import SmartSuggestions from "../components/SmartSuggestions";
import ShoppingRoute from "../components/ShoppingRoute";
import WeeklyMenu from "../components/WeeklyMenu";
import CostSplitter from "../components/CostSplitter";
import Leaderboard from "../components/Leaderboard";
import CouponsDeals from "../components/CouponsDeals";
import VoiceQuickAdd from "../components/VoiceQuickAdd";
import FeatureMenu from "../components/FeatureMenu";
import DealCalculator from "../components/DealCalculator";
import CategoryOrderDialog from "../components/CategoryOrderDialog";
import { loadCategoryOrder, sortByCategoryOrder, sortItemsByCategory } from "@/lib/categoryOrder";
import EmptyListSuggestions from "../components/EmptyListSuggestions";
import ItemDetailsDialog from "../components/ItemDetailsDialog";
import ChangePhotoDialog from "../components/ChangePhotoDialog";
import UnavailableItem from "../components/UnavailableItem";
import RenameListDialog from "../components/RenameListDialog";
import ParticipantsDialog from "../components/ParticipantsDialog";
import PremiumDialog from "../components/PremiumDialog";
import PremiumBanner from "../components/PremiumBanner";
import SponsoredSlot from "../components/sponsored/SponsoredSlot";
import CourierDeliveryDialog from "../components/CourierDeliveryDialog";
import DeliveryNotice from "../components/DeliveryNotice";
import SmartTools from "../components/SmartTools";
import RecentlyBought from "../components/RecentlyBought";
import FillFromLastWeek from "../components/FillFromLastWeek";
import PriceDropNotice from "../components/PriceDropNotice";
import MonthlySummary from "../components/MonthlySummary";
import ReportPriceDialog from "../components/ReportPriceDialog";
import PriceSourcesDialog from "../components/PriceSourcesDialog";
import { useSimpleMode } from "@/lib/simpleMode";
import { loadAllProducts } from "@/lib/loadAllProducts";
import { lineCost, quantityStep } from "@/lib/units";
import { uiEnter, uiSection, uiBanner } from "@/lib/minimalUi";

export default function ListView() {
  const { listId } = useParams();
  const t = useT();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [navigateProduct, setNavigateProduct] = useState(null);
  const [showShoppingMode, setShowShoppingMode] = useState(false);
  const [showBasket, setShowBasket] = useState(false);
  const [showPriceCompare, setShowPriceCompare] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [reportItem, setReportItem] = useState(null);
  const [showCourier, setShowCourier] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [showDealCalculator, setShowDealCalculator] = useState(false);
  const [showCategoryOrder, setShowCategoryOrder] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [categoryOrder, setCategoryOrder] = useState(loadCategoryOrder);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [photoItem, setPhotoItem] = useState(null);
  const [suggestPhotoItem, setSuggestPhotoItem] = useState(null);
  const [reminderItem, setReminderItem] = useState(null);
  const currentUserRef = useState(null);
  const currentUserNameRef = useRef("");
  const itemsRef = useRef([]);
  itemsRef.current = items;
  const favoritesRef = useRef([]);
  favoritesRef.current = favorites;
  const { syncing: priceSyncing } = usePriceSync();
  // Prepares real chain prices in the background so comparisons open instantly
  useWarmChainPrices(items);
  // תזכורות לפריטים שהגיע זמנן
  useItemReminders(items);
  // מבצעים אמיתיים מהרשתות עבור המוצרים ברשימה
  const chainDeals = useChainDeals(items);
  // מי נמצא איתך ברשימה — נוכחות חיה, מתעדכנת כל חצי דקה
  const presence = useListPresence(listId, currentUserRef[0]);
  // מצב פשוט — מסתיר כל מה שאינו הכרחי לקנייה עצמה; הכל נשאר נגיש דרך "עוד"
  const [simple] = useSimpleMode();

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

  // Silent refresh every 5 seconds — keeps all participants in sync
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    loadData();
    base44.auth.me().then(me => {
      currentUserRef[1](me);
      currentUserNameRef.current = me.full_name || me.email || "";
      if (!me.full_name) {
        const localName = loadLocalName();
        if (localName) {
          base44.auth.updateMe({ full_name: localName });
          currentUserRef[1](prev => ({ ...prev, full_name: localName }));
        } else {
          setShowProfile(true);
        }
      } else {
        saveLocalName(me.full_name);
      }
    });
  }, [loadData]);

  const handleNameUpdated = (newName) => {
    saveLocalName(newName);
    currentUserNameRef.current = newName;
    currentUserRef[1](prev => ({ ...prev, full_name: newName }));
  };

  useEffect(() => {
    const unsubscribe = base44.entities.ShoppingList.subscribe((event) => {
      if (event.id !== listId) return;
      if (event.type === "update") setList(prev => prev ? { ...prev, ...event.data } : prev);
    });
    return unsubscribe;
  }, [listId]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    loadAllProducts(1000).then(setAllProducts).catch(() => {});
  }, []);

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
    const viewer = currentUserRef[0]?.full_name;
    if (!listId || !viewer) return;
    const unseen = items.filter(item => !(item.viewed_by || []).includes(viewer));
    if (unseen.length === 0) return;
    base44.entities.ListItem.bulkUpdate(unseen.map(item => ({ id: item.id, viewed_by: [...(item.viewed_by || []), viewer] })))
      .catch(() => {});
  }, [items, listId, currentUserRef[0]?.full_name]);

  const handleUndoBought = useCallback((item) => {
    const restored = { ...item, status: "pending", bought_by: "" };
    setItems(prev => prev.some(i => i.id === item.id) ? prev : [restored, ...prev]);
    base44.entities.ListItem.update(item.id, { status: "pending", bought_by: "" })
      .catch(() => setItems(prev => prev.filter(i => i.id !== item.id)));
  }, []);

  const handleToggleBought = useCallback((item) => {
    const buyerName = currentUserNameRef.current || "List Owner";
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
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: qty } : i));
    base44.entities.ListItem.update(item.id, { quantity: qty }).catch(() => {});
  }, []);

  const handleUpdateDetails = useCallback((item, details) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...details } : i));
    base44.entities.ListItem.update(item.id, details).catch(() => {});
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
    // מוצר שנמכר לפי משקל נכנס כיחידת גרם עם קילו כברירת מחדל
    const unit = product.weighted ? "gram" : "unit";
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
      status: "pending", quantity: unit === "gram" ? 1000 : 1, unit, note: ""
    });
    setItems(prev => prev.some(i => i.id === newItem.id) ? prev : [newItem, ...prev]);
  }, [listId]);

  const handleAddMultiple = useCallback(async (products) => {
    const items = products.map(p => ({
      list_id: listId, name: p.name, barcode: p.barcode || "", price: p.price || 0,
      image_url: p.image_url || "", category: p.category || "אחר",
      status: "pending", quantity: 1
    }));
    try {
      const created = await base44.entities.ListItem.bulkCreate(items);
      setItems(prev => [...created, ...prev]);
    } catch {
      toast({ title: t("templates.error"), variant: "destructive" });
    }
  }, [listId]);

  const handleAddUser = useCallback(async (email) => {
    const updated = [...(list.shared_with || []), email];
    await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    setList(prev => ({ ...prev, shared_with: updated }));
  }, [list]);

  const handleRemoveUser = useCallback(async (email) => {
    const updated = (list.shared_with || []).filter(e => e !== email);
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

  const handleNavigate = useCallback((item) => setNavigateProduct(item), []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 600);
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ui-canvas font-system font-medium">
        <div className="mx-auto w-full max-w-[760px] space-y-2 px-5 py-4 sm:px-7">
          <div className="h-11 rounded-[22px] bg-ui-surface shimmer" />
          <div className="h-12 rounded-[22px] bg-ui-surface shimmer" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[44px] rounded-lg bg-ui-surface shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-canvas font-system">
        <p className="text-[20px] font-semibold text-ui-ink">{t("list.notFound")}</p>
      </div>
    );
  }

  // רק המזמין — בעל הרשימה — מנהל את רשימת המשתתפים
  // רשימות ותיקות נשמרו בלי בעל מזוהה (anonymous) — כמו בשכבת המשתמשים, הן נחשבות של המשתמש
  const me = currentUserRef[0];
  const isOwner = !!me && (
    list.created_by_id === me.id ||
    list.created_by === me.email ||
    !list.created_by ||
    list.created_by === "anonymous"
  );

  const pendingItems = items.filter(i => !i.status || i.status === "pending");
  // מצב קנייה עובר על המוצרים לפי סדר המחלקות בסופר — כל מחלקה ברצף אחד
  const shoppingItems = sortItemsByCategory(pendingItems, categoryOrder);
  const unavailableItems = items.filter(i => i.status === "unavailable");
  const totalPrice = pendingItems.reduce((sum, i) => sum + lineCost(i), 0);
  const groupedCategories = Object.entries(
    pendingItems.reduce((groups, item) => {
      const cat = item.category || t("summary.other");
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
      return groups;
    }, {})
  ).sort(([a], [b]) => {
    const sorted = sortByCategoryOrder([a, b], categoryOrder);
    return sorted[0] === a ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-ui-canvas font-system font-medium text-ui-ink tabular-nums">
      <ListHeader
        list={list}
        userName={currentUserRef[0]?.full_name}
        itemCount={pendingItems.length}
        total={totalPrice}
        onOpenProfile={() => setShowProfile(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenShare={() => setShowShare(true)}
        onRename={() => setShowRename(true)}
        onAdd={() => setShowSearch(true)}
      />

      <main className="mx-auto w-full max-w-[760px] px-5 pb-[110px] sm:px-7">
        <SharedWithStrip list={list} members={presence.members} myEmail={currentUserRef[0]?.email} onOpen={() => setShowShare(true)} />

        {!simple && (
          <div className={uiEnter}>
            <SmartTools items={pendingItems} onOpenBasket={() => setShowBasket(true)} />
          </div>
        )}

        <PriceDropNotice listId={listId} items={pendingItems} />

        <MonthlySummary listId={listId} />

        <DeliveryNotice listId={listId} delay={0.05} />

        {(list.active_shoppers || []).filter(s => s !== currentUserNameRef.current).length > 0 && (
          <div className={`${uiSection} ${uiEnter}`}>
            <div className={uiBanner}>
              {t("active.nowShopping", { name: (list.active_shoppers || []).filter(s => s !== currentUserNameRef.current).join(", ") })}
            </div>
          </div>
        )}

        {pendingItems.length > 0 && (
          <>
            <div key={groupByCategory ? "grouped" : "ungrouped"} className="pt-1">
              {groupByCategory ? (
                groupedCategories.map(([cat, catItems]) => (
                  <section key={cat} className="pb-1.5">
                    <CategoryHeader category={cat} count={catItems.length} />
                    {catItems.map((item, itemIndex) => (
                      <ListItemRow key={item.id} item={item} index={itemIndex} onToggleBought={handleToggleBought}
                        onUpdateQuantity={handleUpdateQuantity} onNavigate={handleNavigate} onRemove={handleRemoveItem}
                        onEdit={setEditingItem} onSetReminder={setReminderItem} onUnavailable={handleUnavailable} onToggleFavorite={handleToggleFavorite} onChangePhoto={setPhotoItem}
                        onUpdateDetails={handleUpdateDetails}
                        onSuggestPhoto={setSuggestPhotoItem} onReportPrice={setReportItem} deal={dealForItem(chainDeals, item)}
                        onPhotoFound={handlePhotoFound}
                        isFavorite={favorites.some(favorite => favorite.name === item.name)}
                        viewerName={currentUserRef[0]?.full_name}
                        className={removingIds.has(item.id) ? "animate-slide-out" : ""} />
                    ))}
                  </section>
                ))
              ) : (
                pendingItems.map((item, index) => (
                  <ListItemRow key={item.id} item={item} index={index} onToggleBought={handleToggleBought}
                    onUpdateQuantity={handleUpdateQuantity} onNavigate={handleNavigate} onRemove={handleRemoveItem}
                    onEdit={setEditingItem} onSetReminder={setReminderItem} onUnavailable={handleUnavailable} onToggleFavorite={handleToggleFavorite} onChangePhoto={setPhotoItem}
                    onUpdateDetails={handleUpdateDetails}
                    onSuggestPhoto={setSuggestPhotoItem} onReportPrice={setReportItem} deal={dealForItem(chainDeals, item)}
                    onPhotoFound={handlePhotoFound}
                    isFavorite={favorites.some(favorite => favorite.name === item.name)}
                    viewerName={currentUserRef[0]?.full_name}
                    className={removingIds.has(item.id) ? "animate-slide-out" : ""} />
                ))
              )}
            </div>

            {showSuggestions && !simple && (
              <SmartSuggestions listId={listId} currentItems={items} onAddProduct={handleAddProduct} delay={0.1} />
            )}
          </>
        )}

        {unavailableItems.length > 0 && (
          <section className={`${uiSection} pt-4`}>
            <h2 className="mb-1 text-[15px] font-semibold text-ui-ink">{t("list.unavailable")}</h2>
            {unavailableItems.map(item => <UnavailableItem key={item.id} item={item} onRestore={handleRestore} />)}
          </section>
        )}

        {pendingItems.length === 0 && unavailableItems.length === 0 && (
          <div className={`${uiEnter}`}>
            <EmptyListSuggestions onAddProduct={handleAddProduct} />
            <div className="border-b border-ui-line-soft py-4 text-center text-[14px] text-ui-muted">
              <b className="mb-0.5 block text-[15px] font-semibold text-ui-ink">{t("list.empty")}</b>
              {t("list.emptyDesc")}
            </div>
          </div>
        )}

        <FillFromLastWeek listId={listId} currentItems={items} onFilled={loadData} />

        {!simple && <RecentlyBought listId={listId} delay={0.1} />}

        {!simple && (
          <div className={`${uiSection} ${uiEnter}`}>
            <ListExtras list={list} listId={listId} items={items} favorites={favorites}
              onAddProduct={handleAddProduct} onToggleFavorite={handleToggleFavorite} />
          </div>
        )}

        {!simple && <SponsoredSlot delay={0.15} />}

        {!simple && (
          <div className={`${uiSection} ${uiEnter}`}>
            <PremiumBanner onOpen={() => setShowPremium(true)} />
          </div>
        )}

        <AppFooter />
      </main>

      <QuickAddBar
        onOpenSearch={() => setShowSearch(true)}
        onOpenScanner={() => setShowScanner(true)}
        onOpenShoppingMode={() => setShowShoppingMode(true)}
        hasItems={pendingItems.length > 0}
        tools={
          <FeatureMenu
            bar
            grouped={groupByCategory}
            onOpenGroupBy={() => setGroupByCategory(g => !g)}
            onOpenSuggestions={() => setShowSuggestions(v => !v)}
            onOpenBasket={() => setShowBasket(true)}
            onOpenPriceCompare={() => setShowPriceCompare(true)}
            onOpenTemplates={() => setShowTemplates(true)}
            onOpenScanner={() => setShowScanner(true)}
            onOpenRoute={() => setShowRoute(true)}
            onOpenMenu={() => setShowMenu(true)}
            onOpenDeals={() => setShowDeals(true)}
            onOpenSplit={() => setShowSplit(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenVoice={() => setShowVoice(true)}
            onOpenDealCalculator={() => setShowDealCalculator(true)}
            onOpenCategoryOrder={() => setShowCategoryOrder(true)}
            onOpenPremium={() => setShowPremium(true)}
            onOpenCourier={() => setShowCourier(true)}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onOpenParticipants={isOwner ? () => setShowParticipants(true) : null}
            readerSlot={<ListReader items={pendingItems} />}
          />
        }
      />
      <ShareDialog open={showShare} onOpenChange={setShowShare} list={list} currentUser={currentUserRef[0]} itemCount={pendingItems.length} />
      <ParticipantsDialog open={showParticipants} onOpenChange={setShowParticipants} list={list}
        currentUser={currentUserRef[0]} onUpdated={(patch) => setList(prev => ({ ...prev, ...patch }))} />
      <ProductSearchDialog open={showSearch} onOpenChange={setShowSearch} onAddProduct={handleAddProduct}
        favorites={favorites} onToggleFavorite={handleToggleFavorite} />
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} currentUser={currentUserRef[0]} onNameUpdated={handleNameUpdated} forceName={!currentUserRef[0]?.full_name} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} list={list} />
      <RenameListDialog open={showRename} onOpenChange={setShowRename} list={list}
        onRenamed={(title) => setList(prev => ({ ...prev, title }))} />
      <NavigateToStoreDialog open={!!navigateProduct} onOpenChange={(v) => !v && setNavigateProduct(null)} product={navigateProduct} />
      <ItemDetailsDialog item={editingItem} onClose={() => setEditingItem(null)} onSave={handleUpdateDetails} />
      <ChangePhotoDialog item={photoItem} onClose={() => setPhotoItem(null)}
        onSaved={(id, url) => setItems(prev => prev.map(i => (i.id === id ? { ...i, image_url: url } : i)))} />
      <SuggestPhotoDialog item={suggestPhotoItem} listId={listId} userName={currentUserNameRef.current}
        onClose={() => setSuggestPhotoItem(null)} />
      <ItemReminderDialog item={reminderItem} onClose={() => setReminderItem(null)} onSaved={handleSetReminder} />
      <ReportPriceDialog item={reportItem} listId={listId} userName={currentUserNameRef.current} onClose={() => setReportItem(null)} />
      <PriceSourcesDialog open={showSources} onOpenChange={setShowSources} />

      {showShoppingMode && (
        <ShoppingMode items={shoppingItems} onBought={handleToggleBought} onExit={() => setShowShoppingMode(false)}
          userName={currentUserNameRef.current} listId={listId} />
      )}
      <BasketComparison open={showBasket} onOpenChange={setShowBasket} items={pendingItems} onOpenSources={() => setShowSources(true)} />
      <PriceCompareTable open={showPriceCompare} onOpenChange={setShowPriceCompare} items={pendingItems} />
      <ListTemplates open={showTemplates} onOpenChange={setShowTemplates} listId={listId} allProducts={allProducts} onAdded={loadData} />
      <BarcodeScanner open={showScanner} onOpenChange={setShowScanner} onDetected={() => { setShowScanner(false); setShowSearch(true); }} />
      <ShoppingRoute open={showRoute} onOpenChange={setShowRoute} items={pendingItems} />
      <WeeklyMenu open={showMenu} onOpenChange={setShowMenu} onGenerate={handleAddMultiple} />
      <CostSplitter open={showSplit} onOpenChange={setShowSplit} listId={listId} list={list} />
      <Leaderboard open={showLeaderboard} onOpenChange={setShowLeaderboard} listId={listId} />
      <CouponsDeals open={showDeals} onOpenChange={setShowDeals} items={pendingItems} onAddProduct={handleAddProduct} />
      <DealCalculator open={showDealCalculator} onOpenChange={setShowDealCalculator} />
      <CategoryOrderDialog open={showCategoryOrder} onOpenChange={setShowCategoryOrder} onSaved={setCategoryOrder} />
      <VoiceQuickAdd open={showVoice} onOpenChange={setShowVoice} onAddProduct={handleAddProduct} allProducts={allProducts} />
      <PremiumDialog open={showPremium} onOpenChange={setShowPremium} />
      <CourierDeliveryDialog open={showCourier} onOpenChange={setShowCourier} listId={listId}
        items={pendingItems} userName={currentUserNameRef.current} />
    </div>
  );
}