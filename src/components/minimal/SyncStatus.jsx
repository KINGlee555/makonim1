import { Check, RefreshCw } from "lucide-react";
import usePricesUpdatedAt from "@/hooks/usePricesUpdatedAt";
import useSyncPricesNow from "@/hooks/useSyncPricesNow";

// פס סטטוס: המחירים מגיעים מקבצי השקיפות הרשמיים של הרשתות, ולכן אפשר להראות
// מתי הם עודכנו לאחרונה — וגם לסנכרן עכשיו, בלי לחכות לעדכון היומי.
export default function SyncStatus({ items = [] }) {
  const updatedAt = usePricesUpdatedAt();
  const { syncing, syncedAt, failed, syncNow, ready } = useSyncPricesNow(items);
  const stamp = syncedAt || updatedAt;
  const time = stamp
    ? new Date(stamp).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="pst-sync" role="status" aria-live="polite">
      <span className="pst-sync-dot" aria-hidden="true" />
      <span className="pst-sync-text">
        {failed ? "הסנכרון לא הצליח — ננסה שוב" : "המחירים מסונכרנים עם קבצי השקיפות הרשמיים"}
      </span>
      {time && (
        <span className="pst-sync-time">
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          {syncedAt ? "עודכן עכשיו" : `עודכן ${time}`}
        </span>
      )}
      <button
        type="button"
        className="pst-sync-btn"
        onClick={syncNow}
        disabled={syncing || !ready}
        aria-label="סנכרן מחירים עכשיו"
      >
        {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-refresh" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
        {syncing ? "מסנכרן…" : "סנכרן עכשיו"}
      </button>
    </div>
  );
}