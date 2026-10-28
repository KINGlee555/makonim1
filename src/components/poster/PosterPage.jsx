import Link from "@/components/poster/PosterLink";
import { ArrowRight } from "lucide-react";
import AppFooter from "@/components/AppFooter";
import DarkModeToggle from "@/components/DarkModeToggle";
import SkinToggle from "@/components/SkinToggle";
import { useT } from "@/lib/i18n";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/067697bc9_logo.png";

// מעטפת לכל מסכי הפנים בשפת כרזת השוק: פס צהוב עם המיתוג, כפתור חזרה,
// כותרת המסך והתיאור — ומתחת גוף לבן עם התחתית של האפליקציה.
export default function PosterPage({ title, subtitle, icon: Icon, back = "/", backLabel = "חזרה", children }) {
  const t = useT();
  return (
    <div dir="rtl" className="pst-page pst-inner">
      <header className="pst-top">
        <div className="pst-topline">
          <span className="pst-brand">
            <span>MaKonim</span>
            <img src={LOGO} alt="MaKonim" />
          </span>
          <Link to={back} className="pst-backlink" aria-label={backLabel} title={backLabel}>
            <ArrowRight />
            <span>{t("header.back")}</span>
          </Link>
          <div className="pst-topacts">
            <SkinToggle className="pst-back" />
            <DarkModeToggle className="pst-back" />
          </div>
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