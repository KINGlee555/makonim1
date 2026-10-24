import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, ExternalLink, Loader2, MessageCircle, Search, Store, TrendingDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { useChainPrices } from "@/hooks/useChainPrices";
import { basketForChain, hasDirectOrderLink, orderLink } from "@/lib/pickupOrder";
import { getPreferredSupermarket } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import ChainLogo from "@/components/ChainLogo";

// איסוף עצמי: בוחרים איך לאסוף (הכי זול / הרשת המועדפת / רשת מסוימת),
// מקבלים את הסל המדויק לחנות ההיא, ומעבירים אותו לחנות כדי לסגור את האיסוף.
export default function PickupOrderDialog({ open, onOpenChange, items }) {
  const t = useT();
  const [chosenId, setChosenId] = useState("");
  const { loading, error, totals, rows, matched, day, refreshing } = useChainPrices(items, open && items.length > 0);

  const preferred = open ? getPreferredSupermarket() : "";
  const preferredChain = totals.find(chain => chain.name === preferred);
  const chosen = totals.find(chain => chain.id === chosenId) || preferredChain || totals[0];
  const basket = chosen ? basketForChain(rows, items, chosen.id) : null;

  const hours = storeStatus();
  const hoursLabel = `${t("pickup.openHours")}: ${t(`tools.${hours.label}`, { time: hours.time })}`;

  const basketText = chosen && basket ? [
    `${t("pickup.title")} — ${chosen.name}`,
    ...basket.lines.map(line => `• ${line.name} × ${line.quantity} ${t(`unit.${line.unit}`)}`),
    ...(basket.missing.length ? ["", `${t("pickup.missing")}: ${basket.missing.join(", ")}`] : []),
    "",
    `${t("pickup.total")}: ₪${basket.total.toFixed(2)}`
  ].join("\n") : "";

  const copyBasket = async () => {
    try {
      await navigator.clipboard.writeText(basketText);
      toast({ title: t("pickup.copied") });
    } catch {
      toast({ title: t("pickup.copyFailed"), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-h-[88vh] max-w-md overflow-y-auto bg-market-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start text-xl text-market-ink">
            <Store className="h-5 w-5 text-market-blue" />
            {t("pickup.title")}
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="py-8 text-center text-[16px] font-bold text-market-ink/70">{t("basket.empty")}</p>
        ) : loading && totals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-market-ink/70">
            <Loader2 className="h-7 w-7 animate-spin text-market-blue" />
            <p className="text-[15px] font-bold">{t("basket.loading")}</p>
          </div>
        ) : totals.length === 0 ? (
          <p className="py-8 text-center text-[16px] font-bold text-market-ink/70">
            {error ? t("basket.error") : t("pickup.empty")}
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
                onClick={() => setChosenId(totals[0].id)}
                className={`flex h-11 items-center gap-1.5 rounded-[20px] px-4 text-[15px] font-black ${chosen?.id === totals[0].id ? "bg-market-ink text-white" : "bg-market-blue text-white"}`}
              >
                <TrendingDown className="h-4 w-4" />{t("pickup.cheapest")}
              </button>
              {preferredChain && (
                <button
                  onClick={() => setChosenId(preferredChain.id)}
                  className={`flex h-11 items-center gap-1.5 rounded-[20px] px-4 text-[15px] font-black ${chosen?.id === preferredChain.id ? "bg-market-ink text-white" : "bg-market-yellow text-market-ink"}`}
                >
                  <Store className="h-4 w-4" />{t("pickup.preferred")}
                </button>
              )}
            </div>

            <div>
              <p className="mb-2 text-[13px] font-black tracking-[1px] text-market-ink/60">{t("pickup.chainList")}</p>
              <div className="max-h-52 space-y-2 overflow-y-auto">
                {totals.map(chain => (
                  <button
                    key={chain.id}
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
                <div className="mt-2.5 max-h-56 space-y-1.5 overflow-y-auto">
                  {basket.lines.map(line => (
                    <div key={line.id} className="flex items-center justify-between gap-2 text-[14px] font-bold text-market-ink">
                      <span className="min-w-0 truncate">{line.name} × {line.quantity} {t(`unit.${line.unit}`)}</span>
                      <span className="flex-shrink-0">₪{line.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {basket.missing.length > 0 && (
                  <p className="mt-3 rounded-2xl bg-market-yellow-soft px-3 py-2 text-[13px] font-black text-market-ink">
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
              <a
                href={orderLink(chosen)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-[26px] bg-market-blue text-[17px] font-black text-white no-underline"
              >
                {hasDirectOrderLink(chosen.id) ? <ExternalLink className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                {hasDirectOrderLink(chosen.id) ? t("pickup.openSite") : t("pickup.findSite")}
              </a>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(basketText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 items-center justify-center gap-2 rounded-[26px] bg-market-pink text-[16px] font-black text-white no-underline"
                >
                  <MessageCircle className="h-5 w-5" />{t("pickup.whatsapp")}
                </a>
                <button
                  onClick={copyBasket}
                  className="flex h-14 items-center justify-center gap-2 rounded-[26px] bg-market-yellow text-[16px] font-black text-market-ink"
                >
                  <Copy className="h-5 w-5" />{t("pickup.copy")}
                </button>
              </div>
              <p className="text-[12px] font-bold text-market-ink/60">{t("pickup.handoffNote")}</p>
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