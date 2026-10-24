import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { uiLink } from "@/lib/minimalUi";

export default function AppFooter() {
  const t = useT();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => setIsAdmin(me?.role === "admin")).catch(() => {});
  }, []);

  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-5 text-[13px] text-ui-muted">
      <Link to="/about" className={`${uiLink} no-underline`}>אודות</Link>
      <Link to="/contact" className={`${uiLink} no-underline`}>יצירת קשר</Link>
      {isAdmin && (
        <>
          <Link to="/photo-suggestions" className={`${uiLink} no-underline`}>{t("footer.suggestions")}</Link>
          <Link to="/sponsored" className={`${uiLink} no-underline`}>{t("sponsored.admin")}</Link>
        </>
      )}
      <span className="w-full text-center text-[11px] text-ui-muted">{t("footer.credit")}</span>
    </footer>
  );
}