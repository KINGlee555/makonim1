import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useChainPrices } from "@/hooks/useChainPrices";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import OpenStoresDialog from "@/components/OpenStoresDialog";
import PickupOrderDialog from "@/components/PickupOrderDialog";
import { uiPill, uiPillRow } from "@/lib/minimalUi";

// שני הכלים שעוזרים הכי הרבה, ישר על המסך הראשון:
// כמה הסל עולה בכל רשת, ומה פתוח עכשיו כדי לצאת לדרך.
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

  const priceStatus = loading
    ? t("tools.checking")
    : cheapest
      ? [t("tools.cheapestAt", { chain: cheapest.name, total: cheapest.total.toFixed(2) }), savings > 0 ? t("tools.savings", { amount: savings.toFixed(2) }) : ""].filter(Boolean).join(" · ")
      : t("tools.noPrices");

  return (
    <>
      <div className={uiPillRow}>
        <button type="button" onClick={onOpenBasket} className={uiPill}>{t("tools.bestValue")}</button>
        <button type="button" onClick={() => setShowStores(true)} className={uiPill}>{t("tools.openNow")}</button>
        <button type="button" onClick={() => setShowPickup(true)} className={uiPill}>{t("pickup.open")}</button>
      </div>

      <p className="mt-2 text-[12px] text-ui-muted">
        {priceStatus}
        {" · "}
        {openNow > 0 ? t("tools.openNowHint", { count: openNow }) : t("tools.closedToday")}
        {" · "}
        {t("pickup.toolsHint")}
        {loading && <Loader2 className="ms-1.5 inline h-3 w-3 animate-spin" />}
      </p>

      <OpenStoresDialog open={showStores} onOpenChange={setShowStores} />
      <PickupOrderDialog open={showPickup} onOpenChange={setShowPickup} items={items} />
    </>
  );
}