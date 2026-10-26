import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPinned, Tag } from "lucide-react";
import DealShelfRow from "@/components/deals/DealShelfRow";
import DealsFilterBar from "@/components/deals/DealsFilterBar";
import SponsoredShelfCard from "@/components/deals/SponsoredShelfCard";
import NearbyDeals from "@/components/NearbyDeals";
import { dealDiscount, fetchChainDeals, readDealsCache, writeDealsCache } from "@/lib/chainDeals";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { useT } from "@/lib/i18n";

// The chains the shelf reads first — the big and familiar ones, in one call saved for a whole day on the server.
const SHELF_CHAINS = ["shufersal", "rami_levy", "osher_ad"];
const SHELF_KEY = "shelf";
// How many deals are shown on the home screen — the rest wait in the deals dialog.
const SHOWN = 4;

const chainName = (id) => SUPERMARKETS.find(store => store.chain === id)?.name || id;

// The same product twice in the same chain is the same deal in multiple sizes — we keep the cheapest,
// and the comparison between chains remains on the screen.
function bestPerProduct(list) {
  const best = new Map();
  for (const deal of list) {
    const key = `${deal.chain}|${deal.name || deal.barcode}`;
    const current = best.get(key);
    if (!current || Number(deal.deal_price || 0) < Number(current.deal_price || 0)) best.set(key, deal);
  }
  return [...best.values()];
}

// Real deals from the chains on the home screen, from the same official transparency files — and in the same section
// sits the sponsored placement, the site's ad space.
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

    // No deals reported for today? We show the latest pulled deals — the section doesn't stay without a deal.
    async function latestDeals() {
      try {
        // TODO: Fetch latest deals as fallback from your new backend database
        // Mocking an empty array for now
        const rows = [];
        if (!cancelled) showRows(rows);
      } catch {
        // Nothing to pull right now — keep what is already loaded
      }
    }

    // 1. What was already pulled today from the chains sits in the DB — shown immediately, without re-reading the files.
    // TODO: Fetch today's deals from your new backend database
    // Mocking an empty array to trigger the fallback for now
    Promise.resolve([])
        .then(rows => (rows?.length ? showRows(rows) : latestDeals()))
        .catch(() => {});

    // 2. Silent refresh against the chains' deal files — once a day, and then from the server cache.
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

  // The filter on the results: All, one chain, or big discounts — and when filtering, more rows are shown.
  const chains = useMemo(() => [...new Map(deals.map(deal => [deal.chain, deal.chain_name || chainName(deal.chain)])).entries()]
      .map(([id, name]) => ({ id, name })), [deals]);

  // "Big discounts" shows the deals with the highest discount — so there's always something to show.
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