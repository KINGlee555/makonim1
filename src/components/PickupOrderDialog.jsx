import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, Loader2, MessageCircle, Search, Store, TrendingDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { useChainPrices } from "@/hooks/useChainPrices";
import { basketForChain, hasDirectOrderLink, orderLink } from "@/lib/pickupOrder";
import { getPreferredSupermarket } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import ChainLogo from "@/components/ChainLogo";

// שעת איסוף נוחה כברירת מחדל — עוד שעתיים, בשעה עגולה
function defaultPickupTime() {
  const date = new Date(Date.now() + 2 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}

// איסוף עצמי: בוחרים את הרשת שממנה נבנתה הרשימה (או רשת אחרת), מקבלים את הסל
// המדויק עם מחירי המדף, ממלאים שם טלפון וסניף — וההזמנה נשמרת ברשימה ומוכנה לשליחה לחנות.
export default function PickupOrderDialog({ open, onOpenChange, items, listId, userName }) {
  const t = useT();
  const [chosenId, setChosenId] = useState("");
  const [contactName, setContactName] = useState(userName || "");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [when, setWhen] = useState(defaultPickupTime);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedText, setSavedText] = useState("");
  const [error, setError] = useState("");

  const { loading, error: priceError, totals, rows, matched, day, refreshing } =
    useChainPrices(items, open && items.length > 0);

  const preferred = open ? getPreferredSupermarket() : "";
  const preferredChain = totals.find(chain => chain.name === preferred);
  const chosen = totals.find(chain => chain.id === chosenId) || preferredChain || totals[0];
  const basket = chosen ? basketForChain(rows, items, chosen.id) : null;

  useEffect(() => {
    if (!open) return;
    setSavedText("");
    setError("");
    if (!contactName && userName) setContactName(userName);
  }, [open, userName]);

  const hours = storeStatus();
  const hoursLabel = `${t("pickup.openHours")}: ${t(`tools.${hours.label}`, { time: hours.time })}`;

  const pickupLabel = when
    ? new Date(when).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "";

  const basketText = chosen && basket ? [
    `${t("pickup.orderTitle")} — ${chosen.name}`,
    branch.trim() ? `${t("pickup.branch")}: ${branch.trim()}` : "",
    pickupLabel ? `${t("pickup.when")}: ${pickupLabel}` : "",
    contactName.trim() ? `${t("pickup.contactName")}: ${contactName.trim()}` : "",
    phone.trim() ? `${t("pickup.phone")}: ${phone.trim()}` : "",
    "",
    ...basket.lines.map(line => `• ${line.name} × ${line.quantity} ${t(`unit.${line.unit}`)}`),
    ...(basket.missing.length ? ["", `${t("pickup.missing")}: ${basket.missing.join(", ")}`] : []),
    "",
    `${t("pickup.total")}: ₪${basket.total.toFixed(2)}`,
    note.trim() ? `${t("pickup.note")}: ${note.trim()}` : "",
  ].filter(line => line !== "").join("\n") : "";

  const copyBasket = async () => {
    try {
      await navigator.clipboard.writeText(basketText);
      toast({ title: t("pickup.copied") });
    } catch {
      toast({ title: t("pickup.copyFailed"), variant: "destructive" });
    }
  };

  const saveOrder = async () => {
    if (!chosen) return;
    if (!contactName.trim() || !phone.trim()) {
      setError(t("pickup.needDetails"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await base44.entities.PickupOrder.create({
        list_id: listId,
        chain: chosen.id,
        chain_name: chosen.name,
        branch: branch.trim(),
        contact_name: contactName.trim(),
        phone: phone.trim(),
        pickup_at: when ? new Date(when).toISOString() : "",
        note: note.trim(),
        items_count: basket?.lines.length || 0,
        total: Number((basket?.total || 0).toFixed(2)),
        basket: basketText,
        created_by_name: userName || contactName.trim(),
        status: "open",
      });
      setSavedText(basketText);
    } catch {
      setError(t("pickup.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-h-[88vh] max-w-md overflow-y-auto bg-market-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start text-xl text-market-ink">
            <Store className="h-5 w-5 text-market-blue" />
            {savedText ? t("pickup.savedTitle") : t("pickup.orderTitle")}
          </DialogTitle>
        </DialogHeader>

        {savedText ? (
          <div className="space-y-3 py-1">
            <p className="text-[15px] font-bold text-market-ink/70">{t("pickup.savedDesc")}</p>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-market-track px-4 py-3 text-[13px] font-bold leading-relaxed text-market-ink [overflow-wrap:anywhere]">
              {savedText}
            </pre>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(savedText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-[26px] bg-market-pink text-[16px] font-black text-white no-underline"
            >
              <MessageCircle className="h-5 w-5" />{t("pickup.sendStore")}
            </a>
            {chosen && (
              <a
                href={orderLink(chosen)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-[26px] bg-market-blue text-[16px] font-black text-white no-underline"
              >
                {hasDirectOrderLink(chosen.id) ? <ExternalLink className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                {hasDirectOrderLink(chosen.id) ? t("pickup.openSite") : t("pickup.findSite")}
              </a>
            )}
            <button
              type="button"
              onClick={() => { setSavedText(""); onOpenChange(false); }}
              className="flex h-12 w-full items-center justify-center rounded-[24px] bg-market-yellow text-[16px] font-black text-market-ink"
            >
              {t("pickup.done")}
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-[16px] font-bold text-market-ink/70">{t("basket.empty")}</p>
        ) : loading && totals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-market-ink/70">
            <Loader2 className="h-7 w-7 animate-spin text-market-blue" />
            <p className="text-[15px] font-bold">{t("basket.loading")}</p>
          </div>
        ) : totals.length === 0 ? (
          <p className="py-8 text-center text-[16px] font-bold text-market-ink/70">
            {priceError ? t("basket.error") : t("pickup.empty")}
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-[15px] font-bold text-market-ink/70">{t("pickup.subtitle")}</p>

            <div className="rounded-2xl bg-market-track px-4 py-2.5">
              <p className="text-[13px] font-black text-market-ink">{hoursLabel}</p>
              <p className="text-[12px] font-bold text-market-ink/60">{t("tools.estimatedHours")}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setChosenId(totals[0].id)}
                className={`flex h-11 items-center gap-1.5 rounded-[20px] px-4 text-[15px] font-black ${chosen?.id === totals[0].id ? "bg-market-ink text-white" : "bg-market-blue text-white"}`}
              >
                <TrendingDown className="h-4 w-4" />{t("pickup.cheapest")}
              </button>
              {preferredChain && (
                <button
                  type="button"
                  onClick={() => setChosenId(preferredChain.id)}
                  className={`flex h-11 items-center gap-1.5 rounded-[20px] px-4 text-[15px] font-black ${chosen?.id === preferredChain.id ? "bg-market-ink text-white" : "bg-market-yellow text-market-ink"}`}
                >
                  <Store className="h-4 w-4" />{t("pickup.mine")}
                </button>
              )}
            </div>

            <div>
              <p className="mb-2 text-[13px] font-black tracking-[1px] text-market-ink/60">{t("pickup.chainList")}</p>
              <div className="max-h-52 space-y-2 overflow-y-auto">
                {totals.map(chain => (
                  <button
                    key={chain.id}
                    type="button"
                    onClick={() => setChosenId(chain.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border-[3px] px-3 py-2.5 text-start ${chosen?.id === chain.id ? "border-market-blue bg-market-blue-soft" : "border-market-ink/15 bg-market-surface"}`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <ChainLogo name={chain.name} size={32} className="flex-shrink-0 rounded-lg" />
                      <span className="min-w-0">
                        <span className="block truncate text-[16px] font-black text-market-ink">{chain.name}</span>
                        <span className="block text-[12px] font-bold text-market-ink/60">
                          {t("pickup.coverage", { found: chain.covered, total: matched })}
                        </span>
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-[18px] font-black text-market-blue">₪{chain.total.toFixed(2)}</span>
                  </button>
                ))}
              </div>
              {refreshing && (
                <p className="mt-2 flex items-center gap-2 text-[12px] font-bold text-market-ink/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-market-blue" />{t("basket.more")}
                </p>
              )}
            </div>

            {basket && (
              <div className="rounded-3xl border-[3px] border-market-ink p-4">
                <p className="text-[16px] font-black text-market-ink">{t("pickup.basket")} · {chosen.name}</p>
                <div className="mt-2.5 max-h-40 space-y-1.5 overflow-y-auto">
                  {basket.lines.map(line => (
                    <div key={line.id} className="flex items-center justify-between gap-2 text-[14px] font-bold text-market-ink">
                      <span className="min-w-0 truncate">{line.name} × {line.quantity} {t(`unit.${line.unit}`)}</span>
                      <span className="flex-shrink-0">₪{line.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {basket.missing.length > 0 && (
                  <p className="mt-3 rounded-2xl bg-market-yellow-soft px-3 py-2 text-[13px] font-black text-market-ink [overflow-wrap:anywhere]">
                    {t("pickup.missing")}: {basket.missing.join(", ")}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between border-t-2 border-market-ink/15 pt-2.5">
                  <span className="text-[14px] font-black text-market-ink">{t("pickup.total")}</span>
                  <span className="text-[22px] font-black text-market-blue">₪{basket.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <p className="text-[13px] font-black tracking-[1px] text-market-ink/60">{t("pickup.details")}</p>
              <Input value={contactName} onChange={event => setContactName(event.target.value)}
                placeholder={t("pickup.contactName")} className="h-11 rounded-xl" maxLength={60} />
              <Input value={phone} onChange={event => setPhone(event.target.value)}
                placeholder={t("pickup.phone")} inputMode="tel" dir="ltr" className="h-11 rounded-xl" maxLength={20} />
              <Input value={branch} onChange={event => setBranch(event.target.value)}
                placeholder={t("pickup.branch")} className="h-11 rounded-xl" maxLength={80} />
              <Input type="datetime-local" value={when} onChange={event => setWhen(event.target.value)}
                className="h-11 rounded-xl" aria-label={t("pickup.when")} />
              <Input value={note} onChange={event => setNote(event.target.value)}
                placeholder={t("pickup.note")} className="h-11 rounded-xl" maxLength={160} />
            </div>

            {error && <p className="text-[13px] font-bold text-destructive">{error}</p>}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={saveOrder}
                disabled={saving}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[26px] bg-market-blue text-[17px] font-black text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Store className="h-5 w-5" />}
                {saving ? t("pickup.saving") : t("pickup.save")}
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(basketText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-[24px] bg-market-pink text-[15px] font-black text-white no-underline"
                >
                  <MessageCircle className="h-4 w-4" />{t("pickup.whatsapp")}
                </a>
                <button
                  type="button"
                  onClick={copyBasket}
                  className="flex h-12 items-center justify-center gap-2 rounded-[24px] bg-market-yellow text-[15px] font-black text-market-ink"
                >
                  <Copy className="h-4 w-4" />{t("pickup.copy")}
                </button>
              </div>
              <p className="text-[12px] font-bold text-market-ink/60">
                {t("basket.disclaimer")}{day ? ` · ${t("basket.updated", { day })}` : ""}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}