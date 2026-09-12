import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBasket } from "lucide-react";
import AppFooter from "@/components/AppFooter";

export default function About() {
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
              <ShoppingBasket className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-foreground">אודות MaKonim</h1>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              MaKonim היא אפליקציית רשימות קניות משפחתית משותפת. במקום פתקים על המקרר או הודעות
              וואטסאפ שנעלמות, כל המשפחה מנהלת רשימה אחת שמתעדכנת בזמן אמת: מה שאבא מוסיף בבית
              נראה מיד למי שכבר עומד בסופר, ומה שמסומן כנקנה נעלם מהרשימה של כולם באותו רגע.
            </p>
            <p>
              האפליקציה כוללת קטלוג מוצרים גדול עם תמונות אמיתיות של מוצרים ומותגים מהארץ, חיפוש
              מהיר, הוספה בקול, סריקת ברקוד וסריקת קבלות. אפשר להשוות מחירי סל בין רשתות, לקבל
              הצעות חכמות לפי היסטוריית הקניות, לנהל מוצרים מועדפים וקבועים, לעקוב אחרי תקציב,
              לחלק עלויות בין בני הבית ולנווט לחנות הקרובה או הזולה דרך Waze או Google Maps.
              מצב קנייה מסדר את הרשימה לפי מדפי החנות, ומצב נגישות מגדיל טקסטים וכפתורים.
            </p>
            <p>
              האפליקציה מיועדת לכל המשפחה — זוגות, הורים וילדים, שותפים לדירה וגם מבוגרים שרוצים
              ממשק פשוט וברור בעברית. השימוש חינמי ולא דורש ידע טכני: יוצרים רשימה, שולחים קישור
              שיתוף אחד, וכולם בפנים.
            </p>
            <p>
              MaKonim מפותחת ומתוחזקת על ידי אלן נוביצקי, כפרויקט עצמאי שנולד מצורך אמיתי בבית.
              יש רעיון, באג או בקשת פיצ׳ר? נשמח לשמוע דרך <Link to="/contact" className="font-semibold text-primary">עמוד יצירת הקשר</Link>.
            </p>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  );
}