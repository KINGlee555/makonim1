import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Share2, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "../components/AppHeader";
import ProductItem from "../components/ProductItem";
import QuickAddBar from "../components/QuickAddBar";
import ShareDialog from "../components/ShareDialog";
import ProductSearchDialog from "../components/ProductSearchDialog";
import { toast } from "@/components/ui/use-toast";

export default function ListView() {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
  }, [loadData]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.ListItem.subscribe((event) => {
      if (event.data?.list_id !== listId && event.type !== "delete") return;
      
      if (event.type === "create") {
        setItems(prev => {
          if (prev.some(i => i.id === event.data.id)) return prev;
          return [event.data, ...prev];
        });
      } else if (event.type === "update") {
        setItems(prev => prev.map(i => i.id === event.id ? event.data : i));
      } else if (event.type === "delete") {
        setItems(prev => prev.filter(i => i.id !== event.id));
      }
    });
    return unsubscribe;
  }, [listId]);

  const handleToggleBought = async (item) => {
    const newStatus = item.status === "bought" ? "pending" : "bought";
    const me = await base44.auth.me();
    await base44.entities.ListItem.update(item.id, {
      status: newStatus,
      bought_by: newStatus === "bought" ? me.full_name || me.email : ""
    });
    setItems(prev =>
      prev.map(i =>
        i.id === item.id ? { ...i, status: newStatus, bought_by: newStatus === "bought" ? me.full_name || me.email : "" } : i
      )
    );
  };

  const handleUpdateQuantity = async (item, qty) => {
    await base44.entities.ListItem.update(item.id, { quantity: qty });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: qty } : i));
  };

  const handleQuickAdd = async (name) => {
    const newItem = await base44.entities.ListItem.create({
      list_id: listId,
      name,
      status: "pending",
      quantity: 1,
      price: 0,
      category: "אחר"
    });
    setItems(prev => [newItem, ...prev]);
  };

  const handleAddProduct = async (product) => {
    const newItem = await base44.entities.ListItem.create({
      list_id: listId,
      name: product.name,
      price: product.price || 0,
      image_url: product.image_url || "",
      category: product.category || "אחר",
      status: "pending",
      quantity: 1
    });
    setItems(prev => [newItem, ...prev]);
    toast({ title: `${product.name} נוסף לרשימה` });
  };

  const handleAddUser = async (email) => {
    const updated = [...(list.shared_with || []), email];
    await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    setList(prev => ({ ...prev, shared_with: updated }));
    toast({ title: `${email} נוסף לרשימה` });
  };

  const handleRemoveUser = async (email) => {
    const updated = (list.shared_with || []).filter(e => e !== email);
    await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    setList(prev => ({ ...prev, shared_with: updated }));
  };

  const handleClearBought = async () => {
    const boughtItems = items.filter(i => i.status === "bought");
    await Promise.all(boughtItems.map(i => base44.entities.ListItem.delete(i.id)));
    setItems(prev => prev.filter(i => i.status !== "bought"));
    toast({ title: "המוצרים שנקנו נמחקו" });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" dir="rtl">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">הרשימה לא נמצאה</p>
        </div>
      </div>
    );
  }

  const pendingItems = items.filter(i => i.status !== "bought");
  const boughtItems = items.filter(i => i.status === "bought");

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <AppHeader
        subtitle="רשימת קניות משותפת"
        backTo="/"
        rightAction={
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setShowShare(true)}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        }
      />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Summary */}
        <div className="flex items-center gap-4 mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-base text-muted-foreground">{pendingItems.length} לקנות</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <span className="text-base text-muted-foreground">{boughtItems.length} נקנו</span>
          </div>
          {items.length > 0 && (
            <div className="mr-auto text-left">
              <span className="text-sm text-muted-foreground">סה״כ: </span>
              <span className="text-base font-bold text-primary">
                ₪{items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Pending items */}
        {pendingItems.length > 0 && (
          <div className="space-y-2 mb-6">
            {pendingItems.map(item => (
              <ProductItem
                key={item.id}
                item={item}
                onToggleBought={handleToggleBought}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        )}

        {pendingItems.length === 0 && boughtItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium text-foreground mb-1">הרשימה ריקה</p>
            <p className="text-muted-foreground text-lg">הוסף מוצרים עם הכפתור למטה</p>
          </div>
        )}

        {/* Bought items */}
        {boughtItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-lg font-semibold text-muted-foreground">נקנו ✓</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleClearBought}
              >
                <Trash2 className="w-4 h-4 ml-1" />
                נקה
              </Button>
            </div>
            <div className="space-y-2">
              {boughtItems.map(item => (
                <ProductItem
                  key={item.id}
                  item={item}
                  onToggleBought={handleToggleBought}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <QuickAddBar onQuickAdd={handleQuickAdd} onOpenSearch={() => setShowSearch(true)} />

      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        list={list}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
      />

      <ProductSearchDialog
        open={showSearch}
        onOpenChange={setShowSearch}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}