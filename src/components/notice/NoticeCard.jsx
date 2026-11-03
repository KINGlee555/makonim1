import { X } from "lucide-react";

// כרטיס הודעה אחיד לפעולות בעמוד הראשי — כותרת, הסבר קצר, כפתור וסגירה.
// הצבעים מגיעים מצבעי המערכת, כך שהטקסט קריא תמיד — גם במצב בהיר וגם בכהה.
export default function NoticeCard({ icon, title, text, onClose, closeLabel = "סגור", children }) {
  return (
    <section
      dir="rtl"
      className="mx-4 mt-3 rounded-2xl border-2 border-border bg-card px-4 py-3 text-foreground shadow-sm sm:mx-7 lg:mx-12"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black leading-snug text-foreground sm:text-lg">{title}</h2>
          {text && (
            <p className="mt-1 text-[15px] font-bold leading-relaxed text-muted-foreground">{text}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-border text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </section>
  );
}