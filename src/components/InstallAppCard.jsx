import { useState } from "react";
import { Download, MoreVertical, Share, X } from "lucide-react";
import useInstallPrompt from "@/lib/pwaInstall";

// הזמנה להתקין את האפליקציה על מסך הבית — בלשון פשוטה ובכפתורים גדולים,
// כדי שגם מי שלא רגיל בדפדפן יצליח לבד. מופיעה רק כל עוד האפליקציה לא מותקנת.
export default function InstallAppCard() {
  const { visible, canInstall, isIos, install, hide } = useInstallPrompt();
  const [showSteps, setShowSteps] = useState(false);

  if (!visible) return null;

  const steps = isIos
    ? [
        "לחצו על כפתור השיתוף בתחתית המסך (ריבוע עם חץ כלפי מעלה).",
        'גללו למטה ובחרו "הוסף למסך הבית".',
        'לחצו "הוסף" בפינה העליונה — וזהו.',
      ]
    : [
        "לחצו על שלוש הנקודות בפינה העליונה של הדפדפן.",
        'בחרו "התקנת אפליקציה" או "הוספה למסך הבית".',
        'לחצו "התקן" — וזהו.',
      ];

  return (
    <div className="pst-panel-slot">
      <section className="pst-panel" aria-label="התקנת האפליקציה על מסך הבית">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
            <Download className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black leading-snug text-foreground">
              שווה להוסיף את האפליקציה למסך הבית
            </h2>
            <p className="mt-1 text-base font-bold leading-relaxed text-muted-foreground">
              אחר כך פותחים את רשימת הקניות בלחיצה אחת — בלי לחפש בדפדפן. זה בחינם.
            </p>
          </div>
          <button type="button" onClick={hide} aria-label="לא עכשיו"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-border text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {canInstall ? (
          <button type="button" onClick={install}
            className="mt-3 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-lg font-black text-primary-foreground">
            <Download className="h-5 w-5" />
            הוסף את האפליקציה
          </button>
        ) : (
          <button type="button" onClick={() => setShowSteps(v => !v)}
            aria-expanded={showSteps}
            className="mt-3 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full border-2 border-primary bg-card px-5 text-lg font-black text-foreground">
            <Share className="h-5 w-5" />
            {showSteps ? "סגור את ההסבר" : "איך עושים את זה?"}
          </button>
        )}

        {!canInstall && showSteps && (
          <ol className="mt-3 space-y-2">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 rounded-xl bg-secondary px-3 py-2">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-base font-black text-primary-foreground">
                  {index + 1}
                </span>
                <span className="pt-1 text-base font-bold leading-relaxed text-foreground">{step}</span>
              </li>
            ))}
            <li className="flex items-center gap-2 pt-1 text-sm font-bold text-muted-foreground">
              {isIos ? <Share className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
              הסבר זה מתאים לדפדפן הזה.
            </li>
          </ol>
        )}

        <button type="button" onClick={hide}
          className="mt-2 min-h-[44px] w-full text-base font-bold text-muted-foreground">
          לא עכשיו
        </button>
      </section>
    </div>
  );
}