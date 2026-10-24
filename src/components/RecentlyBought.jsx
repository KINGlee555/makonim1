import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";
import { uiSection, uiLink, uiEnter } from "@/lib/minimalUi";

const LIMIT = 6;

function timeAgo(value, t) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return t("recent.now");
  if (minutes < 60) return t("recent.minutes", { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t("recent.hours", { count: hours });
  return t("recent.days", { count: Math.round(hours / 24) });
}

// מה שכבר נקנה נשאר על המסך הראשון — כולל מי מהמשתתפים לחץ "קניתי"
export default function RecentlyBought({ listId, delay = 0 }) {
  const t = useT();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", LIMIT)
      .then(records => { if (!cancelled) setRows(records); })
      .catch(() => {});
    load();
    const unsubscribe = base44.entities.PurchaseHistory.subscribe((event) => {
      if (event.type === "delete" || event.data?.list_id === listId) load();
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [listId]);

  if (rows.length === 0) return null;

  return (
    <section className={`${uiSection} ${uiEnter}`} style={{ animationDelay: `${delay}s` }} aria-label={t("recent.title")}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[15px] font-semibold text-ui-ink">{t("recent.title")}</span>
        <Link to={`/history/${listId}`} className={`${uiLink} no-underline`}>{t("recent.all")}</Link>
      </div>
      <ul>
        {rows.map(row => (
          <li key={row.id} className="flex items-center gap-3 border-b border-ui-line-soft py-1.5">
            <ProductPhoto name={row.item_name} category={row.category} className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-ui-ink">{row.item_name}</p>
              <p className="truncate text-[12px] text-ui-muted">
                {row.bought_by ? `${t("recent.by", { name: row.bought_by })} · ` : ""}{timeAgo(row.created_date, t)}
              </p>
            </div>
            <span className="flex-shrink-0 text-[13px] tabular-nums text-ui-muted">×{row.quantity || 1}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}