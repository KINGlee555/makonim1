import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { clampQuantity } from "@/lib/units";

// מוצר שנמכר לפי משקל נקבע בהקלדה — חצי קילו, 750 גרם, 1.5 ק״ג.
// כפתורי פלוס ומינוס לא מתאימים למשקל, ולכן יש כאן שדה כמות, החלפת יחידה והסרה מפורשת של הפריט.
export default function WeightQuantity({ item, unit, unitLabel, onUpdateQuantity, onRemove, onSwitchUnit }) {
  const t = useT();
  const stored = Number(item.quantity) || 0;
  const [text, setText] = useState(String(stored));

  // הכמות שהשתנתה מבחוץ (החלפת יחידה, עדכון מהשרת) מתעדכנת גם בשדה
  useEffect(() => {
    setText(String(Number(item.quantity) || 0));
  }, [item.id, item.quantity, unit]);

  // הקריאה נעשית מהשדה עצמו, כדי שהמשקל שהוקלד יישמר גם אם ההקלדה והמעבר ממנו קרובים
  const save = (raw) => {
    const amount = Number(String(raw).replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return false;
    const next = clampQuantity(item, amount);
    if (next !== stored) onUpdateQuantity?.(item, next);
    return true;
  };

  // המשקל נשמר מיד אחרי ההקלדה, וכך גם אם יוצאים מהשדה או נוגעים במקום אחר ברשימה
  useEffect(() => {
    const timer = setTimeout(() => save(text), 700);
    return () => clearTimeout(timer);
  }, [text]);

  // יציאה מהשדה עם ערך לא תקין מחזירה את המשקל הקודם במקום להשאיר שדה ריק
  const commit = (raw) => {
    if (!save(raw)) setText(String(stored));
    else setText(String(clampQuantity(item, Number(String(raw).replace(",", ".")))));
  };

  return (
    <div className="mkc-qty">
      <input
        value={text}
        inputMode="decimal"
        aria-label={`${t("productItem.weight")} ${unitLabel ? `(${unitLabel})` : ""}`}
        className="mkc-amount"
        onChange={(event) => setText(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
      />
      <button type="button" onClick={onSwitchUnit} aria-pressed={unit === "kg"} aria-label={t("productItem.switchUnit")} className="mkc-unit">
        {unitLabel}
      </button>
      <button type="button" onClick={() => onRemove?.(item)} aria-label={t("productItem.remove")} className="mkc-step mkc-remove">
        <Trash2 className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}