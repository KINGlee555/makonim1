import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Clock } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";

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
export default function RecentlyBought({ listId }) {
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
    <section className="mt-5 rounded-[28px] border-[3px] border-market-ink bg-market-surface p-4 shadow-[0_6px_0_hsl(var(--market-ink))]" aria-label={t("recent.title")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[18px] font-black text-market-ink">
          <Clock className="h-5 w-5 text-market-blue" />{t("recent.title")}
        </span>
        <Link to={`/history/${listId}`} className="text-[14px] font-black text-market-blue underline decoration-2 underline-offset-2">
          {t("recent.all")}
        </Link>
      </div>
      <ul className="space-y-2">
        {rows.map(row => (
          <li key={row.id} className="flex items-center gap-3 rounded-2xl border-2 border-market-track bg-card p-2">
            <ProductPhoto name={row.item_name} category={row.category} className="h-11 w-11 flex-shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-extrabold text-market-ink">{row.item_name}</p>
              <p className="truncate text-[13px] font-bold text-market-blue/80">
                {row.bought_by ? `${t("recent.by", { name: row.bought_by })} · ` : ""}{timeAgo(row.created_date, t)}
              </p>
            </div>
            <span className="flex-shrink-0 text-[13px] font-black text-market-pink">×{row.quantity || 1}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}