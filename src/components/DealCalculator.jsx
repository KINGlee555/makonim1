import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingDown } from "lucide-react";

function unitPrice(price, units, size) {
  const p = parseFloat(price), u = parseFloat(units) || 1, s = parseFloat(size) || 1;
  if (!p || p <= 0) return null;
  return p / (u * s);
}

const emptyOffer = { price: "", units: "1", size: "1" };

export default function DealCalculator({ open, onOpenChange }) {
  const [regular, setRegular] = useState(emptyOffer);
  const [deal, setDeal] = useState(emptyOffer);

  const regularUnit = unitPrice(regular.price, regular.units, regular.size);
  const dealUnit = unitPrice(deal.price, deal.units, deal.size);
  const ready = regularUnit !== null && dealUnit !== null;
  const savingPercent = ready ? ((regularUnit - dealUnit) / regularUnit) * 100 : 0;

  const renderOffer = (label, offer, setOffer, unit) => (
    <div className="rounded-2xl bg-card border p-3 space-y-2">
      <p className="text-base font-bold text-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">מחיר ₪</label>
          <Input type="number" inputMode="decimal" value={offer.price} onChange={(e) => setOffer({ ...offer, price: e.target.value })} className="h-11 rounded-xl" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">יחידות</label>
          <Input type="number" inputMode="decimal" value={offer.units} onChange={(e) => setOffer({ ...offer, units: e.target.value })} className="h-11 rounded-xl" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">גודל (גרם/מ״ל)</label>
          <Input type="number" inputMode="decimal" value={offer.size} onChange={(e) => setOffer({ ...offer, size: e.target.value })} className="h-11 rounded-xl" />
        </div>
      </div>
      <p className="text-sm font-semibold text-primary">
        {unit !== null ? `₪${unit.toFixed(3)} ליחידת מידה` : "מלאו מחיר כדי לחשב"}
      </p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto p-5 sm:!max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calculator className="w-5 h-5 text-primary" />מחשבון מבצעים
          </DialogTitle>
          <p className="text-sm text-muted-foreground">בדקו אם המבצע באמת משתלם — השוואת מחיר ליחידת מידה.</p>
        </DialogHeader>

        <div className="space-y-3 mt-1">
          {renderOffer("המחיר הרגיל", regular, setRegular, regularUnit)}
          {renderOffer("המבצע", deal, setDeal, dealUnit)}

          {ready && (
            <div className={`rounded-2xl p-4 text-center ${savingPercent > 0 ? "bg-secondary" : "bg-destructive/10"}`}>
              <TrendingDown className={`w-6 h-6 mx-auto mb-1 ${savingPercent > 0 ? "text-primary" : "text-destructive"}`} />
              <p className="text-lg font-bold text-foreground">
                {savingPercent > 0
                  ? `המבצע משתלם — חוסכים ${savingPercent.toFixed(1)}%`
                  : savingPercent === 0 ? "אין הבדל בין המבצע למחיר הרגיל" : `המבצע לא משתלם — יקר ב-${Math.abs(savingPercent).toFixed(1)}%`}
              </p>
            </div>
          )}

          <Button variant="outline" onClick={() => { setRegular(emptyOffer); setDeal(emptyOffer); }} className="h-11 w-full rounded-2xl">
            נקה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}