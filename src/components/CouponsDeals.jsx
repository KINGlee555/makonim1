import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tag, Percent, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";
import ChainLogo from "@/components/ChainLogo";

// Simulated deals based on common Israeli supermarket promotions
const DEALS = [
  { store: "שופרסל", product: "חלב 3% טרה", originalPrice: 5.90, dealPrice: 4.90, type: "1+1", emoji: "🥛" },
  { store: "רמי לוי", product: "לחם אחיד", originalPrice: 8.50, dealPrice: 6.90, type: "discount", emoji: "🍞" },
  { store: "מגא בול", product: "ביצים L", originalPrice: 12.90, dealPrice: 9.90, type: "discount", emoji: "🥚" },
  { store: "יוחננוף", product: "עגבניות שרי", originalPrice: 7.90, dealPrice: 5.90, type: "1+1", emoji: "🍅" },
  { store: "ויקטורי", product: "גבינה צהובה", originalPrice: 14.90, dealPrice: 11.90, type: "discount", emoji: "🧀" },
  { store: "קשת טעמים", product: "שמן זית", originalPrice: 29.90, dealPrice: 22.90, type: "discount", emoji: "🫒" },
  { store: "חצי חינם", product: "אורז בסמטי", originalPrice: 9.90, dealPrice: 6.90, type: "1+1", emoji: "🌾" },
  { store: "אושר עד", product: "קפה שחור", originalPrice: 24.90, dealPrice: 19.90, type: "discount", emoji: "☕" },
  { store: "טיב טעם", product: "סלמון טרי", originalPrice: 89.90, dealPrice: 69.90, type: "discount", emoji: "🐟" },
  { store: "שופרסל", product: "נייר טואלט", originalPrice: 19.90, dealPrice: 14.90, type: "1+1", emoji: "🧻" },
];

export default function CouponsDeals({ open, onOpenChange, items }) {
  const t = useT();
  const [copied, setCopied] = useState(null);

  const relevantDeals = useMemo(() => {
    if (!items || items.length === 0) return DEALS;
    const itemNames = items.map(i => i.name.toLowerCase());
    const matched = DEALS.filter(d => itemNames.some(n => n.includes(d.product.toLowerCase().split(" ")[0]) || d.product.toLowerCase().includes(n.split(" ")[0])));
    return matched.length > 0 ? matched : DEALS;
  }, [items]);

  const handleCopy = (deal, idx) => {
    setCopied(idx);
    toast({ title: t("deals.copied"), duration: 1500 });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />{t("deals.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
          {relevantDeals.map((deal, idx) => {
            const savings = deal.originalPrice - deal.dealPrice;
            const pct = Math.round((savings / deal.originalPrice) * 100);
            return (
              <div key={idx} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3">
                <span className="text-3xl">{deal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm line-clamp-1">{deal.product}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ChainLogo name={deal.store} size={14} />{deal.store}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-primary">₪{deal.dealPrice.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground line-through">₪{deal.originalPrice.toFixed(2)}</span>
                    {deal.type === "1+1" ? (
                      <span className="text-xs bg-accent text-accent-foreground rounded-full px-2 py-0.5 font-bold">1+1</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-bold">-{pct}%</span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleCopy(deal, idx)} aria-label={t("deals.copy")}
                  className="w-9 h-9 rounded-xl border-2 border-primary/30 text-primary flex items-center justify-center flex-shrink-0 hover:bg-primary hover:text-primary-foreground transition-all">
                  {copied === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground text-center pt-2">{t("deals.disclaimer")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}