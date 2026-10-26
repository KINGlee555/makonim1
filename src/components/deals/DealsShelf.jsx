import { useEffect, useState } from "react";
import { Loader2, MapPinned, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DealShelfRow from "@/components/deals/DealShelfRow";
import SponsoredShelfCard from "@/components/deals/SponsoredShelfCard";
import NearbyDeals from "@/components/NearbyDeals";
import { fetchChainDeals, readDealsCache, writeDealsCache } from "@/lib/chainDeals";
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

  useEffect(() => {
    let cancelled = false;
    const day = new Date().toISOString().slice(0, 10);

    // 1. מה שכבר נמשך היום מהרשתות יושב במסד — מוצג מיד, בלי לקרוא שוב לקבצים
    base44.entities.ChainDeal.filter({ day, deal_price: { $gt: 0 } }, "-created_date", 60)
      .then(rows => {
        if (cancelled || !rows?.length) return;
        setDeals(current => (current.length
          ? current
          : bestPerProduct(rows.map(row => ({ ...row, chain_name: row.chain_name || chainName(row.chain) })))));
      })
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

  const shown = deals.slice(0, SHOWN);

  return (
    <section className={bare ? undefined : "pst-panel-slot"}>
      <h2 className="pst-h2">
        <Tag className="h-5 w-5 flex-none" />
        {t("shelf.title")}
        <small>{t("deals.updated")}</small>
      </h2>

      <div className={bare ? undefined : "pst-panel"}>
        <SponsoredShelfCard />

        {shown.map((deal, index) => (
          <DealShelfRow key={`${deal.chain}-${deal.barcode}-${index}`} deal={deal} onAdd={addDeal} />
        ))}

        {loading && !shown.length && (
          <p className="flex items-center justify-center gap-2 pt-4 text-[14px] font-bold">
            <Loader2 className="h-4 w-4 animate-spin" />{t("deals.loading")}
          </p>
        )}
        {!loading && !shown.length && <p className="pst-empty mt-3">{t("shelf.empty")}</p>}

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