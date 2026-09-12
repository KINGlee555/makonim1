import { RotateCcw } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";

export default function UnavailableItem({ item, onRestore }) {
  const t = useT();
  return (
    <article className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-2.5">
      <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} className="h-14 w-14 rounded-lg opacity-60" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-muted-foreground">{item.name}</h3>
        <p className="text-xs text-muted-foreground">{t("productItem.unavailable")}</p>
      </div>
      <button onClick={() => onRestore(item)} aria-label={`${t("productItem.restore")}: ${item.name}`} className="flex h-10 items-center gap-1.5 rounded-xl bg-card px-3 text-sm font-semibold text-primary shadow-sm">
        <RotateCcw className="h-4 w-4" />{t("productItem.restore")}
      </button>
    </article>
  );
}