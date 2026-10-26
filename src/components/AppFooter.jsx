import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

export default function AppFooter() {
  const t = useT();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => setIsAdmin(me?.role === "admin")).catch(() => {});
  }, []);

  return (
    <footer className="pst-ft">
      <Link to="/about">אודות</Link>
      <Link to="/contact">יצירת קשר</Link>
      {isAdmin && (
        <>
          <Link to="/photo-suggestions">{t("footer.suggestions")}</Link>
          <Link to="/price-reports">{t("footer.priceReports")}</Link>
          <Link to="/sponsored">{t("sponsored.admin")}</Link>
          <Link to="/premium-members">מנויי פרימיום</Link>
        </>
      )}
      <span className="pst-credit">{t("footer.credit")}</span>
    </footer>
  );
}