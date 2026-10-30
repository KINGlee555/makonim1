import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// הודעת גיל לפני שמוצר אלכוהול או טבק נכנס לרשימה.
// המכירה עצמה נעשית בקופה, ולכן ההודעה מבהירה שגם שם תידרש תעודה מזהה.
export default function AgeGateDialog({ gate, onConfirm, onCancel }) {
  const tobacco = gate?.kind === "tobacco";

  return (
    <Dialog open={!!gate} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <ShieldAlert className="h-6 w-6 flex-none text-pst-pink" />
            מוצר מגיל 18 ומעלה
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm font-semibold leading-relaxed">
              <p>
                {tobacco ? "סיגריות ומוצרי טבק" : "מוצרי אלכוהול"} מיועדים לבני 18 ומעלה בלבד.
                על פי חוק חל איסור למכור או להעביר מוצרים אלה לקטינים, וגם לא למי שנראה צעיר
                מגיל 18 ללא תעודה מזהה.
              </p>
              <p className="rounded-lg bg-pst-yellow px-3 py-2 font-black text-pst-ink">
                {gate?.name}
              </p>
              <p>
                MaKonim אינה מוכרת את המוצר — היא רק מציגה את המחיר והזמינות שפורסמו על ידי
                הרשת. הרכישה בפועל בקופה או באתר הרשת, ושם תידרש הצגת תעודה מזהה.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row-reverse">
          <Button onClick={onConfirm} className="min-h-11 font-black">
            אני מעל 18 — הוסף לרשימה
          </Button>
          <Button variant="outline" onClick={onCancel} className="min-h-11 font-black">
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}