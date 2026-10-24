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
    <footer className="mt-8 text-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link to="/about" className="mx-2 text-[15px] font-black text-market-blue no-underline">אודות</Link>
        <span className="text-market-blue/50">•</span>
        <Link to="/contact" className="mx-2 text-[15px] font-black text-market-blue no-underline">יצירת קשר</Link>
        {isAdmin && (
          <>
            <span className="text-market-blue/50">•</span>
            <Link to="/photo-suggestions" className="mx-2 text-[15px] font-black text-market-pink no-underline">{t("footer.suggestions")}</Link>
            <span className="text-market-blue/50">•</span>
            <Link to="/sponsored" className="mx-2 text-[15px] font-black text-market-pink no-underline">{t("sponsored.admin")}</Link>
          </>
        )}
      </div>
      <p className="mt-1.5 text-[11px] font-bold text-muted-foreground/70">{t("footer.credit")}</p>
    </footer>
  );
}