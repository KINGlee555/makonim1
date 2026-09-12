import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Crown, Store, TrendingDown } from "lucide-react";
import { useT } from "@/lib/i18n";
import { CHAINS, getSimulatedPrice } from "@/lib/chainPrices";
import ChainLogo from "@/components/ChainLogo";

export default function BasketComparison({ open, onOpenChange, items }) {
  const t = useT();

  const chainTotals = useMemo(() => {
    return CHAINS.map((chain, idx) => {
      const total = items.reduce((sum, item) => sum + getSimulatedPrice(item.name, item.price || 0, idx) * (item.quantity || 1), 0);
      return { ...chain, total, index: idx };
    }).sort((a, b) => a.total - b.total);
  }, [items]);

  const cheapest = chainTotals[0];
  const savings = chainTotals[chainTotals.length - 1].total - cheapest.total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />{t("basket.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("basket.empty")}</p>
          ) : (
            <>
              <div className="bg-primary/10 rounded-2xl p-4 mb-4 flex items-center gap-3">
                <Crown className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t("basket.cheapest")}</p>
                  <p className="text-lg font-bold text-primary flex items-center gap-2">
                    <ChainLogo name={cheapest.name} size={20} />{cheapest.name}
                  </p>
                </div>
                <p className="text-2xl font-bold text-primary">₪{cheapest.total.toFixed(2)}</p>
              </div>
              {savings > 0 && (
                <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2 mb-4">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">{t("basket.savings", { amount: savings.toFixed(2) })}</p>
                </div>
              )}
              <div className="space-y-2">
                {chainTotals.map((chain, idx) => (
                  <div key={chain.name} className={`flex items-center justify-between rounded-2xl p-3 border ${idx === 0 ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex items-center gap-3">
                      <ChainLogo name={chain.name} size={40} className="rounded-xl" />
                      <span className="font-medium text-foreground">{chain.name}</span>
                      {idx === 0 && <Badge className="bg-primary text-primary-foreground text-xs">{t("basket.best")}</Badge>}
                    </div>
                    <span className={`text-lg font-bold ${idx === 0 ? "text-primary" : "text-foreground"}`}>₪{chain.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">{t("basket.disclaimer")}</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}