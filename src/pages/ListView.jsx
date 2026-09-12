import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Share2, ShoppingCart, User, Settings, ShoppingBag, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "../components/AppHeader";
import ProfileDialog from "../components/ProfileDialog";
import ProductItem from "../components/ProductItem";
import QuickAddBar from "../components/QuickAddBar";
import ShareDialog from "../components/ShareDialog";
import ProductSearchDialog from "../components/ProductSearchDialog";
import ConnectedUsers from "../components/ConnectedUsers";
import AppFooter from "../components/AppFooter";
import NavigateToStoreDialog from "../components/NavigateToStoreDialog";
import SettingsDialog from "../components/SettingsDialog";
import ListReader from "../components/ListReader";
import { toast } from "@/components/ui/use-toast";
import { loadLocalName, saveLocalName } from "@/lib/userName";
import { usePriceSync } from "@/hooks/usePriceSync";
import { useT } from "@/lib/i18n";
import { getProductEmoji } from "@/lib/productEmoji";
import ShoppingMode from "../components/ShoppingMode";
import BasketComparison from "../components/BasketComparison";
import ListTemplates from "../components/ListTemplates";
import BarcodeScanner from "../components/BarcodeScanner";
import RecurringItems from "../components/RecurringItems";
import SmartSuggestions from "../components/SmartSuggestions";
import ShoppingRoute from "../components/ShoppingRoute";
import WeeklyMenu from "../components/WeeklyMenu";
import CostSplitter from "../components/CostSplitter";
import Leaderboard from "../components/Leaderboard";
import CouponsDeals from "../components/CouponsDeals";
import VoiceQuickAdd from "../components/VoiceQuickAdd";
import FeatureMenu from "../components/FeatureMenu";
import EmptyListSuggestions from "../components/EmptyListSuggestions";
import ItemDetailsDialog from "../components/ItemDetailsDialog";
import UnavailableItem from "../components/UnavailableItem";
import { loadAllProducts } from "@/lib/loadAllProducts";

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
  const [showTemplates, setShowTemplates] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const currentUserRef = useState(null);
  const currentUserNameRef = useRef("");
  const itemsRef = useRef([]);
  itemsRef.current = items;
  const { syncing: priceSyncing } = usePriceSync();

  const loadData = useCallback(async () => {
    const [allLists, allItems] = await Promise.all([
      base44.entities.ShoppingList.filter({ id: listId }),
      base44.entities.ListItem.filter({ list_id: listId }, "-created_date", 200)
    ]);
    if (allLists.length > 0) setList(allLists[0]);
    setItems(allItems);
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
    loadAllProducts().then(setAllProducts).catch(() => {});
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
    base44.entities.PurchaseHistory.create({
      list_id: listId, item_name: item.name, price: item.price || 0,
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

  const handleUnavailable = useCallback(async (item) => {
    await base44.entities.ListItem.update(item.id, { status: "unavailable" });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "unavailable" } : i));
  }, []);

  const handleRestore = useCallback(async (item) => {
    await base44.entities.ListItem.update(item.id, { status: "pending" });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "pending" } : i));
  }, []);

  const handleAddProduct = useCallback(async (product) => {
    // Prevent duplicates: if item already exists, increment quantity
    const existing = itemsRef.current.find(i => i.name === product.name && i.status !== "bought");
    if (existing) {
      const newQty = (existing.quantity || 1) + 1;
      setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: newQty, status: "pending" } : i));
      base44.entities.ListItem.update(existing.id, { quantity: newQty, status: "pending" }).catch(() => {});
      return;
    }
    const newItem = await base44.entities.ListItem.create({
      list_id: listId, name: product.name, price: product.price || 0,
      image_url: product.image_url || "", category: product.category || "אחר",
      status: "pending", quantity: 1, unit: "unit", note: ""
    });
    setItems(prev => prev.some(i => i.id === newItem.id) ? prev : [newItem, ...prev]);
  }, [listId]);

  const handleAddMultiple = useCallback(async (products) => {
    const items = products.map(p => ({
      list_id: listId, name: p.name, price: p.price || 0,
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
      <div className="min-h-screen bg-background">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-4 space-y-4">
          <div className="h-10 rounded-xl bg-muted shimmer" />
          <div className="h-16 rounded-xl bg-muted shimmer" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-card shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">{t("list.notFound")}</p>
        </div>
      </div>
    );
  }

  const pendingItems = items.filter(i => !i.status || i.status === "pending");
  const unavailableItems = items.filter(i => i.status === "unavailable");

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        listView
        userName={currentUserRef[0]?.full_name}
        rightAction={
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" title={t("header.changeName")} onClick={() => setShowProfile(true)}>
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" title={t("header.settings")} onClick={() => setShowSettings(true)}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" title={t("header.share")} onClick={() => setShowShare(true)}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        }
      />

      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-4">
        <section className="rounded-2xl border border-primary/10 bg-card p-4 shadow-md shadow-primary/5 mb-4 animate-slide-up" aria-label={t("list.total")}>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("list.toBuy")}</p>
              <p className="text-3xl font-bold leading-none text-foreground mt-1">{pendingItems.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("list.total")}</p>
              <p className="text-3xl font-bold leading-none text-foreground mt-1">₪{pendingItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden my-3">
            <div className="h-full w-full rounded-full bg-primary/35" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground truncate">{list.title}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleRefresh} className="h-9 min-w-16 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm flex items-center justify-center gap-1.5">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-refresh" : ""}`} />
                {t("list.refresh")}
              </button>
              <ListReader items={pendingItems} />
            </div>
          </div>
        </section>

        <ConnectedUsers list={list} />

        {(list.active_shoppers || []).filter(s => s !== currentUserNameRef.current).length > 0 && (
          <div className="flex items-center gap-2 bg-secondary border border-primary/15 rounded-xl px-4 py-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-secondary-foreground">
              {t("active.nowShopping", { name: (list.active_shoppers || []).filter(s => s !== currentUserNameRef.current).join(", ") })}
            </span>
          </div>
        )}

        {pendingItems.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-foreground mb-2 px-1">{t("list.primaryActions")}</h2>
            <div className="grid grid-cols-3 gap-2 mb-5 animate-slide-up">
              <Button onClick={() => setShowShoppingMode(true)} className="h-11 rounded-lg bg-primary text-primary-foreground px-2 shadow-sm flex items-center justify-center gap-1.5 text-sm font-semibold">
                <ShoppingBag className="w-4 h-4" />{t("shoppingMode.title")}
              </Button>
              <Button variant="default" onClick={() => setGroupByCategory(g => !g)} className="h-11 rounded-lg bg-primary text-primary-foreground px-2 shadow-sm flex items-center justify-center gap-1.5 text-sm font-semibold">
                <Layers className="w-4 h-4" />{groupByCategory ? t("list.ungroup") : t("list.groupByCategory")}
              </Button>
              <FeatureMenu
                onOpenBasket={() => setShowBasket(true)}
                onOpenTemplates={() => setShowTemplates(true)}
                onOpenScanner={() => setShowScanner(true)}
                onOpenRoute={() => setShowRoute(true)}
                onOpenMenu={() => setShowMenu(true)}
                onOpenDeals={() => setShowDeals(true)}
                onOpenSplit={() => setShowSplit(true)}
                onOpenLeaderboard={() => setShowLeaderboard(true)}
                onOpenVoice={() => setShowVoice(true)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-5">
              <RecurringItems listId={listId} currentItems={items} onAddProduct={handleAddProduct} />
              <SmartSuggestions listId={listId} currentItems={items} onAddProduct={handleAddProduct} />
            </div>

            <div key={groupByCategory ? "grouped" : "ungrouped"} className="space-y-4 mb-6 animate-fade-in">
              {groupByCategory
                ? Object.entries(
                    pendingItems.reduce((groups, item) => {
                      const cat = item.category || t("summary.other");
                      if (!groups[cat]) groups[cat] = [];
                      groups[cat].push(item);
                      return groups;
                    }, {})
                  ).map(([cat, catItems]) => (
                    <section key={cat}>
                      <div className="category-header flex items-end justify-between gap-3 px-1 pb-2 border-b border-primary/10 mb-2">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">{cat}</h2>
                          <p className="text-sm text-muted-foreground">{catItems.length} {t("list.toBuy")}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {catItems.map(item => (
                          <ProductItem key={item.id} item={item} onToggleBought={handleToggleBought}
                            onUpdateQuantity={handleUpdateQuantity} onNavigate={handleNavigate} onRemove={handleRemoveItem}
                            onEdit={setEditingItem} onUnavailable={handleUnavailable}
                            className={removingIds.has(item.id) ? "animate-slide-out" : ""} />
                        ))}
                      </div>
                    </section>
                  ))
                : pendingItems.map(item => (
                  <ProductItem key={item.id} item={item} onToggleBought={handleToggleBought}
                    onUpdateQuantity={handleUpdateQuantity} onNavigate={handleNavigate} onRemove={handleRemoveItem}
                    onEdit={setEditingItem} onUnavailable={handleUnavailable}
                    className={removingIds.has(item.id) ? "animate-slide-out" : ""} />
                ))
              }
            </div>
          </>
        )}

        {unavailableItems.length > 0 && (
          <section className="mb-6 space-y-2 animate-fade-in">
            <h2 className="px-1 text-lg font-bold text-muted-foreground">{t("list.unavailable")}</h2>
            {unavailableItems.map(item => <UnavailableItem key={item.id} item={item} onRestore={handleRestore} />)}
          </section>
        )}

        {pendingItems.length === 0 && unavailableItems.length === 0 && (
          <div className="py-4 animate-fade-in">
            <EmptyListSuggestions onAddProduct={handleAddProduct} />
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-float">
                <ShoppingCart className="w-10 h-10 text-primary/50" />
              </div>
              <p className="text-xl font-bold text-foreground mb-1">{t("list.empty")}</p>
              <p className="text-muted-foreground text-sm">{t("list.emptyDesc")}</p>
            </div>
          </div>
        )}

        <AppFooter />
      </main>

      <QuickAddBar onOpenSearch={() => setShowSearch(true)} onOpenScanner={() => setShowScanner(true)} onOpenVoice={() => setShowVoice(true)} />

      <ShareDialog open={showShare} onOpenChange={setShowShare} list={list} currentUser={currentUserRef[0]} />
      <ProductSearchDialog open={showSearch} onOpenChange={setShowSearch} onAddProduct={handleAddProduct} />
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} currentUser={currentUserRef[0]} onNameUpdated={handleNameUpdated} forceName={!currentUserRef[0]?.full_name} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} list={list} />
      <NavigateToStoreDialog open={!!navigateProduct} onOpenChange={(v) => !v && setNavigateProduct(null)} product={navigateProduct} />
      <ItemDetailsDialog item={editingItem} onClose={() => setEditingItem(null)} onSave={handleUpdateDetails} />

      {showShoppingMode && (
        <ShoppingMode items={pendingItems} onBought={handleToggleBought} onExit={() => setShowShoppingMode(false)}
          userName={currentUserNameRef.current} listId={listId} />
      )}
      <BasketComparison open={showBasket} onOpenChange={setShowBasket} items={pendingItems} />
      <ListTemplates open={showTemplates} onOpenChange={setShowTemplates} listId={listId} allProducts={allProducts} onAdded={loadData} />
      <BarcodeScanner open={showScanner} onOpenChange={setShowScanner} onDetected={() => { setShowScanner(false); setShowSearch(true); }} />
      <ShoppingRoute open={showRoute} onOpenChange={setShowRoute} items={pendingItems} />
      <WeeklyMenu open={showMenu} onOpenChange={setShowMenu} onGenerate={handleAddMultiple} />
      <CostSplitter open={showSplit} onOpenChange={setShowSplit} listId={listId} list={list} />
      <Leaderboard open={showLeaderboard} onOpenChange={setShowLeaderboard} listId={listId} />
      <CouponsDeals open={showDeals} onOpenChange={setShowDeals} items={pendingItems} />
      <VoiceQuickAdd open={showVoice} onOpenChange={setShowVoice} onAddProduct={handleAddProduct} allProducts={allProducts} />
    </div>
  );
}