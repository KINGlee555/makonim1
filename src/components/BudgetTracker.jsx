import { useState, useEffect } from "react";
import { Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadPurchaseHistory } from "@/lib/purchaseHistoryStore";
import { useT } from "@/lib/i18n";

export default function BudgetTracker({ listId }) {
  const t = useT();
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [inputBudget, setInputBudget] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`budget_${listId}`);
    if (saved) setBudget(parseFloat(saved));
    loadPurchaseHistory(listId, 500).then(records => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthSpent = records.filter(r => new Date(r.created_date) >= monthStart)
        .reduce((sum, r) => sum + (r.price || 0) * (r.quantity || 1), 0);
      setSpent(monthSpent);
    }).catch(() => {});
  }, [listId]);

  const handleSave = () => {
    const val = parseFloat(inputBudget);
    if (val > 0) { setBudget(val); localStorage.setItem(`budget_${listId}`, val.toString()); setInputBudget(""); }
  };

  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOver = budget > 0 && spent > budget;
  const isWarning = budget > 0 && pct >= 80 && !isOver;
  const barColor = isOver ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-primary";

  return (
    <div className="bg-muted/50 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{t("budget.title")}</p>
          <p className="text-sm text-muted-foreground truncate">{t("budget.thisMonth")}</p>
        </div>
      </div>
      {budget > 0 ? (
        <>
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-2xl font-bold text-foreground">₪{spent.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground whitespace-nowrap">/ ₪{budget.toFixed(2)}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2">
            {isOver ? (
              <span className="text-sm text-red-500 font-medium flex items-center gap-1 min-w-0">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{t("budget.over")} ₪{Math.abs(remaining).toFixed(2)}</span>
              </span>
            ) : isWarning ? (
              <span className="text-sm text-yellow-600 font-medium flex items-center gap-1 min-w-0">
                <TrendingUp className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{t("budget.warning")}</span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground truncate">{t("budget.remaining")}: ₪{remaining.toFixed(2)}</span>
            )}
            <button onClick={() => { setInputBudget(budget.toString()); setBudget(0); }} className="text-xs text-primary underline whitespace-nowrap flex-shrink-0">{t("budget.set")}</button>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <Input type="number" placeholder={t("budget.placeholder")} value={inputBudget} onChange={e => setInputBudget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()} className="h-10 rounded-xl" />
          <Button onClick={handleSave} disabled={!inputBudget} className="rounded-xl">{t("budget.save")}</Button>
        </div>
      )}
    </div>
  );
}