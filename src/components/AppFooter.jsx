import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { lastListId, lastListPath } from "@/lib/lastList";

// תחתית כל מסך פנים: שורת ניווט קבועה בין המסכים הראשיים, קישורי הניהול למנהל,
// והקרדיט. הניווט כאן חוסך את החזרה לרשימה כדי לעבור למסך אחר.
export default function AppFooter() {
  const t = useT();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => setIsAdmin(me?.role === "admin")).catch(() => {});
  }, []);

  const listId = lastListId();
  const listPath = lastListPath();

  return (
    <footer className="pst-ft">
      <nav aria-label={t("header.nav")} className="flex flex-wrap items-center gap-2">
        <Link to={listPath} className="pst-btn pst-btn-sm">{t("header.myList")}</Link>
        {listId && <Link to={`/history/${listId}`} className="pst-btn pst-btn-sm">{t("header.history")}</Link>}
        {listId && <Link to={`/summary/${listId}`} className="pst-btn pst-btn-sm">{t("header.summary")}</Link>}
        <Link to="/about" className="pst-btn pst-btn-sm">אודות</Link>
        <Link to="/contact" className="pst-btn pst-btn-sm">יצירת קשר</Link>
      </nav>
      <nav aria-label={t("header.nav")} className="flex flex-wrap items-center gap-2">
        <Link to="/terms">{t("footer.terms")}</Link>
        <Link to="/privacy">{t("footer.privacy")}</Link>
        <Link to="/accessibility">{t("footer.accessibility")}</Link>
      </nav>
      {isAdmin && (
        <nav className="flex flex-wrap items-center gap-2">
          <Link to="/photo-suggestions">{t("footer.suggestions")}</Link>
          <Link to="/price-reports">{t("footer.priceReports")}</Link>
          <Link to="/sponsored">{t("sponsored.admin")}</Link>
          <Link to="/premium-members">מנויי פרימיום</Link>
        </nav>
      )}
      <span className="pst-credit">{t("footer.credit")}</span>
    </footer>
  );
}