import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CHAINS } from "@/lib/chainPrices";
import { uiPill } from "@/lib/minimalUi";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

// דיווח "המחיר לא נכון" — המשתמש כותב מה המחיר שראה בחנות, והמנהל מאשר.
export default function ReportPriceDialog({ item, listId, userName, onClose }) {
  const t = useT();
  const [chain, setChain] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const shown = Number(item?.price) || 0;

  const submit = async () => {
    const value = Number(String(price).replace(",", "."));
    if (!value || value <= 0) {
      toast({ title: t("report.needPrice"), variant: "destructive", duration: 2500 });
      return;
    }
    setSending(true);
    try {
      await base44.entities.PriceReport.create({
        list_id: listId || "", item_name: item.name, barcode: item.barcode || "",
        chain_name: chain, shown_price: shown, seen_price: value, note: note.trim(),
        reported_by_name: userName || "", status: "pending"
      });
      toast({ title: t("report.sent"), description: t("report.sentDesc"), duration: 3500 });
      setPrice("");
      setNote("");
      setChain("");
      onClose();
    } catch {
      toast({ title: t("report.failed"), variant: "destructive", duration: 3000 });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="mx-auto max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start text-lg text-ui-ink">
            <Flag className="h-5 w-5 text-ui-accent" />{t("report.title")}
          </DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-4 pt-1">
            <div>
              <p className="text-[15px] text-ui-ink">{item.name}</p>
              <p className="text-[13px] text-ui-muted">{t("report.desc")}</p>
            </div>

            {shown > 0 && (
              <p className="text-[13px] text-ui-muted">{t("report.shown")}: ₪{shown.toFixed(2)}</p>
            )}

            <div>
              <span className="mb-2 block text-[14px] text-ui-ink">{t("report.chain")}</span>
              <div className="flex max-h-[112px] flex-wrap gap-1.5 overflow-y-auto">
                {CHAINS.map(entry => (
                  <button key={entry.id} type="button" onClick={() => setChain(entry.name)}
                    aria-pressed={chain === entry.name}
                    className={`${uiPill} ${chain === entry.name ? "border-ui-accent text-ui-accent" : ""}`}>
                    {entry.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="report-price" className="mb-1.5 block text-[14px] text-ui-ink">{t("report.seen")}</label>
              <Input id="report-price" value={price} onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal" dir="ltr" placeholder="₪" className="h-11 rounded-xl text-[15px]" />
            </div>

            <div>
              <label htmlFor="report-note" className="mb-1.5 block text-[14px] text-ui-ink">{t("report.note")}</label>
              <Input id="report-note" value={note} maxLength={160} onChange={(e) => setNote(e.target.value)}
                placeholder={t("report.notePlaceholder")} className="h-11 rounded-xl text-[14px]" />
            </div>

            <Button onClick={submit} disabled={sending} className="h-11 w-full rounded-[22px] text-[15px]">
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("report.send")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}