import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

const link = "text-[18px] text-big-muted no-underline hover:text-big-ink sm:text-[20px]";

export default function AppFooter() {
  const t = useT();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => setIsAdmin(me?.role === "admin")).catch(() => {});
  }, []);

  return (
    <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 sm:mt-[44px]">
      <Link to="/about" className={link}>אודות</Link>
      <Link to="/contact" className={link}>יצירת קשר</Link>
      {isAdmin && (
        <>
          <Link to="/photo-suggestions" className={link}>{t("footer.suggestions")}</Link>
          <Link to="/price-reports" className={link}>{t("footer.priceReports")}</Link>
          <Link to="/sponsored" className={link}>{t("sponsored.admin")}</Link>
        </>
      )}
      <span className="w-full text-center text-[16px] text-big-muted">{t("footer.credit")}</span>
    </footer>
  );
}