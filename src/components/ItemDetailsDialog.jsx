import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { isWeight } from "@/lib/units";

const UNITS = ["unit", "package", "kg", "gram", "liter"];
const WEIGHT_PICKS = [100, 250, 500, 1000];

// פרטי המוצר: הערה, יחידת מידה, וכמות — כולל משקל בגרמים למוצרים שנמכרים לפי משקל.
export default function ItemDetailsDialog({ item, onClose, onSave }) {
  const t = useT();
  const [note, setNote] = useState("");
  const [unit, setUnit] = useState("unit");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    setNote(item?.note || "");
    setUnit(item?.unit || "unit");
    setQuantity(Number(item?.quantity) || 1);
    setPrice(Number(item?.price) || 0);
  }, [item]);

  const byWeight = isWeight(unit);

  const changeUnit = (next) => {
    setUnit(next);
    // מעבר ליחידת משקל: כמות בודדת אינה הגיונית בגרמים
    if (next === "gram" && quantity < 10) setQuantity(1000);
  };

  const save = () => {
    const details = { note: note.trim(), unit, quantity: Number(quantity) || 1 };
    if (byWeight) details.price = Number(price) || 0;
    onSave(item, details);
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader><DialogTitle>{t("itemDetails.title")}</DialogTitle></DialogHeader>
        <label className="space-y-2 text-sm font-semibold">
          <span>{t("itemDetails.unit")}</span>
          <select value={unit} onChange={(event) => changeUnit(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-3">
            {UNITS.map((value) => <option key={value} value={value}>{t(`unit.${value}`)}</option>)}
          </select>
        </label>

        {unit === "gram" && (
          <div className="space-y-2">
            <span className="text-sm font-semibold">{t("itemDetails.weight")}</span>
            <div className="flex flex-wrap gap-2">
              {WEIGHT_PICKS.map((grams) => (
                <button key={grams} type="button" onClick={() => setQuantity(grams)}
                  aria-pressed={Number(quantity) === grams}
                  className={`rounded-xl border-2 border-input px-3 py-1.5 text-sm font-bold ${Number(quantity) === grams ? "bg-primary text-primary-foreground" : "bg-background"}`}>
                  {grams >= 1000 ? `${grams / 1000} ${t("unit.kg")}` : `${grams} ${t("unit.gram")}`}
                </button>
              ))}
            </div>
            <Input type="number" inputMode="numeric" value={quantity} min={1}
              onChange={(event) => setQuantity(Number(event.target.value))} className="h-12 rounded-xl" />
          </div>
        )}

        {byWeight && (
          <label className="space-y-2 text-sm font-semibold">
            <span>{t("itemDetails.perKg")}</span>
            <Input type="number" inputMode="decimal" step="0.1" value={price}
              onChange={(event) => setPrice(Number(event.target.value))} className="h-12 rounded-xl" />
          </label>
        )}

        <label className="space-y-2 text-sm font-semibold">
          <span>{t("itemDetails.note")}</span>
          <Input value={note} onChange={(event) => setNote(event.target.value)} maxLength={120} placeholder={t("itemDetails.notePlaceholder")} className="h-12 rounded-xl" />
        </label>
        <Button onClick={save} className="h-12 rounded-xl">{t("itemDetails.save")}</Button>
      </DialogContent>
    </Dialog>
  );
}