import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Share2, ShoppingCart, User, Settings, ShoppingBag, RefreshCw, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "../components/AppHeader";
import ProfileDialog from "../components/ProfileDialog";
import ProductItem from "../components/ProductItem";
import QuickAddBar from "../components/QuickAddBar";
import ShareDialog from "../components/ShareDialog";
import ProductSearchDialog from "../components/ProductSearchDialog";
import ListExtras from "../components/ListExtras";
import AppFooter from "../components/AppFooter";
import NavigateToStoreDialog from "../components/NavigateToStoreDialog";
import SettingsDialog from "../components/SettingsDialog";
import ListReader from "../components/ListReader";
import { toast } from "@/components/ui/use-toast";
import { loadLocalName, saveLocalName } from "@/lib/userName";
import { usePriceSync } from "@/hooks/usePriceSync";
import { useWarmChainPrices } from "@/hooks/useWarmChainPrices";
import { useT } from "@/lib/i18n";
import { getProductEmoji } from "@/lib/productEmoji";
import ShoppingMode from "../components/ShoppingMode";
import BasketComparison from "../components/BasketComparison";
import PriceCompareTable from "../components/PriceCompareTable";
import ListTemplates from "../components/ListTemplates";
import SuggestPhotoDialog from "../components/SuggestPhotoDialog";
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
import { loadCategoryOrder, sortByCategoryOrder } from "@/lib/categoryOrder";
import EmptyListSuggestions from "../components/EmptyListSuggestions";
import ItemDetailsDialog from "../components/ItemDetailsDialog";
import ChangePhotoDialog from "../components/ChangePhotoDialog";
import UnavailableItem from "../components/UnavailableItem";
import RenameListDialog from "../components/RenameListDialog";
import ParticipantsDialog from "../components/ParticipantsDialog";
import PremiumDialog from "../components/PremiumDialog";
import { loadAllProducts } from "@/lib/loadAllProducts";
import { categoryImage, categoryTone } from "@/lib/marketPalette";
import { lineCost, quantityStep } from "@/lib/units";

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
  const currentUserRef = useState(null);
  const currentUserNameRef = useRef("");
  const itemsRef = useRef([]);
  itemsRef.current = items;
  const favoritesRef = useRef([]);
  favoritesRef.current = favorites;
  const { syncing: priceSyncing } = usePriceSync();
  // Prepares real chain prices in the background so comparisons open instantly
  useWarmChainPrices(items);
  // מבצעים אמיתיים מהרשתות עבור המוצרים ברשימה
  const chainDeals = useChainDeals(items);

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
      <div className="min-h-screen bg-market-surface">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-4 md:px-12 space-y-4">
          <div className="h-14 rounded-[28px] bg-market-track shimmer" />
          <div className="h-56 rounded-[40px] bg-market-track shimmer" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 rounded-[30px] bg-market-track shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-market-surface">
        <div className="text-center">
          <p className="text-[26px] font-black text-market-ink">{t("list.notFound")}</p>
        </div>
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
    <div className="market-page min-h-screen bg-market-surface pb-24">
      <AppHeader
        listView
        userName={currentUserRef[0]?.full_name}
        rightAction={
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" title={t("header.changeName")} onClick={() => setShowProfile(true)} className="flex h-11 w-auto items-center gap-1.5 rounded-[22px] bg-market-pink px-3.5 text-white hover:bg-market-pink hover:text-white">
              <User className="w-4 h-4" />
              <span className="hidden text-[15px] font-extrabold md:inline">{t("header.changeName")}</span>
            </Button>
            <Button variant="ghost" size="icon" title={t("header.settings")} onClick={() => setShowSettings(true)} className="flex h-11 w-auto items-center gap-1.5 rounded-[22px] bg-market-yellow px-3.5 text-market-ink hover:bg-market-yellow hover:text-market-ink">
              <Settings className="w-4 h-4" />
              <span className="hidden text-[15px] font-extrabold md:inline">{t("header.settings")}</span>
            </Button>
            <Button variant="ghost" size="icon" title={t("header.share")} onClick={() => setShowShare(true)} className="flex h-11 w-auto items-center gap-1.5 rounded-[22px] bg-market-blue px-3.5 text-white hover:bg-market-blue hover:text-white">
              <Share2 className="w-4 h-4" />
              <span className="hidden text-[15px] font-extrabold md:inline">{t("header.share")}</span>
            </Button>
          </div>
        }
      />

      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-4 md:px-12">
        <section className="relative mt-2 overflow-hidden rounded-[40px] border-4 border-market-ink bg-market-blue px-5 py-6 shadow-[0_10px_0_hsl(var(--market-ink))] mk-pop md:px-9 md:py-7" aria-label={t("list.total")}>
          <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-market-yellow opacity-[0.35]" />

          <div className="relative z-[1] rounded-[28px] border-[3px] border-market-ink bg-market-surface px-5 py-5 md:px-7">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="inline-block rounded-xl bg-market-yellow px-3 py-0.5 text-sm font-black tracking-[0.5px] text-market-ink">{t("list.toBuy")}</span>
                <p className="mt-1.5 text-5xl font-black leading-[1.1] tracking-[-3px] text-market-pink md:text-[56px]">{pendingItems.length}</p>
              </div>
              <div>
                <span className="inline-block rounded-xl bg-market-yellow px-3 py-0.5 text-sm font-black tracking-[0.5px] text-market-ink">{t("list.total")}</span>
                <p className="mt-1.5 text-5xl font-black leading-[1.1] tracking-[-3px] text-market-blue md:text-[56px]">₪{totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="my-4 h-4 overflow-hidden rounded-lg border-2 border-market-ink bg-market-track">
              <span className="mk-stripe block h-full w-full" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <button onClick={() => setShowRename(true)} title={t("rename.button")} className="flex min-w-0 items-center gap-2 text-[18px] font-black text-market-ink">
                <span className="truncate">{list.title}</span>
                <Pencil className="h-4 w-4 flex-shrink-0" />
              </button>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button onClick={handleRefresh} className="flex h-10 items-center justify-center gap-1.5 rounded-[20px] bg-market-pink px-4 text-[15px] font-black text-white">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-refresh" : ""}`} />
                  {t("list.refresh")}
                </button>
                {isOwner && (
                  <button onClick={() => setShowParticipants(true)} className="flex h-10 items-center justify-center gap-1.5 rounded-[20px] bg-market-blue px-4 text-[15px] font-black text-white">
                    <Users className="w-4 h-4" />
                    {t("participants.button")}
                  </button>
                )}
                <ListReader items={pendingItems} />
              </div>
            </div>
          </div>
        </section>

        <ListExtras list={list} listId={listId} items={items} favorites={favorites}
          onAddProduct={handleAddProduct} onToggleFavorite={handleToggleFavorite} />

        {(list.active_shoppers || []).filter(s => s !== currentUserNameRef.current).length > 0 && (
          <div className="mt-5 flex items-center gap-2.5 rounded-3xl border-[3px] border-market-pink bg-market-pink-tint px-5 py-3">
            <span className="h-3 w-3 flex-shrink-0 rounded-full bg-market-pink" />
            <span className="text-[17px] font-extrabold text-market-pink">
              {t("active.nowShopping", { name: (list.active_shoppers || []).filter(s => s !== currentUserNameRef.current).join(", ") })}
            </span>
          </div>
        )}

        {pendingItems.length > 0 && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3.5">
              <button onClick={() => setShowShoppingMode(true)} className="flex h-14 items-center justify-center gap-1.5 rounded-[28px] bg-market-pink px-2 text-[17px] font-black text-white">
                <ShoppingBag className="w-4 h-4" />{t("shoppingMode.title")}
              </button>
              <FeatureMenu
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
              />
            </div>

            {showSuggestions && (
              <div className="mt-6">
                <SmartSuggestions listId={listId} currentItems={items} onAddProduct={handleAddProduct} />
              </div>
            )}

            <div key={groupByCategory ? "grouped" : "ungrouped"} className="mt-7 animate-fade-in">
              {groupByCategory ? (
                groupedCategories.map(([cat, catItems], index) => (
                  <section key={cat} className="mb-7">
                    <div className="mb-4 flex items-center gap-4">
                      <img src={categoryImage(cat)} alt={cat} className="h-16 w-16 flex-shrink-0 rounded-full border-4 border-market-ink object-cover md:h-[84px] md:w-[84px]" />
                      <h2 className={`min-w-0 text-[28px] font-black leading-tight tracking-[-2px] md:text-[38px] ${categoryTone(index).text}`}>{cat}</h2>
                      <span className={`rounded-[14px] px-3.5 py-0.5 text-base font-black ${categoryTone(index).badge}`}>{catItems.length}</span>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {catItems.map((item, itemIndex) => (
                        <ProductItem key={item.id} item={item} paletteIndex={itemIndex} onToggleBought={handleToggleBought}
                          onUpdateQuantity={handleUpdateQuantity} onNavigate={handleNavigate} onRemove={handleRemoveItem}
                          onEdit={setEditingItem} onUnavailable={handleUnavailable} onToggleFavorite={handleToggleFavorite} onChangePhoto={setPhotoItem}
                          onSuggestPhoto={setSuggestPhotoItem} deal={dealForItem(chainDeals, item)}
                          onPhotoFound={handlePhotoFound}
                          isFavorite={favorites.some(favorite => favorite.name === item.name)}
                          className={removingIds.has(item.id) ? "animate-slide-out" : ""} />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingItems.map((item, index) => (
                    <ProductItem key={item.id} item={item} paletteIndex={index} onToggleBought={handleToggleBought}
                      onUpdateQuantity={handleUpdateQuantity} onNavigate={handleNavigate} onRemove={handleRemoveItem}
                      onEdit={setEditingItem} onUnavailable={handleUnavailable} onToggleFavorite={handleToggleFavorite} onChangePhoto={setPhotoItem}
                      onSuggestPhoto={setSuggestPhotoItem} deal={dealForItem(chainDeals, item)}
                      onPhotoFound={handlePhotoFound}
                      isFavorite={favorites.some(favorite => favorite.name === item.name)}
                      className={removingIds.has(item.id) ? "animate-slide-out" : ""} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {unavailableItems.length > 0 && (
          <section className="mt-7 mb-6 space-y-3 animate-fade-in">
            <h2 className="text-[26px] font-black text-market-ink">{t("list.unavailable")}</h2>
            {unavailableItems.map(item => <UnavailableItem key={item.id} item={item} onRestore={handleRestore} />)}
          </section>
        )}

        {pendingItems.length === 0 && unavailableItems.length === 0 && (
          <div className="py-4 animate-fade-in">
            <EmptyListSuggestions onAddProduct={handleAddProduct} />
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-market-ink bg-market-yellow mk-bob">
                <ShoppingCart className="w-11 h-11 text-market-ink" />
              </div>
              <p className="text-[26px] font-black text-market-ink mb-1">{t("list.empty")}</p>
              <p className="text-[17px] font-bold text-market-ink/70">{t("list.emptyDesc")}</p>
            </div>
          </div>
        )}

        <AppFooter />
      </main>

      <QuickAddBar onOpenSearch={() => setShowSearch(true)} onOpenScanner={() => setShowScanner(true)} onOpenVoice={() => setShowVoice(true)} />

      <ShareDialog open={showShare} onOpenChange={setShowShare} list={list} currentUser={currentUserRef[0]} />
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

      {showShoppingMode && (
        <ShoppingMode items={pendingItems} onBought={handleToggleBought} onExit={() => setShowShoppingMode(false)}
          userName={currentUserNameRef.current} listId={listId} />
      )}
      <BasketComparison open={showBasket} onOpenChange={setShowBasket} items={pendingItems} />
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
    </div>
  );
}