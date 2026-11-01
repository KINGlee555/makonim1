import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Crown, Store, TrendingDown, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useChainPrices } from "@/hooks/useChainPrices";
import ChainLogo from "@/components/ChainLogo";

export default function BasketComparison({ open, onOpenChange, items, onOpenSources }) {
  const t = useT();
  const { loading, error, totals, matched, coverage, day, refreshing } = useChainPrices(items, open);

  const complete = totals.filter(chain => chain.covered === items.length);
  const cheapest = complete[0];
  const savings = complete.length > 1 ? complete[complete.length - 1].total - cheapest.total : 0;

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
          ) : loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-sm">{t("basket.loading")}</p>
            </div>
          ) : totals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{error ? t("basket.error") : t("basket.noMatch")}</p>
          ) : (
            <>
              {!cheapest && <p className="mb-3 rounded-xl bg-muted p-3 text-sm font-bold text-muted-foreground">אין עדיין מחיר לכל הסל באותה רשת. מוצגים סכומים חלקיים בלבד, בלי לקבוע מי הכי זול.</p>}
              {cheapest && <div className="bg-primary/10 rounded-2xl p-4 mb-4 flex items-center gap-3">
                <Crown className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t("basket.cheapest")}</p>
                  <p className="text-lg font-bold text-primary flex items-center gap-2">
                    <ChainLogo name={cheapest.name} size={20} />{cheapest.name}
                  </p>
                </div>
                <p className="text-2xl font-bold text-primary">₪{cheapest.total.toFixed(2)}</p>
              </div>}
              {savings > 0 && (
                <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2 mb-4">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">{t("basket.savings", { amount: savings.toFixed(2) })}</p>
                </div>
              )}
              {refreshing && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />{t("basket.more")}
                </div>
              )}
              <div className="space-y-2">
                {totals.map((chain, idx) => (
                  <div key={chain.id} className={`flex items-center justify-between gap-2 rounded-2xl p-3 border ${idx === 0 ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <ChainLogo name={chain.name} size={40} className="rounded-xl flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium text-foreground">{chain.name}</span>
                        {chain.covered < items.length && (
                          <p className="text-xs text-muted-foreground">{t("basket.coverage", { found: chain.covered, total: items.length })}</p>
                        )}
                      </div>
                      {chain.id === cheapest?.id && <Badge className="bg-primary text-primary-foreground text-xs flex-shrink-0">{t("basket.best")}</Badge>}
                    </div>
                    <span className={`text-lg font-bold flex-shrink-0 ${idx === 0 ? "text-primary" : "text-foreground"}`}>₪{chain.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {coverage < items.length && <p className="text-xs text-muted-foreground text-center mt-4">נמצאו מחירים לעד {coverage} מתוך {items.length} מוצרים בכל רשת. מחירים חסרים אינם נחשבים לאפס.</p>}
              <p className="text-xs text-muted-foreground text-center mt-2">
                {t("basket.disclaimer")}{day ? ` · ${t("basket.updated", { day })}` : ""}
              </p>
              {onOpenSources && (
                <button type="button" onClick={onOpenSources}
                  className="mx-auto mt-2 block text-[13px] text-primary underline underline-offset-4">
                  {t("sources.open")}
                </button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}