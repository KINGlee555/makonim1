import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useT } from "@/lib/i18n";
import { buildMonthlySummary } from "@/lib/monthlySummary";
import { uiEnter, uiSection } from "@/lib/minimalUi";

export default function MonthlySummary({ listId }) {
  const t = useT();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", 400)
      .then(rows => { if (!cancelled) setSummary(buildMonthlySummary(rows)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [listId]);

  if (!summary || summary.thisCount === 0) return null;

  const changes = [...summary.cheaper, ...summary.dearer];

  return (
    <section className={`${uiSection} ${uiEnter}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ui-ink">
          <Wallet className="h-4 w-4 text-ui-accent" />
          {t("monthly.title")}
        </h2>
        <Link to={`/summary/${listId}`} className="text-[13px] text-ui-muted underline underline-offset-4">
          {t("monthly.full")}
        </Link>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-ui-line bg-ui-canvas px-3 py-2">
          <p className="text-[12px] text-ui-muted">{t("monthly.thisMonth")}</p>
          <p className="text-[21px] font-semibold tabular-nums text-ui-ink">₪{summary.thisTotal.toFixed(2)}</p>
          <p className="text-[12px] text-ui-muted">
            {t("monthly.pieces", { count: summary.thisCount })} · {t("monthly.trips", { count: summary.tripCount })}
          </p>
        </div>
        <div className="rounded-2xl border border-ui-line bg-ui-canvas px-3 py-2">
          <p className="text-[12px] text-ui-muted">{t("monthly.lastMonth")}</p>
          <p className="text-[21px] font-semibold tabular-nums text-ui-muted">₪{summary.prevTotal.toFixed(2)}</p>
          <p className="text-[12px] text-ui-muted">
            {summary.deltaPct === null
              ? t("monthly.noCompare")
              : `${summary.deltaPct > 0 ? "↑" : "↓"} ${Math.abs(summary.deltaPct)}% ${t("monthly.vsLastMonth")}`}
          </p>
        </div>
      </div>

      {summary.saved > 0 && (
        <div className="mt-2 flex items-start gap-2 rounded-2xl border border-ui-line-soft px-3 py-2">
          <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-ui-accent" />
          <p className="text-[13px] text-ui-ink">{t("monthly.saved", { amount: summary.saved.toFixed(2) })}</p>
        </div>
      )}
      {summary.extra > 0 && (
        <div className="mt-2 flex items-start gap-2 rounded-2xl border border-ui-line-soft px-3 py-2">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-market-pink" />
          <p className="text-[13px] text-ui-ink">{t("monthly.extra", { amount: summary.extra.toFixed(2) })}</p>
        </div>
      )}

      {changes.length > 0 && (
        <div className="mt-2 rounded-2xl border border-ui-line-soft px-3 py-2">
          <p className="text-[12px] text-ui-muted">{t("monthly.changed")}</p>
          {changes.map(change => (
            <div key={change.name} className="flex items-baseline justify-between gap-3 border-b border-ui-line-soft py-1.5 last:border-b-0">
              <span className="truncate text-[14px] text-ui-ink">{change.name}</span>
              <span className="shrink-0 text-[13px] tabular-nums text-ui-muted">
                ₪{change.before.toFixed(2)} →{" "}
                <b className={change.diff < 0 ? "text-ui-accent" : "text-market-pink"}>₪{change.now.toFixed(2)}</b>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}