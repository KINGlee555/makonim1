import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import AppHeader from "../components/AppHeader";
import { ArrowRight, ShoppingBag, TrendingDown } from "lucide-react";
import { getProductEmoji } from "@/lib/productEmoji";
import AppFooter from "../components/AppFooter";

export default function ShoppingHistory() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [listId]);

  const loadHistory = async () => {
    try {
      const data = await base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", 500);
      setRecords(data);
    } catch {}
    setLoading(false);
  };

  const totalSpent = records.reduce((sum, r) => sum + (r.price || 0) * (r.quantity || 1), 0);

  // Group by date
  const byDate = {};
  records.forEach(r => {
    const date = new Date(r.created_date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(r);
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AppHeader
        rightAction={
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate(`/list/${listId}`)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
        }
      />

      <main className="max-w-lg mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground mb-1">היסטוריית קניות</h1>
        <p className="text-muted-foreground mb-4">כל הפריטים שנקנו ברשימה זו</p>

        {/* Summary card */}
        <div className="bg-primary/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">סה"כ הוצאות</p>
            <p className="text-2xl font-bold text-primary">₪{totalSpent.toFixed(2)}</p>
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">פריטים שנקנו</p>
            <p className="text-2xl font-bold text-foreground">{records.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium text-foreground mb-1">אין עדיין היסטוריה</p>
            <p className="text-muted-foreground">פריטים שנקנו ונמחקו יופיעו כאן</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byDate).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">{date}</h3>
                <div className="space-y-2">
                  {items.map(r => (
                    <div key={r.id} className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{getProductEmoji(r.item_name, r.category)}</span>
                      </div>
                      <div className="flex-1 min-w0">
                        <p className="font-medium text-foreground truncate">{r.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.quantity > 1 ? `${r.quantity} יח' · ` : ""}₪{(r.price || 0).toFixed(2)}
                          {r.bought_by ? ` · ${r.bought_by}` : ""}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ₪{((r.price || 0) * (r.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <AppFooter />
      </main>
    </div>
  );
}