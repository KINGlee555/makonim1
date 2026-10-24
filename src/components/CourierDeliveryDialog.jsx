import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { COURIER_LIMIT_KG, itemWeightKg, totalWeightKg } from "@/lib/deliveryWeight";

export default function CourierDeliveryDialog({ open, onOpenChange, listId, items, userName }) {
  const t = useT();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  const weight = totalWeightKg(items);
  const over = weight > COURIER_LIMIT_KG;
  const fill = Math.min(100, Math.round((weight / COURIER_LIMIT_KG) * 100));

  useEffect(() => {
    if (open) {
      setSentMessage("");
      setError("");
    }
  }, [open]);

  const handleSend = async () => {
    if (!address.trim() || !phone.trim()) {
      setError(t("courier.needDetails"));
      return;
    }
    setSending(true);
    setError("");
    const message = [
      t("courier.title"),
      `${t("courier.totalWeight")}: ${weight.toFixed(1)} ${t("courier.kg")}`,
      ...items.map(item => `• ${item.name} × ${item.quantity || 1} — ${itemWeightKg(item).toFixed(1)} ${t("courier.kg")}`),
      `${t("courier.address")}: ${address.trim()}`,
      `${t("courier.phone")}: ${phone.trim()}`,
      note.trim()
    ].filter(Boolean).join("\n");

    try {
      await base44.entities.DeliveryRequest.create({
        list_id: listId,
        requested_by: userName || "",
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
        total_weight_kg: Number(weight.toFixed(2)),
        items_count: items.length,
        message,
        status: "open"
      });
      setSentMessage(message);
    } catch {
      setError(t("courier.error"));
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-h-[88vh] max-w-md overflow-y-auto bg-market-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start text-xl text-market-ink">
            <Truck className="h-5 w-5 text-market-blue" />
            {t("courier.title")}
          </DialogTitle>
        </DialogHeader>

        {sentMessage ? (
          <div className="space-y-3 py-2">
            <p className="text-[22px] font-black text-market-ink">{t("courier.sentTitle")}</p>
            <p className="text-[15px] font-bold text-market-ink/70">{t("courier.sentDesc")}</p>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(sentMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-[24px] bg-market-blue text-[16px] font-black text-white no-underline"
            >
              <MessageCircle className="h-4 w-4" />
              {t("courier.share")}
            </a>
          </div>
        ) : (
          <div className="space-y-3.5">
            <p className="text-[15px] font-bold text-market-ink/70">{t("courier.subtitle")}</p>

            <div className="rounded-3xl border-[3px] border-market-ink p-4">
              <div className="flex items-center justify-between text-[15px] font-black text-market-ink">
                <span>{t("courier.totalWeight")}</span>
                <span className={over ? "text-market-pink" : "text-market-blue"}>
                  {weight.toFixed(1)} / {COURIER_LIMIT_KG} {t("courier.kg")}
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-lg border-2 border-market-ink bg-market-track">
                <span className={`block h-full ${over ? "bg-market-pink" : "bg-market-blue"}`} style={{ width: `${fill}%` }} />
              </div>
              <p className="mt-2 text-[12px] font-bold text-market-ink/60">{t("courier.estimateNote")}</p>
            </div>

            {over && (
              <p className="rounded-2xl bg-market-pink-soft px-4 py-3 text-[14px] font-black text-market-ink">{t("courier.over")}</p>
            )}

            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-2xl bg-market-track px-4 py-3">
              <p className="text-[12px] font-black tracking-[1px] text-market-ink/60">{t("courier.items")} ({items.length})</p>
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-[14px] font-bold text-market-ink">
                  <span className="min-w-0 truncate">{item.name} × {item.quantity || 1}</span>
                  <span className="flex-shrink-0">{itemWeightKg(item).toFixed(1)} {t("courier.kg")}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder={t("courier.address")} />
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t("courier.phone")} inputMode="tel" />
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder={t("courier.note")} />
            </div>

            {error && <p className="text-[13px] font-bold text-destructive">{error}</p>}

            <Button
              onClick={handleSend}
              disabled={sending || over}
              className="h-12 w-full rounded-[24px] bg-market-pink text-[16px] font-black text-white hover:bg-market-pink hover:text-white"
            >
              {sending ? t("courier.sending") : t("courier.send")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}