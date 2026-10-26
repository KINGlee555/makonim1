import { RotateCcw } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";

// מוצר שלא נמצא בחנות — נשאר ברשימה בשקט, עם אפשרות להחזיר אותו לקנייה.
export default function UnavailableItem({ item, onRestore }) {
  const t = useT();

  return (
    <div className="flex items-center gap-3 border-b-2 border-[#f1f1f1] py-2.5 last:border-b-0">
      <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} barcode={item.barcode}
        className="h-11 w-11 flex-none rounded-lg object-cover opacity-50" />
      <div className="min-w-0 flex-1">
        <p className="shf-nm truncate text-[16px]">{item.name}</p>
        <p className="shf-meta">{t("productItem.unavailable")}</p>
      </div>
      <button type="button" onClick={() => onRestore(item)} aria-label={`${t("productItem.restore")}: ${item.name}`}
        className="shf-small-btn inline-flex flex-none items-center gap-1.5">
        <RotateCcw className="h-4 w-4" />{t("productItem.restore")}
      </button>
    </div>
  );
}