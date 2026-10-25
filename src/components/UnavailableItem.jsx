import { RotateCcw } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";
import { uiBannerAction } from "@/lib/minimalUi";

export default function UnavailableItem({ item, onRestore }) {
  const t = useT();
  return (
    <div className="flex items-center gap-3 border-b border-ui-line-soft py-1.5">
      <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} barcode={item.barcode}
        className="h-10 w-10 flex-shrink-0 rounded-lg object-cover opacity-50" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] text-ui-muted">{item.name}</p>
        <p className="text-[12px] text-ui-muted">{t("productItem.unavailable")}</p>
      </div>
      <button type="button" onClick={() => onRestore(item)} aria-label={`${t("productItem.restore")}: ${item.name}`}
        className={`${uiBannerAction} inline-flex items-center gap-1`}>
        <RotateCcw className="h-3.5 w-3.5" />{t("productItem.restore")}
      </button>
    </div>
  );
}