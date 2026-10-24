import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Truck } from "lucide-react";
import { useT } from "@/lib/i18n";

// Open courier requests are visible to every participant of the list.
export default function DeliveryNotice({ listId }) {
  const t = useT();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = () => base44.entities.DeliveryRequest.filter({ list_id: listId, status: "open" }, "-created_date", 5)
      .then(rows => setRequests(Array.isArray(rows) ? rows : rows.items || []))
      .catch(() => {});
    load();
    const unsubscribe = base44.entities.DeliveryRequest.subscribe(() => load());
    return unsubscribe;
  }, [listId]);

  const handleDone = async (request) => {
    setRequests(prev => prev.filter(r => r.id !== request.id));
    await base44.entities.DeliveryRequest.update(request.id, { status: "done" }).catch(() => {});
  };

  if (requests.length === 0) return null;

  return (
    <section className="mt-5 space-y-2.5">
      {requests.map(request => (
        <div key={request.id} className="flex items-center gap-3 rounded-3xl border-[3px] border-market-ink bg-market-blue-soft px-4 py-3">
          <Truck className="h-5 w-5 flex-shrink-0 text-market-ink" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-black text-market-ink">
              {t("courier.requested")} · {Number(request.total_weight_kg || 0).toFixed(1)} {t("courier.kg")}
            </p>
            <p className="truncate text-[13px] font-bold text-market-ink/75">
              {request.requested_by} · {request.address}
            </p>
          </div>
          <button
            onClick={() => handleDone(request)}
            className="flex-shrink-0 rounded-2xl bg-market-ink px-3 py-2 text-[13px] font-black text-white"
          >
            {t("courier.done")}
          </button>
        </div>
      ))}
    </section>
  );
}