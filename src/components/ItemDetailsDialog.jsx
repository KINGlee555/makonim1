import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { MAX_WEIGHT_KG, clampQuantity, isWeight } from "@/lib/units";

const UNITS = ["unit", "package", "kg", "gram", "liter"];
// הבחירות המהירות במשקל — חצי קילו, קילו, 2, 5 ו-10 ק״ג
const WEIGHT_PICKS_KG = [0.5, 1, 2, 5, 10];

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
  // הגבול העליון של הכמות — 10 ק״ג, ובגרמים 10000
  const maxAmount = unit === "kg" ? MAX_WEIGHT_KG : MAX_WEIGHT_KG * 1000;

  // מעבר בין גרמים לק״ג שומר על אותה כמות בדיוק; מעבר אחר ליחידת משקל מתחיל מקילו
  const changeUnit = (next) => {
    const amount = Number(quantity) || 0;
    if (next === "gram" && unit === "kg") setQuantity(Math.round(amount * 1000) || 1000);
    else if (next === "kg" && unit === "gram") setQuantity(Math.max(0.1, Math.round((amount / 1000) * 100) / 100));
    else if (next === "gram" && amount < 10) setQuantity(1000);
    setUnit(next);
  };
  // הכמות שהמשתמש מקליד נשמרת ביחידה שנבחרה — בגרמים או בק״ג
  const amountFor = (grams) => (unit === "kg" ? grams / 1000 : grams);

  const save = () => {
    const details = { note: note.trim(), unit, quantity: clampQuantity({ unit }, Number(quantity) || 1) };
    if (byWeight) details.price = Number(price) || 0;
    onSave(item, details);
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader><DialogTitle>{t("itemDetails.title")}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <span className="text-sm font-semibold">{t("itemDetails.unit")}</span>
          <div role="radiogroup" aria-label={t("itemDetails.unit")} className="flex flex-wrap gap-2">
            {UNITS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={unit === value}
                onClick={() => changeUnit(value)}
                className={`min-h-[44px] rounded-xl border-2 border-input px-4 text-sm font-bold ${unit === value ? "bg-primary text-primary-foreground" : "bg-background"}`}
              >
                {t(`unit.${value}`)}
              </button>
            ))}
          </div>
        </div>

        {byWeight && (
          <div className="space-y-2">
            <span className="text-sm font-semibold">{unit === "kg" ? t("itemDetails.weightKg") : t("itemDetails.weight")}</span>
            <div className="flex flex-wrap gap-2">
              {WEIGHT_PICKS_KG.map((kg) => (
                <button key={kg} type="button" onClick={() => setQuantity(amountFor(kg * 1000))}
                  aria-pressed={Number(quantity) === amountFor(kg * 1000)}
                  className={`rounded-xl border-2 border-input px-3 py-1.5 text-sm font-bold ${Number(quantity) === amountFor(kg * 1000) ? "bg-primary text-primary-foreground" : "bg-background"}`}>
                  {unit === "kg" ? `${kg} ${t("unit.kg")}` : `${kg * 1000} ${t("unit.gram")}`}
                </button>
              ))}
            </div>
            <Input type="number" inputMode="decimal" step={unit === "kg" ? "0.5" : "100"} value={quantity}
              min={unit === "kg" ? 0.1 : 100} max={maxAmount}
              onChange={(event) => {
                const amount = Number(event.target.value);
                setQuantity(Number.isFinite(amount) && amount > maxAmount ? maxAmount : amount);
              }} className="h-12 rounded-xl" />
            <p className="text-xs text-muted-foreground">{t("itemDetails.maxWeight", { max: MAX_WEIGHT_KG })}</p>
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