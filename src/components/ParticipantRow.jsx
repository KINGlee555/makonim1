import { Trash2 } from "lucide-react";

// שורה אחת ברשימת המשתתפים — עם כפתור הסרה לבעל הרשימה
export default function ParticipantRow({ icon, label, sub, onRemove, removeLabel }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-market-track bg-market-surface px-3 py-2.5">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-market-blue-soft text-market-ink">
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-start">
        <p className="truncate text-[16px] font-extrabold text-market-ink">{label}</p>
        {sub && <span className="block truncate text-xs font-bold text-market-ink/60">{sub}</span>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        title={removeLabel}
        aria-label={removeLabel}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-market-pink bg-market-pink-tint text-market-pink"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}