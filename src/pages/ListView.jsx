import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Share2, ShoppingCart, User, Settings } from "lucide-react";
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
import { ToastAction } from "@/components/ui/toast";
import { loadLocalName, saveLocalName } from "@/lib/userName";
import { usePriceSync } from "@/hooks/usePriceSync";
import { useT } from "@/lib/i18n";

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
  const currentUserRef = useState(null);
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

  useEffect(() => {
    loadData();
    base44.auth.me().then(me => {
      currentUserRef[1](me);
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
    const unsubscribe = base44.entities.ListItem.subscribe((event) => {
      if (event.data?.list_id !== listId && event.type !== "delete") return;
      if (event.type === "create") {
        setItems(prev => prev.some(i => i.id === event.data.id) ? prev : [event.data, ...prev]);
      } else if (event.type === "update") {
        if (event.data?.status === "bought" && event.data?.bought_by) {
          const me = currentUserRef[0];
          const myName = me?.full_name || me?.email || "";
          if (event.data.bought_by !== myName) {
            const msg = t("list.boughtBy", { buyer: event.data.bought_by, name: event.data.name });
            toast({ title: msg, duration: 5000 });
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("MaKonim", {
                body: msg,
                icon: "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/2d1599b0e_IMG_0820.jpeg"
              });
            }
          }
        }
        setItems(prev => prev.map(i => i.id === event.id ? event.data : i));
      } else if (event.type === "delete") {
        setItems(prev => prev.filter(i => i.id !== event.id));
      }
    });
    return unsubscribe;
  }, [listId, t]);

  const handleToggleBought = async (item) => {
    const me = await base44.auth.me();
    const buyerName = me.full_name || me.email;
    await base44.entities.ListItem.update(item.id, {
      status: "bought",
      bought_by: buyerName
    });
    await base44.entities.PurchaseHistory.create({
      list_id: listId, item_name: item.name, price: item.price || 0,
      quantity: item.quantity || 1, category: item.category || "אחר",
      bought_by: buyerName
    });
    setItems(prev => prev.filter(i => i.id !== item.id));
    toast({
      title: t("list.itemBoughtToast", { name: item.name }),
      action: <ToastAction altText={t("list.undo")} onClick={() => handleUndoBought(item)}>{t("list.undo")}</ToastAction>,
      duration: 5000
    });
  };

  const handleUndoBought = async (item) => {
    await base44.entities.ListItem.update(item.id, { status: "pending", bought_by: "" });
    const restored = { ...item, status: "pending", bought_by: "" };
    setItems(prev => prev.some(i => i.id === item.id) ? prev : [restored, ...prev]);
    toast({ title: t("list.undone"), duration: 2000 });
  };

  const handleUpdateQuantity = async (item, qty) => {
    await base44.entities.ListItem.update(item.id, { quantity: qty });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: qty } : i));
  };

  const handleAddProduct = async (product) => {
    const newItem = await base44.entities.ListItem.create({
      list_id: listId, name: product.name, price: product.price || 0,
      image_url: product.image_url || "", category: product.category || "אחר",
      status: "pending", quantity: 1
    });
    setItems(prev => [newItem, ...prev]);
    toast({ title: t("list.addedToList", { name: product.name }), duration: 1000 });
  };

  const handleAddUser = async (email) => {
    const updated = [...(list.shared_with || []), email];
    await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    setList(prev => ({ ...prev, shared_with: updated }));
    toast({ title: t("list.userAdded", { email }), duration: 1500 });
  };

  const handleRemoveUser = async (email) => {
    const updated = (list.shared_with || []).filter(e => e !== email);
    await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    setList(prev => ({ ...prev, shared_with: updated }));
  };

  const handleRemoveItem = async (item) => {
    await base44.entities.ListItem.delete(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
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

  const pendingItems = items.filter(i => i.status !== "bought");

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
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

      <main className="max-w-lg mx-auto px-4 py-4">
        <ConnectedUsers list={list} />
        <div className="flex items-center gap-4 mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-base text-muted-foreground">{pendingItems.length} {t("list.toBuy")}</span>
          </div>
          {pendingItems.length > 0 && (
            <div className="ms-auto flex items-center gap-3">
              <ListReader items={pendingItems} />
              <div className="text-end">
                <span className="text-sm text-muted-foreground">{t("list.total")} </span>
                <span className="text-base font-bold text-primary">
                  ₪{pendingItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {pendingItems.length > 0 && (
          <div className="space-y-2 mb-6">
            {pendingItems.map(item => (
              <ProductItem key={item.id} item={item} onToggleBought={handleToggleBought}
                onUpdateQuantity={handleUpdateQuantity} onNavigate={(item) => setNavigateProduct(item)} onRemove={handleRemoveItem} />
            ))}
          </div>
        )}

        {pendingItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium text-foreground mb-1">{t("list.empty")}</p>
            <p className="text-muted-foreground text-lg">{t("list.emptyDesc")}</p>
          </div>
        )}

        <AppFooter />
      </main>

      <QuickAddBar onOpenSearch={() => setShowSearch(true)} />

      <ShareDialog open={showShare} onOpenChange={setShowShare} list={list} currentUser={currentUserRef[0]} />
      <ProductSearchDialog open={showSearch} onOpenChange={setShowSearch} onAddProduct={handleAddProduct} />
      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} currentUser={currentUserRef[0]} onNameUpdated={handleNameUpdated} forceName={!currentUserRef[0]?.full_name} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} list={list} />
      <NavigateToStoreDialog open={!!navigateProduct} onOpenChange={(v) => !v && setNavigateProduct(null)} product={navigateProduct} />
    </div>
  );
}