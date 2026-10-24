import { Link } from "react-router-dom";
import { useT } from "@/lib/i18n";

export default function AppFooter() {
  const t = useT();
  return (
    <footer className="mt-8 text-center">
      <div className="flex items-center justify-center gap-2">
        <Link to="/about" className="mx-2 text-[15px] font-black text-market-blue no-underline">אודות</Link>
        <span className="text-market-blue/50">•</span>
        <Link to="/contact" className="mx-2 text-[15px] font-black text-market-blue no-underline">יצירת קשר</Link>
      </div>
      <p className="mt-1.5 text-[11px] font-bold text-muted-foreground/70">{t("footer.credit")}</p>
    </footer>
  );
}