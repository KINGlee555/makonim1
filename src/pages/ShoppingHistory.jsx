import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShoppingBag, History } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import PosterPage from "@/components/poster/PosterPage";
import ReceiptScanner from "@/components/ReceiptScanner";
import PremiumLock from "@/components/premium/PremiumLock";
import usePremium from "@/hooks/usePremium";
import { useT } from "@/lib/i18n";

// Shopping history in poster style: the two large numbers at the top, and each date is a section with product rows.
export default function ShoppingHistory() {
  const { listId } = useParams();
  const t = useT();
  const { isPremium } = usePremium();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, [listId]);

  const loadHistory = async () => {
    try {
      // TODO: Fetch purchase history records for this listId from your new backend database
      // Mocking an empty array for now
      const data = [];
      setRecords(data);
    } catch {}
    setLoading(false);
  };

  const totalSpent = records.reduce((sum, r) => sum + (r.price || 0) * (r.quantity || 1), 0);
  const byDate = {};
  records.forEach(r => {
    const date = new Date(r.created_date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(r);
  });

  return (
      <PosterPage icon={History} title={t("history.title")} subtitle={t("history.desc")} back={`/list/${listId}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="pst-nums">
          <span className="pst-num">
            {t("history.totalExpenses")}
            <b>₪{totalSpent.toFixed(2)}</b>
          </span>
            <span className="pst-num pst-num-t">
            {t("history.itemsBought")}
              <b>{records.length}</b>
          </span>
          </div>
          {isPremium ? <ReceiptScanner listId={listId} onScanned={loadHistory} /> : <PremiumLock hint={t("premium.f3")} />}
        </div>

        {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-pst-ink/25 border-t-pst-ink" />
            </div>
        ) : records.length === 0 ? (
            <div className="pst-empty mt-6">
              <ShoppingBag className="mx-auto mb-3 h-10 w-10" />
              <p className="text-[19px] font-black text-ui-ink">{t("history.noHistory")}</p>
              <p className="mt-1">{t("history.noHistoryDesc")}</p>
            </div>
        ) : (
            Object.entries(byDate).map(([date, items]) => (
                <section key={date}>
                  <h2 className="pst-h2">
                    <span>{date}</span>
                    <small>{items.length}</small>
                  </h2>
                  <div>
                    {items.map(r => (
                        <div key={r.id} className="pst-lrow">
                          <ProductPhoto name={r.item_name} category={r.category}
                                        className="h-12 w-12 flex-none rounded-full border-[3px] border-pst-ink object-cover" />
                          <div className="pst-lrow-t">
                            <p className="truncate">{r.item_name}</p>
                            <p className="pst-lrow-s">
                              {r.quantity > 1 ? `${r.quantity} ${t("history.units")} · ` : ""}₪{(r.price || 0).toFixed(2)}
                              {r.bought_by ? ` · ${r.bought_by}` : ""}
                            </p>
                          </div>
                          <span className="pst-lrow-v">₪{((r.price || 0) * (r.quantity || 1)).toFixed(2)}</span>
                        </div>
                    ))}
                  </div>
                </section>
            ))
        )}
      </PosterPage>
  );
}