import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/067697bc9_logo.png";

// מעטפת לכל מסכי הפנים בשפת כרזת השוק: פס צהוב עם המיתוג, כפתור חזרה,
// כותרת המסך והתיאור — ומתחת גוף לבן עם התחתית של האפליקציה.
export default function PosterPage({ title, subtitle, icon: Icon, back = "/", backLabel = "חזרה לרשימות", children }) {
  return (
    <div dir="rtl" className="pst-page pst-inner">
      <header className="pst-top">
        <div className="pst-topline">
          <span className="pst-brand">
            <span>MaKonim</span>
            <img src={LOGO} alt="MaKonim" />
          </span>
          <Link to={back} className="pst-back" aria-label={backLabel} title={backLabel}>
            <ArrowRight />
          </Link>
        </div>

        <h1>
          {Icon && <Icon />}
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </header>

      <main className="pst-main">
        {children}
        <AppFooter />
      </main>
    </div>
  );
}