import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useChainPrices } from "@/hooks/useChainPrices";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import OpenStoresDialog from "@/components/OpenStoresDialog";
import PickupOrderDialog from "@/components/PickupOrderDialog";
import { uiPill, uiPillRow } from "@/lib/minimalUi";

// כרטיס אחד ברור: כמה עולה הסל הזול ביותר, ומה פתוח עכשיו כדי לצאת לדרך.
export default function SmartTools({ items, onOpenBasket }) {
  const t = useT();
  const [showStores, setShowStores] = useState(false);
  const [showPickup, setShowPickup] = useState(false);
  const { loading, totals } = useChainPrices(items, items.length > 0);

  const cheapest = totals[0];
  const savings = totals.length > 1 ? totals[totals.length - 1].total - cheapest.total : 0;
  // בשבת נספרות רק הרשתות שפתוחות בשבת
  const now = new Date();
  const openNow = SUPERMARKETS.filter(store => storeStatus(now, store.shabbat).open).length;

  return (
    <>
      <section className="rounded-[14px] border border-ui-line bg-ui-canvas p-4">
        {loading ? (
          <p className="flex items-center gap-2 text-[14px] text-ui-muted">
            <Loader2 className="h-4 w-4 animate-spin" />{t("tools.checking")}
          </p>
        ) : cheapest ? (
          <>
            <p className="text-[12px] text-ui-muted">{t("tools.cheapestLabel")}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <b className="text-[30px] font-semibold leading-none tabular-nums text-ui-accent">₪{cheapest.total.toFixed(2)}</b>
              <span className="rounded-full bg-ui-surface px-2.5 py-1 text-[13px] text-ui-ink">{cheapest.name}</span>
            </div>
            {savings > 0 && <p className="mt-1.5 text-[13px] text-ui-accent">{t("tools.savings", { amount: savings.toFixed(2) })}</p>}
          </>
        ) : (
          <p className="text-[14px] text-ui-muted">{t("tools.noPrices")}</p>
        )}

        <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-ui-muted">
          <Clock className="h-3.5 w-3.5" />
          {openNow > 0 ? t("tools.openNowHint", { count: openNow }) : t("tools.closedToday")}
        </p>

        <div className={`${uiPillRow} mt-3`}>
          <button type="button" onClick={onOpenBasket} className={uiPill}>{t("tools.bestValue")}</button>
          <button type="button" onClick={() => setShowStores(true)} className={uiPill}>{t("tools.openNow")}</button>
          <button type="button" onClick={() => setShowPickup(true)} className={uiPill}>{t("pickup.open")}</button>
        </div>
      </section>

      <OpenStoresDialog open={showStores} onOpenChange={setShowStores} />
      <PickupOrderDialog open={showPickup} onOpenChange={setShowPickup} items={items} />
    </>
  );
}