import { useState } from "react";
import { Download, MoreVertical, Share } from "lucide-react";
import useInstallPrompt from "@/lib/pwaInstall";
import NoticeCard from "@/components/notice/NoticeCard";

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
    <NoticeCard
      icon={<Download className="h-5 w-5" />}
      title="שווה להוסיף את האפליקציה למסך הבית"
      text="אחר כך פותחים את רשימת הקניות בלחיצה אחת — בלי לחפש בדפדפן. זה בחינם."
      onClose={hide}
    >
      {canInstall ? (
        <button
          type="button"
          onClick={install}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-black text-primary-foreground"
        >
          <Download className="h-5 w-5" />
          הוסף את האפליקציה
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowSteps(v => !v)}
            aria-expanded={showSteps}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-5 text-base font-black text-foreground"
          >
            <Share className="h-5 w-5" />
            {showSteps ? "סגור את ההסבר" : "איך עושים את זה?"}
          </button>

          {showSteps && (
            <ol className="mt-3 space-y-2">
              {steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 rounded-xl bg-secondary px-3 py-2">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-base font-black text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-[15px] font-bold leading-relaxed text-secondary-foreground">
                    {step}
                  </span>
                </li>
              ))}
              <li className="flex items-center gap-2 pt-1 text-sm font-bold text-muted-foreground">
                {isIos ? <Share className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
                ההסבר מתאים לדפדפן הזה.
              </li>
            </ol>
          )}
        </>
      )}
    </NoticeCard>
  );
}