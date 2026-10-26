import { ScanLine } from "lucide-react";
import { useT } from "@/lib/i18n";

// פס הפעולות התחתון: הוספת מוצר וסיום קנייה משני צידי הפס, וכפתור סריקה עגול שבולט מעליו.
export default function QuickAddBar({ onOpenSearch, onOpenScanner, onOpenShoppingMode }) {
  const t = useT();

  return (
    <div className="pst-dock">
      <button type="button" onClick={onOpenSearch} aria-label={t("big.add")} className="pst-add">
        {t("big.add")}
      </button>
      <button type="button" onClick={onOpenShoppingMode} aria-label={t("shoppingMode.title")} className="pst-fin">
        {t("big.finish")}
      </button>
      <button type="button" onClick={onOpenScanner} aria-label={t("barcode.title")} className="pst-scan">
        <ScanLine strokeWidth={2.2} />
      </button>
    </div>
  );
}