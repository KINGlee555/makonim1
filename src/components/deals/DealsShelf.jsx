import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPinned, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DealShelfRow from "@/components/deals/DealShelfRow";
import DealsFilterBar from "@/components/deals/DealsFilterBar";
import SponsoredShelfCard from "@/components/deals/SponsoredShelfCard";
import NearbyDeals from "@/components/NearbyDeals";
import { dealDiscount, fetchChainDeals, readDealsCache, writeDealsCache } from "@/lib/chainDeals";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { useT } from "@/lib/i18n";

// הרשתות שהפס קורא ראשון — הגדולות והמוכרות, בקריאה אחת שנשמרת ליום שלם בשרת.
const SHELF_CHAINS = ["shufersal", "rami_levy", "osher_ad"];
const SHELF_KEY = "shelf";
// כמה מבצעים מוצגים על מסך הבית — כל השאר מחכים בחלון המבצעים.
const SHOWN = 4;

const chainName = (id) => SUPERMARKETS.find(store => store.chain === id)?.name || id;

// אותו מוצר פעמיים באותה רשת הוא אותו מבצע בכמה מידות — נשאר הזול,
// וההשוואה בין הרשתות נשארת על המסך.
function bestPerProduct(list) {
  const best = new Map();
  for (const deal of list) {
    const key = `${deal.chain}|${deal.name || deal.barcode}`;
    const current = best.get(key);
    if (!current || Number(deal.deal_price || 0) < Number(current.deal_price || 0)) best.set(key, deal);
  }
  return [...best.values()];
}

// מבצעים אמיתיים מהרשתות על מסך הבית, מאותם קבצי שקיפות רשמיים — ובאותו מקטע
// יושב גם המקום הממומן, שטח הפרסום של האתר.
export default function DealsShelf({ onAddProduct, onOpenAllDeals, bare = false }) {
  const t = useT();
  const [deals, setDeals] = useState(() => readDealsCache(SHELF_KEY));
  const [loading, setLoading] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const day = new Date().toISOString().slice(0, 10);

    const showRows = (rows) => setDeals(current => (current.length
      ? current
      : bestPerProduct((rows || []).map(row => ({ ...row, chain_name: row.chain_name || chainName(row.chain) })))));

    // אין מבצעים מדווחים להיום? מציגים את המבצעים האחרונים שנמשכו — המקטע לא נשאר בלי מבצע.
    async function latestDeals() {
      try {
        const rows = await base44.entities.ChainDeal.filter({ deal_price: { $gt: 0 } }, "-day", 60);
        if (!cancelled) showRows(rows);
      } catch {
        // אין מה למשוך כרגע — נשאר מה שכבר נטען
      }
    }

    // 1. מה שכבר נמשך היום מהרשתות יושב במסד — מוצג מיד, בלי לקרוא שוב לקבצים
    base44.entities.ChainDeal.filter({ day, deal_price: { $gt: 0 } }, "-created_date", 60)
      .then(rows => (rows?.length ? showRows(rows) : latestDeals()))
      .catch(() => {});

    // 2. רענון שקט מול קבצי המבצעים של הרשתות — פעם ביום, ואחר כך מהמטמון של השרת
    const timer = setTimeout(() => {
      setLoading(true);
      fetchChainDeals({ mode: "popular", chains: SHELF_CHAINS })
        .then(data => {
          if (cancelled) return;
          const list = bestPerProduct((data.deals || []).filter(deal => deal.name));
          if (!list.length) return;
          setDeals(list);
          writeDealsCache(SHELF_KEY, list);
        })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 3000);

    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const addDeal = (deal) => onAddProduct?.({
    name: deal.name || deal.barcode, barcode: deal.barcode || "",
    price: deal.deal_price || 0, category: t("summary.other"), image_url: "",
  });

  // הסינון על התוצאות: הכול, רשת אחת, או ההנחות הגדולות — וכשמסננים מציגים יותר שורות.
  const chains = useMemo(() => [...new Map(deals.map(deal => [deal.chain, deal.chain_name || chainName(deal.chain)])).entries()]
    .map(([id, name]) => ({ id, name })), [deals]);
  // "הנחות גדולות" מציג את המבצעים עם ההנחה הגדולה ביותר — כך תמיד יש מה להראות.
  const matches = filter === "all" ? deals
    : filter === "big" ? [...deals].sort((a, b) => dealDiscount(b) - dealDiscount(a)).slice(0, 12)
      : deals.filter(deal => deal.chain === filter);
  const shown = matches.slice(0, filter === "all" ? SHOWN : SHOWN * 3);

  return (
    <section className={bare ? undefined : "pst-panel-slot"}>
      <h2 className="pst-h2">
        <Tag className="h-5 w-5 flex-none" />
        {t("shelf.title")}
        <small>{t("deals.updated")}</small>
      </h2>

      <div className={bare ? undefined : "pst-panel"}>
        <SponsoredShelfCard />

        {deals.length > 0 && <DealsFilterBar value={filter} onChange={setFilter} chains={chains} />}

        {shown.map((deal, index) => (
          <DealShelfRow key={`${deal.chain}-${deal.barcode}-${index}`} deal={deal} onAdd={addDeal} />
        ))}

        {loading && !shown.length && (
          <p className="flex items-center justify-center gap-2 pt-4 text-[14px] font-bold">
            <Loader2 className="h-4 w-4 animate-spin" />{t("deals.loading")}
          </p>
        )}
        {!loading && !shown.length && (
          <p className="pst-empty mt-3">{deals.length ? t("filter.none") : t("shelf.empty")}</p>
        )}

        <div className="pst-acts">
          <button type="button" onClick={onOpenAllDeals} className="pst-btn pst-btn-sm">{t("shelf.all")}</button>
          <button type="button" onClick={() => setShowNearby(value => !value)} aria-expanded={showNearby}
            className="pst-btn pst-btn-sm pst-btn-s">
            <MapPinned className="h-4 w-4" />{t("shelf.nearby")}
          </button>
        </div>
      </div>

      {showNearby && <NearbyDeals onAddProduct={onAddProduct} />}
    </section>
  );
}