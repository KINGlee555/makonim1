import { Link } from "react-router-dom";
import { ArrowRight, Mail, MessageCircle, Info } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const CONTACT_EMAIL = "alan.novitsky@gmail.com";

export default function Contact() {
  return (
    <div dir="rtl" className="min-h-screen bg-background px-4 py-8">
      <div className="responsive-container mx-auto max-w-xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          <ArrowRight className="h-4 w-4" />
          חזרה לרשימות
        </Link>

        <div className="rounded-3xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <MessageCircle className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-foreground">יצירת קשר</h1>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            שאלה, תקלה, רעיון לשיפור או בקשת פיצ׳ר? כתבו לנו ונחזור אליכם בהקדם.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=MaKonim`}
            className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-4 font-bold text-primary-foreground shadow-sm"
          >
            <Mail className="h-5 w-5 flex-shrink-0" />
            <span className="min-w-0 break-all">{CONTACT_EMAIL}</span>
          </a>

          <div className="mt-5 flex items-start gap-2 rounded-2xl bg-secondary p-4 text-xs leading-relaxed text-secondary-foreground">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              האפליקציה מפותחת ומתוחזקת על ידי אלן נוביצקי. מידע נוסף על האפליקציה נמצא{" "}
              <Link to="/about" className="font-semibold underline">בעמוד האודות</Link>.
            </span>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  );
}