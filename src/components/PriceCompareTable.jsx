import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Scale, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useChainPrices } from "@/hooks/useChainPrices";
import ChainLogo from "@/components/ChainLogo";

export default function PriceCompareTable({ open, onOpenChange, items }) {
  const t = useT();
  const { loading, error, rows, totals, matched, day } = useChainPrices(items, open);

  const totalSaving = rows.reduce((sum, row) => sum + row.diff, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start text-xl font-bold">
            <Scale className="h-5 w-5 text-primary" />{t("compare.title")}
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 || rows.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {loading ? t("compare.loading")
              : items.length === 0 ? t("compare.empty")
              : error ? t("basket.error")
              : t("basket.noMatch")}
          </p>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />{t("compare.loading")}
              </div>
            )}
            <div className="rounded-2xl bg-primary/10 p-3 text-center">
              <p className="text-sm text-muted-foreground">{t("compare.potentialSaving")}</p>
              <p className="text-2xl font-bold text-primary">₪{totalSaving.toFixed(2)}</p>
            </div>

            <div>
              <table className="w-full table-fixed border-collapse text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="p-1.5 text-start font-semibold">{t("compare.product")}</th>
                    <th className="p-1.5 text-center font-semibold">{t("compare.cheapestChain")}</th>
                    <th className="p-1.5 text-center font-semibold">{t("compare.priciest")}</th>
                    <th className="p-1.5 text-center font-semibold">{t("compare.diff")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-1.5 font-semibold text-foreground">{row.name}</td>
                      <td className="p-1.5 text-center">
                        <span className="block font-bold text-primary">₪{row.min.toFixed(2)}</span>
                        <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <ChainLogo name={row.best} size={14} />{row.best}
                        </span>
                      </td>
                      <td className="p-1.5 text-center text-foreground">₪{row.max.toFixed(2)}</td>
                      <td className="p-1.5 text-center font-bold text-destructive">₪{row.diff.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary/30">
                    <td className="p-1.5 font-bold text-foreground">{t("compare.total")}</td>
                    <td className="p-1.5 text-center">
                      <span className="block font-bold text-primary">₪{totals[0].total.toFixed(2)}</span>
                      <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <ChainLogo name={totals[0].name} size={14} />{totals[0].name}
                      </span>
                    </td>
                    <td className="p-1.5 text-center text-foreground">₪{totals[totals.length - 1].total.toFixed(2)}</td>
                    <td className="p-1.5 text-center font-bold text-destructive">
                      ₪{(totals[totals.length - 1].total - totals[0].total).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-center text-xs text-muted-foreground">{t("compare.matched", { matched, total: items.length })}</p>
            <p className="text-center text-xs text-muted-foreground">
              {t("basket.disclaimer")}{day ? ` · ${t("basket.updated", { day })}` : ""}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}