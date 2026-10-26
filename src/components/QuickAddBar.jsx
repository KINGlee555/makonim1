import { ScanLine } from "lucide-react";
import { useT } from "@/lib/i18n";

// שני הכפתורים הגדולים בתחתית המסך — הוספת מוצר וסיום קנייה — וכפתור סריקה עגול לצידם.
export default function QuickAddBar({ onOpenSearch, onOpenScanner, onOpenShoppingMode }) {
  const t = useT();

  return (
    <div className="shf-dock">
      <div className="shf-dock-in">
        <button type="button" onClick={onOpenSearch} aria-label={t("big.add")} className="shf-add">
          {t("big.add")}
        </button>
        <button type="button" onClick={onOpenShoppingMode} aria-label={t("shoppingMode.title")} className="shf-fin">
          {t("big.finish")}
        </button>
        <button type="button" onClick={onOpenScanner} aria-label={t("barcode.title")} className="shf-scan">
          <ScanLine className="h-7 w-7" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}