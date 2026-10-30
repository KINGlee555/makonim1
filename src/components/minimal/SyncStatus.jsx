import { RefreshCw } from "lucide-react";
import usePricesUpdatedAt from "@/hooks/usePricesUpdatedAt";

// פס סטטוס: המחירים מגיעים מקבצי השקיפות הרשמיים של הרשתות, ולכן אפשר להראות
// מתי הם עודכנו לאחרונה — אור ירוק קבוע ושעת העדכון.
export default function SyncStatus() {
  const updatedAt = usePricesUpdatedAt();
  const time = updatedAt
    ? new Date(updatedAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="pst-sync" role="status" aria-live="polite">
      <span className="pst-sync-dot" aria-hidden="true" />
      <span className="pst-sync-text">המחירים מסונכרנים עם המערכות ברשת</span>
      {time && (
        <span className="pst-sync-time">
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          עודכן {time}
        </span>
      )}
    </div>
  );
}