import { ArrowDownWideNarrow, Store } from "lucide-react";

export default function ListSortBar({ mode, onMode, onCompare, disabled }) {
  return (
    <div className="pw-sort">
      <ArrowDownWideNarrow className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>מיון לפי מחלקות</span>
      <select aria-label="מיון הרשימה" value={mode} onChange={event => onMode(event.target.value)}>
        <option value="category">לפי מחלקה</option>
        <option value="cheap">הכי זול</option>
      </select>
      <button type="button" onClick={onCompare} disabled={disabled} className="pw-cmp">
        <Store className="h-4 w-4" aria-hidden="true" />השוואת סל
      </button>
      {mode === "cheap" && (
        <p className="pw-sort-note">כל הרשימה מהזול ליקר לפי מחיר ליחידה או לק״ג. מוצרים ללא מחיר מופיעים בסוף.</p>
      )}
    </div>
  );
}