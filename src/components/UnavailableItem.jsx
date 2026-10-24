import { RotateCcw } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";

export default function UnavailableItem({ item, onRestore }) {
  const t = useT();
  return (
    <article className="flex items-center gap-3 rounded-[26px] border-[3px] border-dashed border-market-ink/40 bg-market-blue-soft p-3">
      <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} className="h-14 w-14 flex-shrink-0 rounded-2xl border-2 border-market-ink/40 opacity-60" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-black text-market-ink/70">{item.name}</h3>
        <p className="text-sm font-bold text-market-ink/50">{t("productItem.unavailable")}</p>
      </div>
      <button onClick={() => onRestore(item)} aria-label={`${t("productItem.restore")}: ${item.name}`} className="flex h-11 flex-shrink-0 items-center gap-1.5 rounded-[22px] bg-market-ink px-3.5 text-[15px] font-black text-white">
        <RotateCcw className="h-4 w-4" />{t("productItem.restore")}
      </button>
    </article>
  );
}