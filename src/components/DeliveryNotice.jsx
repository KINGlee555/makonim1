import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { uiSection, uiBannerAction, uiEnter } from "@/lib/minimalUi";

// Open courier requests are visible to every participant of the list.
export default function DeliveryNotice({ listId, delay = 0 }) {
  const t = useT();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // TODO: Fetch open delivery requests for this listId from your new backend
        // Mocking an empty array for now
        const rows = [];
        setRequests(rows);
      } catch {
        // Ignore errors
      }
    };

    load();

    // TODO: Implement real-time subscription for DeliveryRequest updates in your new backend
    const unsubscribe = () => {};
    return unsubscribe;
  }, [listId]);

  const handleDone = async (request) => {
    setRequests(prev => prev.filter(r => r.id !== request.id));

    try {
      // TODO: Update the DeliveryRequest status to "done" in your new backend
      // Simulating a network request for now
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      // Ignore errors
    }
  };

  if (requests.length === 0) return null;

  return (
      <section className={`${uiSection} ${uiEnter}`} style={{ animationDelay: `${delay}s` }}>
        <div className="space-y-2">
          {requests.map(request => (
              <div key={request.id} className="flex items-center justify-between gap-3 rounded-[10px] bg-ui-surface px-3.5 py-2.5 text-[14px] text-ui-ink">
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    {t("courier.requested")} · {Number(request.total_weight_kg || 0).toFixed(1)} {t("courier.kg")}
                  </p>
                  <p className="truncate text-[12px] text-ui-muted">{request.requested_by} · {request.address}</p>
                </div>
                <button type="button" onClick={() => handleDone(request)} className={uiBannerAction}>{t("courier.done")}</button>
              </div>
          ))}
        </div>
      </section>
  );
}