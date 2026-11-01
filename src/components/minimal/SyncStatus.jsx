import { RefreshCw } from "lucide-react";
import useSyncPricesNow from "@/hooks/useSyncPricesNow";

export default function SyncStatus({ items = [], onSynced }) {
  const { syncing, syncedAt, failed, partial, message, syncNow, ready } = useSyncPricesNow(items, onSynced);
  const status = failed ? "failed" : syncing ? "loading" : syncedAt ? (partial ? "partial" : "fresh") : "unknown";
  return (
    <div className="pst-sync" data-state={status} role="status" aria-live="polite">
      <span className="pst-sync-dot" aria-hidden="true" />
      <span className="pst-sync-text">{syncing ? `בודק מחירים לכל ${items.length} המוצרים…` : ready ? message : "הוסיפו מוצרים כדי לבדוק מחירים"}</span>
      {syncedAt && <span className="pst-sync-time">{new Date(syncedAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</span>}
      <button type="button" className="pst-sync-btn" onClick={syncNow} disabled={syncing || !ready} aria-label="סנכרן מחירים עכשיו">
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-refresh" : ""}`} aria-hidden="true" />
        {syncing ? "מסנכרן…" : "סנכרן עכשיו"}
      </button>
    </div>
  );
}