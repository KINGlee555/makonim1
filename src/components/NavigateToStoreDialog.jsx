import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Car, PersonStanding, Loader2, Store, MapPin, BadgePercent } from "lucide-react";
import { useT } from "@/lib/i18n";
import { SUPERMARKETS, SUPERMARKET_NAMES, getPreferredSupermarket } from "@/lib/supermarkets";
import { FAST_CHAINS, OTHER_CHAINS, fetchChainPrices } from "@/lib/chainPrices";
import ChainLogo from "@/components/ChainLogo";

// "הכי קרוב" — הסופר המועדף, ואם אין כזה שופרסל (הרשת עם הכי הרבה סניפים);
// וייז פותח את הסניף הקרוב אליך. "הכי זול" — המחיר האמיתי של המוצר בכל רשת,
// מקובצי השקיפות הרשמיים, מהזול ליקר.
function nearestStore() {
  return getPreferredSupermarket() || "שופרסל";
}

export default function NavigateToStoreDialog({ open, onOpenChange, product }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("near");
  const [selectedStore, setSelectedStore] = useState("");
  const [prices, setPrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(false);

  useEffect(() => {
    if (!open || mode !== "cheap" || prices.length || pricesLoading) return;
    if (!product?.name && !product?.barcode) return;
    let cancelled = false;
    setPricesLoading(true);
    const ask = [{ name: product?.name || "", barcode: product?.barcode || "" }];
    const key = product?.barcode || product?.name;
    Promise.all([fetchChainPrices(ask, FAST_CHAINS), fetchChainPrices(ask, OTHER_CHAINS)])
      .then(([fast, rest]) => {
        if (cancelled) return;
        const rows = [...(fast?.chains || []), ...(rest?.chains || [])]
          .map(chain => ({ id: chain.id, name: chain.name, price: chain.prices?.[key] || 0 }))
          .filter(row => row.price > 0)
          .sort((a, b) => a.price - b.price);
        setPrices(rows);
      })
      .catch(() => { if (!cancelled) setPrices([]); })
      .finally(() => { if (!cancelled) setPricesLoading(false); });
    return () => { cancelled = true; };
  }, [open, mode]);

  const nearest = product ? nearestStore() : "";
  const cheapest = prices[0] || null;
  const store = selectedStore || (mode === "cheap" && cheapest ? cheapest.name : nearest);

  const navigate = (travelMode) => {
    if (!store) return;
    setLoading(true);
    const destination = encodeURIComponent(`${store} ${t("navigate.supermarket")}`);
    const url = travelMode === "walk"
      ? `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`
      : `https://waze.com/ul?q=${destination}&navigate=yes`;
    window.open(url, "_blank");
    setLoading(false);
    onOpenChange(false);
  };

  const chosen = mode === "cheap"
    ? prices.find(row => row.name === store) || null
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start">{t("navigate.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          {/* שתי הדרכים: קודם כל הכי קרוב, ובחירה מפורשת של הכי זול */}
          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="לאן לנווט">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "near"}
              onClick={() => setMode("near")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-bold ${
                mode === "near" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              <MapPin className="h-4 w-4" />הכי קרוב
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "cheap"}
              onClick={() => setMode("cheap")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-bold ${
                mode === "cheap" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              <BadgePercent className="h-4 w-4" />הכי זול
            </button>
          </div>

          <div className="bg-primary/8 rounded-2xl p-4 flex items-start gap-3">
            <Store className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{product?.name}</p>
              <p className="text-primary font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                <ChainLogo name={store} size={16} /><span className="truncate">{store}</span>
              </p>
              {mode === "cheap" && chosen?.price > 0 && (
                <p className="mt-0.5 text-sm font-bold text-foreground">₪{chosen.price.toFixed(2)}</p>
              )}
              {mode === "near" && <p className="mt-0.5 text-xs text-muted-foreground">וייז יפתח את הסניף הקרוב אליך</p>}
            </div>
          </div>

          {mode === "near" ? (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">בחר סופר</p>
              <div className="grid grid-cols-2 gap-2">
                {SUPERMARKET_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedStore(name)}
                    className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs font-medium transition-all ${
                      store === name ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <ChainLogo name={name} size={16} /><span className="truncate">{name}</span>
                  </button>
                ))}
              </div>
              {getPreferredSupermarket() && !selectedStore && (
                <p className="text-xs text-primary/60 mt-1">הסופר המועדף עליך: {getPreferredSupermarket()}</p>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">מחיר המוצר ברשתות — מהזול ליקר</p>
              {pricesLoading && prices.length === 0 && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />בודק מחירים בקבצי הרשתות…
                </p>
              )}
              {!pricesLoading && prices.length === 0 && (
                <p className="text-sm text-muted-foreground">לא נמצא מחיר לרשתות במסמכי השקיפות של היום.</p>
              )}
              <div className="max-h-52 space-y-2 overflow-y-auto">
                {prices.map((row, index) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedStore(row.name)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${
                      store === row.name ? "border-primary bg-primary/10" : "border-border bg-card"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ChainLogo name={row.name} size={16} />
                      <span className="truncate font-semibold">{row.name}</span>
                      {index === 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">הכי זול</span>}
                    </span>
                    <span className="font-bold">₪{row.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => navigate("walk")} disabled={loading} variant="outline" className="h-16 flex-col gap-1 rounded-2xl border-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PersonStanding className="w-5 h-5 text-primary" />}
              <span className="font-semibold">{t("navigate.walk")}</span>
            </Button>
            <Button onClick={() => navigate("drive")} disabled={loading} className="h-16 flex-col gap-1 rounded-2xl bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Car className="w-5 h-5" />}
              <span className="font-semibold">{t("navigate.drive")}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}