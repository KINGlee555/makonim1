import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Car, PersonStanding, Loader2, Store } from "lucide-react";
import { useT } from "@/lib/i18n";
import { SUPERMARKETS, SUPERMARKET_NAMES, getPreferredSupermarket } from "@/lib/supermarkets";
import ChainLogo from "@/components/ChainLogo";

function getNearestStore(productName) {
  // Use preferred supermarket if set
  const preferred = getPreferredSupermarket();
  if (preferred) return preferred;
  // Otherwise pick based on product name
  const seed = productName.charCodeAt(0);
  return SUPERMARKET_NAMES[seed % SUPERMARKET_NAMES.length];
}

export default function NavigateToStoreDialog({ open, onOpenChange, product }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");

  const navigate = (mode) => {
    setLoading(true);
    const store = selectedStore || getNearestStore(product?.name || "");
    const destination = encodeURIComponent(`${store} ${t("navigate.supermarket")}`);

    let url;
    if (mode === "walk") {
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
    } else {
      url = `https://waze.com/ul?q=${destination}&navigate=yes`;
    }

    window.open(url, "_blank");
    setLoading(false);
    onOpenChange(false);
  };

  const preferred = getPreferredSupermarket();
  const store = selectedStore || (product ? getNearestStore(product.name) : "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start">{t("navigate.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="bg-primary/8 rounded-2xl p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">{t("navigate.recommended")}</p>
              <p className="font-bold text-foreground">{product?.name}</p>
              <p className="text-primary font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                <ChainLogo name={store} size={16} />{store}
              </p>
            </div>
          </div>

          {/* Supermarket selector */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">בחר סופר</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SUPERMARKET_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedStore(name)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    (selectedStore || store) === name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <ChainLogo name={name} size={16} />{name}
                </button>
              ))}
            </div>
            {preferred && !selectedStore && (
              <p className="text-xs text-primary/60 mt-1">הסופר המועדף עליך: {preferred}</p>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">{t("navigate.howToArrive")}</p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate("walk")}
              disabled={loading}
              variant="outline"
              className="h-20 flex-col gap-2 rounded-2xl border-2 hover:border-primary hover:bg-primary/5"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <PersonStanding className="w-6 h-6 text-primary" />}
              <span className="font-semibold">{t("navigate.walk")}</span>
            </Button>
            <Button
              onClick={() => navigate("drive")}
              disabled={loading}
              className="h-20 flex-col gap-2 rounded-2xl bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Car className="w-6 h-6" />}
              <span className="font-semibold">{t("navigate.drive")}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}