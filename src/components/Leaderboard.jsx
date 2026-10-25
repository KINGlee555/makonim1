import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Medal, TrendingDown, ShoppingBag } from "lucide-react";
import { loadPurchaseHistory } from "@/lib/purchaseHistoryStore";
import { useT } from "@/lib/i18n";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ open, onOpenChange, listId }) {
  const t = useT();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!open) return;
    loadPurchaseHistory(listId, 500)
      .then(setHistory).catch(() => {});
  }, [open, listId]);

  const ranking = useMemo(() => {
    const byBuyer = {};
    const bySavings = {};
    history.forEach(h => {
      const name = h.bought_by || "List Owner";
      byBuyer[name] = (byBuyer[name] || 0) + 1;
      // Simulate savings: cheaper purchases = more savings
      const basePrice = h.price || 0;
      const potentialSavings = basePrice * 0.1; // 10% estimated savings
      bySavings[name] = (bySavings[name] || 0) + potentialSavings * (h.quantity || 1);
    });
    return Object.entries(byBuyer)
      .map(([name, count]) => ({ name, count, savings: bySavings[name] || 0 }))
      .sort((a, b) => b.count - a.count || b.savings - a.savings);
  }, [history]);

  const topBuyer = ranking[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />{t("leaderboard.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {topBuyer && (
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-4 mb-4 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-sm text-muted-foreground">{t("leaderboard.champion")}</p>
              <p className="text-xl font-bold text-primary">{topBuyer.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{topBuyer.count} {t("leaderboard.items")}</p>
            </div>
          )}

          <div className="space-y-2">
            {ranking.map((entry, idx) => (
              <div key={entry.name} className={`flex items-center gap-3 rounded-2xl p-3 border ${idx === 0 ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                <span className="text-2xl w-10 text-center">{idx < 3 ? MEDALS[idx] : <span className="text-lg font-bold text-muted-foreground">{idx + 1}</span>}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{entry.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{entry.count} {t("leaderboard.items")}</span>
                    <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3" />₪{entry.savings.toFixed(2)} {t("leaderboard.saved")}</span>
                  </div>
                </div>
                {idx === 0 && <Medal className="w-5 h-5 text-primary" />}
              </div>
            ))}
            {ranking.length === 0 && (
              <p className="text-center text-muted-foreground py-8">{t("leaderboard.noData")}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}