import { Link } from "react-router-dom";
import { useT } from "@/lib/i18n";

export default function AppFooter() {
  const t = useT();
  return (
    <footer className="pt-8 pb-2 text-center">
      <div className="mb-2 flex items-center justify-center gap-3 text-xs font-medium text-muted-foreground">
        <Link to="/about" className="hover:text-primary">אודות</Link>
        <span className="text-muted-foreground/40">•</span>
        <Link to="/contact" className="hover:text-primary">יצירת קשר</Link>
      </div>
      <div className="text-[10px] text-muted-foreground/40">{t("footer.credit")}</div>
    </footer>
  );
}