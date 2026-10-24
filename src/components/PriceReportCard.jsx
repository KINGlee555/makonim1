import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { useT } from "@/lib/i18n";

// כרטיס אחד בעמוד אישור דיווחי המחיר: המחיר המוצג היום מול המחיר שנצפה בחנות.
export default function PriceReportCard({ report, busy, onApprove, onReject }) {
  const t = useT();
  return (
    <article className="rounded-3xl border-[3px] border-market-ink bg-market-surface p-4 shadow-[0_6px_0_hsl(var(--market-ink))]">
      <h3 className="text-[19px] font-black leading-tight text-market-ink">{report.item_name}</h3>
      <p className="text-xs font-bold text-muted-foreground">
        {[report.chain_name, report.barcode].filter(Boolean).join(" · ")}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-border p-3 text-center">
          <span className="block text-xs font-bold text-muted-foreground">{t("adminPrices.shown")}</span>
          <span className="text-[20px] font-black text-market-ink">₪{Number(report.shown_price || 0).toFixed(2)}</span>
        </div>
        <div className="rounded-2xl border-[3px] border-market-pink p-3 text-center">
          <span className="block text-xs font-bold text-market-pink">{t("adminPrices.seen")}</span>
          <span className="text-[20px] font-black text-market-pink">₪{Number(report.seen_price || 0).toFixed(2)}</span>
        </div>
      </div>

      {report.note && <p className="mt-2 text-sm font-bold text-muted-foreground">{report.note}</p>}
      <p className="mt-1 text-xs font-bold text-muted-foreground">
        {report.reported_by_name ? `${t("adminPrices.by")} ${report.reported_by_name}` : ""}
      </p>

      <div className="mt-3 flex gap-2">
        <Button onClick={() => onApprove(report)} disabled={busy}
          className="h-11 flex-1 rounded-2xl bg-primary text-base font-black text-primary-foreground hover:bg-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="me-1.5 h-4 w-4" />}{t("admin.approve")}
        </Button>
        <Button onClick={() => onReject(report)} disabled={busy} variant="outline"
          className="h-11 flex-1 rounded-2xl border-2 border-market-ink text-base font-black text-market-ink">
          <X className="me-1.5 h-4 w-4" />{t("admin.reject")}
        </Button>
      </div>
    </article>
  );
}