import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BarChart3 } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import PosterPage from "@/components/poster/PosterPage";
import { useT } from "@/lib/i18n";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import PremiumLock from "@/components/premium/PremiumLock";
import usePremium from "@/hooks/usePremium";

// סיכום ההוצאות בשפת הכרזה: כרטיס דיו עם הסכום הגדול, מקטע לכל חתך, ופסים בצבעי השוק.
export default function ShoppingSummary() {
  const { listId } = useParams();
  const t = useT();
  const { isPremium } = usePremium();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, [listId]);

  const loadHistory = async () => {
    try {
      const data = await base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", 500);
      setRecords(data);
    } catch {}
    setLoading(false);
  };

  const totalSpent = records.reduce((sum, r) => sum + (r.price || 0) * (r.quantity || 1), 0);
  const byCategory = {};
  records.forEach(r => {
    const cat = r.category || t("summary.other");
    if (!byCategory[cat]) byCategory[cat] = { count: 0, total: 0 };
    byCategory[cat].count += 1;
    byCategory[cat].total += (r.price || 0) * (r.quantity || 1);
  });
  const categories = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(...categories.map(c => c[1].total), 1);
  const byBuyer = {};
  records.forEach(r => {
    const buyer = r.bought_by || t("summary.unknown");
    if (!byBuyer[buyer]) byBuyer[buyer] = { count: 0, total: 0 };
    byBuyer[buyer].count += 1;
    byBuyer[buyer].total += (r.price || 0) * (r.quantity || 1);
  });
  const buyers = Object.entries(byBuyer).sort((a, b) => b[1].total - a[1].total);

  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);
  const thisWeekRecords = records.filter(r => new Date(r.created_date) >= thisWeekStart);
  const lastWeekRecords = records.filter(r => { const d = new Date(r.created_date); return d >= lastWeekStart && d < thisWeekStart; });
  const thisWeekTotal = thisWeekRecords.reduce((sum, r) => sum + (r.price || 0) * (r.quantity || 1), 0);
  const lastWeekTotal = lastWeekRecords.reduce((sum, r) => sum + (r.price || 0) * (r.quantity || 1), 0);
  const weekChange = lastWeekTotal > 0 ? Math.round((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100) : null;

  return (
    <PosterPage icon={BarChart3} title={t("summary.title")} subtitle={t("summary.desc")} back={`/list/${listId}`}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B3A4D]/25 border-t-[#0B3A4D]" />
        </div>
      ) : records.length === 0 ? (
        <div className="pst-empty">
          <BarChart3 className="mx-auto mb-3 h-10 w-10" />
          <p className="text-[19px] font-black text-[#0B3A4D]">{t("summary.noData")}</p>
          <p className="mt-1">{t("summary.noDataDesc")}</p>
        </div>
      ) : (
        <>
          <div className="border-[3px] border-[#0B3A4D] bg-[#0B3A4D] p-6 text-[#FFD400] shadow-[6px_6px_0_#FF3B5D]">
            <p className="text-[15px] font-bold">{t("summary.totalSpent")}</p>
            <p className="mt-1 text-[40px] font-black leading-none">₪{totalSpent.toFixed(2)}</p>
            <p className="mt-2 text-[14px] font-bold">{records.length} {t("summary.itemsBought")}</p>
          </div>

          <h2 className="pst-h2">{t("summary.byCategory")}</h2>
          <div className="pst-panel space-y-4">
            {categories.map(([cat, data]) => (
              <div key={cat}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-[15px] font-black">
                    <ProductPhoto name="" category={cat} className="h-9 w-9 flex-none rounded-full border-[3px] border-[#0B3A4D] object-cover" />
                    <span className="truncate">{cat}</span>
                  </span>
                  <span className="flex-none text-[15px] font-black">₪{data.total.toFixed(2)}</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full border-[3px] border-[#0B3A4D] bg-white">
                  <div className="h-full bg-[#FF3B5D]" style={{ width: `${(data.total / maxTotal) * 100}%` }} />
                </div>
                <p className="pst-lrow-s mt-1">{data.count} {t("summary.items")}</p>
              </div>
            ))}
          </div>

          {buyers.length > 0 && (
            <>
              <h2 className="pst-h2 pst-h2-b">{t("summary.byBuyer")}</h2>
              <div>
                {buyers.map(([buyer, data]) => (
                  <div key={buyer} className="pst-lrow">
                    <div className="pst-lrow-t">
                      <p className="truncate">{buyer}</p>
                      <p className="pst-lrow-s">{data.count} {t("summary.items")}</p>
                    </div>
                    <span className="pst-lrow-v">₪{data.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="pst-h2">{t("weekly.title")}</h2>
          <div className="pst-nums">
            <span className="pst-num">
              {t("weekly.thisWeek")}
              <b>₪{thisWeekTotal.toFixed(2)}</b>
            </span>
            <span className="pst-num pst-num-t">
              {t("weekly.lastWeek")}
              <b>₪{lastWeekTotal.toFixed(2)}</b>
            </span>
          </div>
          {weekChange !== null && (
            <p className={`mt-3 inline-flex items-center gap-2 border-[3px] border-[#0B3A4D] px-4 py-2 text-[15px] font-black ${weekChange > 0 ? "bg-[#FF3B5D] text-white" : "bg-[#FFD400]"}`}>
              {weekChange > 0 ? "↑" : "↓"} {Math.abs(weekChange)}% {t("weekly.vsLastWeek")}
            </p>
          )}

          <h2 className="pst-h2">{t("priceHistory.title")}</h2>
          {isPremium ? <PriceHistoryChart records={records} /> : <PremiumLock hint={t("premium.f1")} />}
        </>
      )}
    </PosterPage>
  );
}