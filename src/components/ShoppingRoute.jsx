import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Route, MapPin, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import ProductPhoto from "@/components/ProductPhoto";
import ChainLogo from "@/components/ChainLogo";
import { groupItemsByAisle, getAisleLabel, SUPERMARKET_CHAINS } from "@/lib/supermarketLayouts";
import { useState } from "react";

export default function ShoppingRoute({ open, onOpenChange, items }) {
  const t = useT();
  const [selectedChain, setSelectedChain] = useState("shufersal");

  const aisleGroups = useMemo(() => groupItemsByAisle(items), [items]);
  const totalItems = items.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />{t("route.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-2">
          <p className="text-sm text-muted-foreground mb-2">{t("route.selectChain")}</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {SUPERMARKET_CHAINS.map(chain => (
              <button key={chain.id} onClick={() => setSelectedChain(chain.id)}
                aria-label={chain.name}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedChain === chain.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <ChainLogo name={chain.name} size={16} />{chain.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {totalItems === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("route.empty")}</p>
          ) : (
            <>
              <div className="bg-primary/10 rounded-2xl p-3 mb-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">{t("route.optimalPath")}</p>
                  <p className="text-xs text-muted-foreground">{t("route.aislesCount", { count: aisleGroups.length })}</p>
                </div>
              </div>

              <div className="space-y-3">
                {aisleGroups.map(([aisleNum, aisleItems]) => (
                  <div key={aisleNum} className="border border-border rounded-2xl overflow-hidden">
                    <div className="bg-muted/60 px-4 py-2 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{aisleNum}</span>
                      <span className="font-semibold text-foreground text-sm">{getAisleLabel(parseInt(aisleNum))}</span>
                      <span className="text-xs text-muted-foreground ms-auto">{aisleItems.length} {t("route.items")}</span>
                    </div>
                    <div className="divide-y divide-border">
                      {aisleItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 bg-card">
                          <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} barcode={item.barcode} className="h-9 w-9 flex-shrink-0 rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                            {item.quantity > 1 && <span className="text-xs text-muted-foreground">×{item.quantity}</span>}
                          </div>
                          {item.price > 0 && <span className="text-sm font-bold text-primary">₪{(item.price * (item.quantity || 1)).toFixed(2)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}