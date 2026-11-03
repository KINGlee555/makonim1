import { RefreshCw } from "lucide-react";
import useSyncPricesNow from "@/hooks/useSyncPricesNow";
import { useT } from "@/lib/i18n";

// כפתור סנכרון המחירים: מוריד מחירים מחדש מכל הרשתות, ומודיע "מסונכרן" בסיום
export default function PriceSyncButton({ items = [], onSynced }) {
  const t = useT();
  const { syncing, syncedAt, failed, syncNow, ready } = useSyncPricesNow(items, onSynced);
  const done = !!syncedAt && !failed;
  const label = syncing
    ? t("live.syncing")
    : done
      ? t("live.synced")
      : failed
        ? t("live.retrySync")
        : t("live.sync");

  return (
    <button
      type="button"
      onClick={syncNow}
      disabled={syncing || !ready}
      aria-live="polite"
      title={t("live.syncHint")}
      className={`pst-live-btn pst-live-sync ${done ? "pst-live-sync-on" : ""}`}
    >
      <RefreshCw className={`h-4 w-4 ${syncing ? "animate-refresh" : ""}`} aria-hidden="true" />
      {label}
    </button>
  );
}