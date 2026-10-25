import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useChainPrices } from "@/hooks/useChainPrices";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import OpenStoresDialog from "@/components/OpenStoresDialog";
import PickupOrderDialog from "@/components/PickupOrderDialog";
import { bigCard, bigChip, bigNote, bigPill } from "@/lib/bigUi";

// כרטיס הסל: המחיר הזול ביותר בגדול, ומה פתוח עכשיו כדי לצאת לדרך.
export default function SmartTools({ items, onOpenBasket }) {
  const t = useT();
  const [showStores, setShowStores] = useState(false);
  const [showPickup, setShowPickup] = useState(false);
  const { loading, totals, matched } = useChainPrices(items, items.length > 0);

  const cheapest = totals[0];
  const savings = totals.length > 1 ? totals[totals.length - 1].total - cheapest.total : 0;
  // המחיר מבוסס רק על המוצרים שנמצא להם מחיר — אומרים על כמה מתוך הרשימה הוא נשען
  const partialCoverage = matched > 0 && matched < items.length;
  // בשבת נספרות רק הרשתות שפתוחות בשבת
  const now = new Date();
  const openNow = SUPERMARKETS.filter(store => storeStatus(now, store.shabbat).open).length;

  return (
    <>
      <section className={bigCard}>
        {loading ? (
          <p className={`flex items-center gap-2 ${bigNote}`}>
            <Loader2 className="h-5 w-5 animate-spin" />{t("tools.checking")}
          </p>
        ) : cheapest ? (
          <>
            <p className={bigNote}>{t("tools.cheapestLabel")}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[34px] font-semibold leading-none tracking-[0.04em] tabular-nums text-big-accent sm:text-[56px]">₪{cheapest.total.toFixed(2)}</span>
              <span className={bigChip}>{cheapest.name}</span>
            </div>
            {savings > 0 && <p className="mt-1.5 text-[16px] font-semibold text-big-accent sm:text-[20px]">{t("tools.savings", { amount: savings.toFixed(2) })}</p>}
            {partialCoverage && <p className={`mt-1 ${bigNote}`}>{t("tools.basedOn", { found: matched, total: items.length })}</p>}
          </>
        ) : (
          <p className={bigNote}>{t("tools.noPrices")}</p>
        )}

        <p className={`mt-2.5 ${bigNote}`}>
          {openNow > 0 ? t("tools.openNowHint", { count: openNow }) : t("tools.closedToday")}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={onOpenBasket} className={bigPill}>{t("tools.bestValue")}</button>
          <button type="button" onClick={() => setShowStores(true)} className={bigPill}>{t("tools.openNow")}</button>
          <button type="button" onClick={() => setShowPickup(true)} className={bigPill}>{t("pickup.open")}</button>
        </div>
      </section>

      <OpenStoresDialog open={showStores} onOpenChange={setShowStores} />
      <PickupOrderDialog open={showPickup} onOpenChange={setShowPickup} items={items} />
    </>
  );
}