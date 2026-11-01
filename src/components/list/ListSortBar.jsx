import { ArrowDownWideNarrow, Store } from "lucide-react";

export default function ListSortBar({ mode, onMode, onCompare, disabled }) {
  return (
    <div className="pst-panel-slot">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 text-card-foreground">
        <label className="flex min-w-0 items-center gap-2 text-sm font-bold">
          <ArrowDownWideNarrow className="h-4 w-4 shrink-0" aria-hidden="true" />
          מיון הרשימה
          <select aria-label="מיון הרשימה" value={mode} onChange={event => onMode(event.target.value)} className="min-h-10 rounded-lg border border-input bg-background px-2 text-foreground">
            <option value="category">לפי מחלקה</option>
            <option value="cheap">הכי זול</option>
          </select>
        </label>
        <button type="button" onClick={onCompare} disabled={disabled} className="ms-auto inline-flex min-h-10 items-center gap-1 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
          <Store className="h-4 w-4" aria-hidden="true" />השוואת מחיר הסל
        </button>
        {mode === "cheap" && <p className="w-full text-xs text-muted-foreground">כל הרשימה מהזול ליקר לפי מחיר ליחידה או לק״ג. מוצרים ללא מחיר מופיעים בסוף.</p>}
      </div>
    </div>
  );
}