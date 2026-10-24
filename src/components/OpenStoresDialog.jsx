import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Car, Clock, Loader2, PersonStanding, Store } from "lucide-react";
import { useT } from "@/lib/i18n";
import { SUPERMARKETS, getPreferredSupermarket } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import ChainLogo from "@/components/ChainLogo";

// איפה הכי קרוב ופתוח — מי פתוח עכשיו, ובחירת רשת שממנה יוצאים לדרך
export default function OpenStoresDialog({ open, onOpenChange }) {
  const t = useT();
  const [now, setNow] = useState(new Date());
  const [leaving, setLeaving] = useState("");

  useEffect(() => {
    if (!open) return;
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, [open]);

  const preferred = getPreferredSupermarket();
  const stores = SUPERMARKETS
    .map(store => ({ ...store, status: storeStatus(now, store.shabbat) }))
    .sort((a, b) => Number(b.status.open) - Number(a.status.open)
      || Number(Boolean(b.shabbat)) - Number(Boolean(a.shabbat))
      || Number(b.name === preferred) - Number(a.name === preferred));

  const go = (name, mode) => {
    setLeaving(name + mode);
    const destination = encodeURIComponent(`${name} ${t("navigate.supermarket")}`);
    const url = mode === "walk"
      ? `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`
      : `https://waze.com/ul?q=${destination}&navigate=yes`;
    window.open(url, "_blank");
    setLeaving("");
    onOpenChange(false);
  };

  const statusText = (status) => {
    if (status.label === "openUntil") return t("tools.openUntil", { time: status.time });
    if (status.label === "closesAt") return t("tools.openUntil", { time: status.time });
    if (status.label === "opensAt") return t("tools.opensAt", { time: status.time });
    if (status.label === "closedToday") return t("tools.closedToday");
    return t("tools.closed");
  };

  const openCount = stores.filter(store => store.status.open).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-start">
            <Store className="w-5 h-5 text-primary" />{t("tools.storesTitle")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm font-bold text-muted-foreground">
          {openCount > 0 ? t("tools.openNowHint", { count: openCount }) : t("tools.closedToday")}
        </p>
        <div className="flex-1 space-y-2 overflow-y-auto px-1">
          {stores.map(store => (
            <div key={store.name} className={`flex items-center gap-3 rounded-2xl border p-2.5 ${store.status.open ? "border-primary/30 bg-primary/5" : "border-border bg-card opacity-70"}`}>
              <ChainLogo name={store.name} size={38} className="flex-shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">
                  {store.name}
                  {store.shabbat && <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-black text-primary">{t("tools.shabbat")}</span>}
                  {store.name === preferred && <span className="ms-2 text-xs font-black text-primary">{t("tools.preferred")}</span>}
                </p>
                <p className={`flex items-center gap-1 text-xs font-bold ${store.status.open ? "text-primary" : "text-muted-foreground"}`}>
                  <Clock className="h-3.5 w-3.5" />{statusText(store.status)}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button onClick={() => go(store.name, "walk")} title={t("navigate.walk")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30 text-primary">
                  {leaving === store.name + "walk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PersonStanding className="h-4 w-4" />}
                </button>
                <button onClick={() => go(store.name, "drive")} title={t("navigate.drive")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {leaving === store.name + "drive" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Car className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("tools.estimatedHours")}</p>
      </DialogContent>
    </Dialog>
  );
}