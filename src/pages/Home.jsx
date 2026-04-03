import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "../components/AppHeader";
import ListCard from "../components/ListCard";
import EmptyState from "../components/EmptyState";
import CreateListDialog from "../components/CreateListDialog";

export default function Home() {
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const [allLists, allItems] = await Promise.all([
      base44.entities.ShoppingList.list("-created_date", 50),
      base44.entities.ListItem.list("-created_date", 500)
    ]);
    // Show lists I own or am shared with
    const myLists = allLists.filter(
      l => l.created_by === me.email || (l.shared_with || []).includes(me.email)
    );
    setLists(myLists);
    setItems(allItems);
    setLoading(false);
  };

  const handleCreate = async (title) => {
    const shareCode = Math.random().toString(36).substring(2, 10);
    const newList = await base44.entities.ShoppingList.create({
      title,
      shared_with: [],
      share_code: shareCode
    });
    setLists(prev => [newList, ...prev]);
  };

  const getItemCounts = (listId) => {
    const listItems = items.filter(i => i.list_id === listId);
    return {
      total: listItems.length,
      bought: listItems.filter(i => i.status === "bought").length
    };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppHeader
        title="MaKonim"
        rightAction={
          <Button
            onClick={() => setShowCreate(true)}
            className="h-10 w-10 rounded-xl"
            size="icon"
          >
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {lists.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="אין רשימות עדיין"
            description="צור רשימת קניות חדשה ושתף אותה עם המשפחה"
            action={
              <Button
                onClick={() => setShowCreate(true)}
                className="h-14 px-8 rounded-2xl text-lg font-semibold"
              >
                <Plus className="w-5 h-5 ml-2" />
                רשימה חדשה
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {lists.map(list => {
              const counts = getItemCounts(list.id);
              return (
                <ListCard
                  key={list.id}
                  list={list}
                  itemCount={counts.total}
                  boughtCount={counts.bought}
                />
              );
            })}
          </div>
        )}
      </main>

      <CreateListDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreate={handleCreate}
      />
    </div>
  );
}