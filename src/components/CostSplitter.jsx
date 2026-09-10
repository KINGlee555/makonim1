import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Minus, Receipt, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

export default function CostSplitter({ open, onOpenChange, listId, list }) {
  const t = useT();
  const [history, setHistory] = useState([]);
  const [payments, setPayments] = useState({});
  const [newPayment, setNewPayment] = useState({ who: "", amount: "" });

  useEffect(() => {
    if (!open) return;
    base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", 500)
      .then(setHistory).catch(() => {});
  }, [open, listId]);

  const byBuyer = useMemo(() => {
    const totals = {};
    history.forEach(h => {
      const name = h.bought_by || "List Owner";
      totals[name] = (totals[name] || 0) + (h.price || 0) * (h.quantity || 1);
    });
    return totals;
  }, [history]);

  const totalSpent = useMemo(() => Object.values(byBuyer).reduce((sum, v) => sum + v, 0), [byBuyer]);

  const totalPaid = useMemo(() => Object.values(payments).reduce((sum, v) => sum + v, 0), [payments]);
  const balance = totalSpent - totalPaid;

  const perPersonShare = useMemo(() => {
    const count = Object.keys(byBuyer).length || 1;
    return totalSpent / count;
  }, [byBuyer, totalSpent]);

  const addPayment = () => {
    const amt = parseFloat(newPayment.amount);
    if (!newPayment.who || !amt) return;
    setPayments(prev => ({ ...prev, [newPayment.who]: (prev[newPayment.who] || 0) + amt }));
    setNewPayment({ who: "", amount: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />{t("split.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
          <div className="bg-primary/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">{t("split.totalSpent")}</p>
            <p className="text-3xl font-bold text-primary">₪{totalSpent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("split.perPerson", { amount: perPersonShare.toFixed(2) })}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />{t("split.byBuyer")}
            </p>
            <div className="space-y-2">
              {Object.entries(byBuyer).map(([name, amount]) => {
                const paid = payments[name] || 0;
                const owes = perPersonShare - paid;
                return (
                  <div key={name} className="bg-card border border-border rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{name}</span>
                      <span className="text-lg font-bold text-foreground">₪{amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("split.paid")}: ₪{paid.toFixed(2)}</span>
                      {owes > 0 ? (
                        <span className="text-red-500 font-medium">{t("split.owes")} ₪{owes.toFixed(2)}</span>
                      ) : (
                        <span className="text-green-600 font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5" />{t("split.settled")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {Object.keys(byBuyer).length === 0 && (
                <p className="text-center text-muted-foreground py-4">{t("split.noData")}</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">{t("split.addPayment")}</p>
            <div className="flex gap-2">
              <Input placeholder={t("split.name")} value={newPayment.who} onChange={e => setNewPayment(p => ({ ...p, who: e.target.value }))} className="h-10 rounded-xl" />
              <Input type="number" placeholder="₪" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))} onKeyDown={e => e.key === "Enter" && addPayment()} className="h-10 rounded-xl w-24" />
              <Button onClick={addPayment} className="h-10 w-10 rounded-xl p-0"><Plus className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}