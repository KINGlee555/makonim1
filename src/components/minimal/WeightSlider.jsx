import { useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";
import { useT } from "@/lib/i18n";
import { MAX_WEIGHT_KG, weightInKg } from "@/lib/units";

// מד משקל למוצרים שנקנים לפי משקל — גרירה אחת מ-100 גרם ועד 10 ק״ג.
// הקיצורים נותנים את המשקלים השכיחים (חצי קילו, קילו, 2 ו-5) בלחיצה אחת.
const QUICK_KG = [0.25, 0.5, 1, 2, 5];
const STEP_KG = 0.1;

const roundKg = (value) => Math.round(value * 100) / 100;

export default function WeightSlider({ item, onUpdateQuantity }) {
  const t = useT();
  const kg = weightInKg(item) || 1;
  const [draft, setDraft] = useState(kg);
  // רק שינוי שהמשתמש עשה נשמר — פתיחת הרשימה לא מזיזה משקל קיים
  const touched = useRef(false);

  // שינוי מבחוץ (החלפת יחידה, עדכון מהשרת) מיישר גם את המד
  useEffect(() => {
    setDraft(weightInKg(item) || 1);
    touched.current = false;
  }, [item.id, item.quantity, item.unit]);

  const save = (value) => {
    const next = item.unit === "gram" ? Math.round(value * 1000) : roundKg(value);
    if (next !== Number(item.quantity)) onUpdateQuantity?.(item, next);
  };

  // הגרירה נשמרת מיד בסיום, והקלדה מדויקת נשמרת אחרי רגע של שקט
  useEffect(() => {
    if (!touched.current) return;
    const timer = setTimeout(() => save(draft), 400);
    return () => clearTimeout(timer);
  }, [draft]);

  const change = (value) => {
    touched.current = true;
    setDraft(value);
  };

  const weightText = draft < 1
    ? `${Math.round(draft * 1000)} ${t("unit.gram")}`
    : `${roundKg(draft)} ${t("unit.kg")}`;

  return (
    <div className="pst-weight">
      <div className="pst-weight-top">
        <Scale aria-hidden="true" />
        <span>{t("productItem.weight")}</span>
        <span className="pst-weight-val">{weightText}</span>
      </div>
      <input
        type="range"
        className="pst-range"
        min={STEP_KG}
        max={MAX_WEIGHT_KG}
        step={STEP_KG}
        value={draft}
        aria-label={`${t("productItem.weight")}: ${item.name}`}
        aria-valuetext={weightText}
        onChange={(event) => change(Number(event.target.value))}
        onPointerUp={() => touched.current && save(draft)}
        onKeyUp={() => touched.current && save(draft)}
      />
      <div className="pst-weight-chips">
        {QUICK_KG.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => { change(value); save(value); }}
            aria-pressed={roundKg(kg) === value}
            className={`pst-wchip ${roundKg(kg) === value ? "pst-wchip-on" : ""}`}
          >
            {value < 1 ? `${Math.round(value * 1000)} ${t("unit.gram")}` : `${value} ${t("unit.kg")}`}
          </button>
        ))}
      </div>
    </div>
  );
}