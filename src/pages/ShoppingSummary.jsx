import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import AppHeader from "../components/AppHeader";
import { ArrowRight, BarChart3 } from "lucide-react";
import { getProductEmoji } from "@/lib/productEmoji";
import AppFooter from "../components/AppFooter";
import { useT } from "@/lib/i18n";

export default function ShoppingSummary() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, [listId]);

  const loadHistory = async () => {
    try {
      const data = await base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", 500);
      setRecords(data);
    } catch {}
    setLoading(false);
  };

  const totalSpent = records.reduce((sum, r) => sum + (r.price || 0) * (r.quantity || 1), 0);
  const byCategory = {};
  records.forEach(r => {
    const cat = r.category || t("summary.other");
    if (!byCategory[cat]) byCategory[cat] = { count: 0, total: 0 };
    byCategory[cat].count += 1;
    byCategory[cat].total += (r.price || 0) * (r.quantity || 1);
  });
  const categories = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...categories.map(c => c[1].total), 1);
  const byBuyer = {};
  records.forEach(r => {
    const buyer = r.bought_by || t("summary.unknown");
    if (!byBuyer[buyer]) byBuyer[buyer] = { count: 0, total: 0 };
    byBuyer[buyer].count += 1;
    byBuyer[buyer].total += (r.price || 0) * (r.quantity || 1);
  });
  const buyers = Object.entries(byBuyer).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        rightAction={
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate(`/list/${listId}`)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
        }
      />
      <main className="max-w-lg mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground mb-1">{t("summary.title")}</h1>
        <p className="text-muted-foreground mb-4">{t("summary.desc")}</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium text-foreground mb-1">{t("summary.noData")}</p>
            <p className="text-muted-foreground">{t("summary.noDataDesc")}</p>
          </div>
        ) : (
          <>
            <div className="bg-primary text-primary-foreground rounded-2xl p-5 mb-6">
              <p className="text-sm opacity-90">{t("summary.totalSpent")}</p>
              <p className="text-4xl font-bold">₪{totalSpent.toFixed(2)}</p>
              <p className="text-sm opacity-90 mt-1">{records.length} {t("summary.itemsBought")}</p>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">{t("summary.byCategory")}</h3>
            <div className="space-y-3 mb-6">
              {categories.map(([cat, data]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{getProductEmoji("", cat)} {cat}</span>
                    <span className="text-sm font-semibold text-primary">₪{data.total.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(data.total / maxTotal) * 100}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{data.count} {t("summary.items")}</p>
                </div>
              ))}
            </div>

            {buyers.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-foreground mb-3">{t("summary.byBuyer")}</h3>
                <div className="space-y-2">
                  {buyers.map(([buyer, data]) => (
                    <div key={buyer} className="flex items-center justify-between bg-card border border-border rounded-2xl p-3">
                      <div>
                        <p className="font-medium text-foreground">{buyer}</p>
                        <p className="text-xs text-muted-foreground">{data.count} {t("summary.items")}</p>
                      </div>
                      <span className="font-semibold text-primary">₪{data.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        <AppFooter />
      </main>
    </div>
  );
}