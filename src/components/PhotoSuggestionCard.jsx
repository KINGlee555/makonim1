import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { useT } from "@/lib/i18n";

// כרטיס אחד בעמוד אישור התמונות: התמונה שמוצגת היום מול התמונה המוצעת.
export default function PhotoSuggestionCard({ suggestion, busy, onApprove, onReject }) {
  const t = useT();
  return (
    <article className="rounded-3xl border-[3px] border-market-ink bg-market-surface p-4 shadow-[0_6px_0_hsl(var(--market-ink))]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[19px] font-black leading-tight text-market-ink">{suggestion.product_name}</h3>
          <p className="text-xs font-bold text-muted-foreground">
            {suggestion.submitted_by_name ? `${t("admin.by")} ${suggestion.submitted_by_name}` : ""}
            {suggestion.barcode ? ` · ${suggestion.barcode}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <img src={suggestion.current_image_url || ""} alt="" className="h-32 w-full rounded-2xl border-2 border-border object-cover" />
          <span className="mt-1 block text-center text-xs font-bold text-muted-foreground">{t("admin.current")}</span>
        </div>
        <div>
          <img src={suggestion.suggested_image_url} alt="" className="h-32 w-full rounded-2xl border-[3px] border-market-pink object-cover" />
          <span className="mt-1 block text-center text-xs font-bold text-market-pink">{t("admin.suggested")}</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button onClick={() => onApprove(suggestion)} disabled={busy}
          className="h-11 flex-1 rounded-2xl bg-primary text-base font-black text-primary-foreground hover:bg-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="me-1.5 h-4 w-4" />}{t("admin.approve")}
        </Button>
        <Button onClick={() => onReject(suggestion)} disabled={busy} variant="outline"
          className="h-11 flex-1 rounded-2xl border-2 border-market-ink text-base font-black text-market-ink">
          <X className="me-1.5 h-4 w-4" />{t("admin.reject")}
        </Button>
      </div>
    </article>
  );
}