import { useState } from "react";
import { Loader2, Store, TrendingDown } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useChainPrices } from "@/hooks/useChainPrices";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import OpenStoresDialog from "@/components/OpenStoresDialog";
import PickupOrderDialog from "@/components/PickupOrderDialog";

// שני הכלים שעוזרים הכי הרבה, ישר על המסך הראשון:
// כמה הסל עולה בכל רשת, ומה פתוח עכשיו כדי לצאת לדרך.
export default function SmartTools({ items, onOpenBasket }) {
  const t = useT();
  const [showStores, setShowStores] = useState(false);
  const [showPickup, setShowPickup] = useState(false);
  const { loading, totals } = useChainPrices(items, items.length > 0);

  const cheapest = totals[0];
  const savings = totals.length > 1 ? totals[totals.length - 1].total - cheapest.total : 0;
  const openNow = SUPERMARKETS.filter(store => storeStatus().open).length;

  return (
    <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button onClick={onOpenBasket}
          className="flex flex-col items-start gap-1 rounded-[28px] border-[3px] border-market-ink bg-market-pink px-5 py-4 text-start shadow-[0_6px_0_hsl(var(--market-ink))]">
          <span className="flex items-center gap-2 text-[15px] font-black text-white">
            <Store className="h-4 w-4" />{t("tools.bestValue")}
          </span>
          <span className="text-[19px] font-black leading-tight text-white">
            {loading ? (
              <span className="flex items-center gap-2">{t("tools.checking")}<Loader2 className="h-4 w-4 animate-spin" /></span>
            ) : cheapest ? (
              t("tools.cheapestAt", { chain: cheapest.name, total: cheapest.total.toFixed(2) })
            ) : (
              t("tools.noPrices")
            )}
          </span>
          <span className="text-[13px] font-bold text-white/90">
            {!loading && savings > 0 ? (
              <span className="flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" />{t("tools.savings", { amount: savings.toFixed(2) })}</span>
            ) : (
              t("tools.bestValueHint")
            )}
          </span>
        </button>

        <button onClick={() => setShowStores(true)}
          className="flex flex-col items-start gap-1 rounded-[28px] border-[3px] border-market-ink bg-market-yellow px-5 py-4 text-start shadow-[0_6px_0_hsl(var(--market-ink))]">
          <span className="flex items-center gap-2 text-[15px] font-black text-market-ink">
            <Store className="h-4 w-4" />{t("tools.openNow")}
          </span>
          <span className="text-[19px] font-black leading-tight text-market-ink">
            {openNow > 0 ? t("tools.openNowHint", { count: openNow }) : t("tools.closedToday")}
          </span>
          <span className="text-[13px] font-bold text-market-ink/80">{t("tools.openNowTap")}</span>
        </button>

        <button onClick={() => setShowPickup(true)}
          className="flex flex-col items-start gap-1 rounded-[28px] border-[3px] border-market-ink bg-market-blue px-5 py-4 text-start shadow-[0_6px_0_hsl(var(--market-ink))] sm:col-span-2">
          <span className="flex items-center gap-2 text-[15px] font-black text-white">
            <Store className="h-4 w-4" />{t("pickup.open")}
          </span>
          <span className="text-[19px] font-black leading-tight text-white">{t("pickup.toolsHint")}</span>
          <span className="text-[13px] font-bold text-white/90">{t("pickup.toolsDesc")}</span>
        </button>
      </div>

      <OpenStoresDialog open={showStores} onOpenChange={setShowStores} />
      <PickupOrderDialog open={showPickup} onOpenChange={setShowPickup} items={items} />
    </>
  );
}