import { memo } from "react";
import { Plus, Minus, MapPin, Check } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";

function ProductItem({ item, onToggleBought, onUpdateQuantity, onNavigate, onRemove, className }) {
  const t = useT();
  return (
    <article className={`group grid grid-cols-[5rem_minmax(0,1fr)] gap-3 rounded-xl border border-primary/10 bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md animate-slide-up ${className || ""}`}>
      <button
        type="button"
        className="relative h-20 w-20 overflow-hidden rounded-lg bg-secondary"
        onClick={() => onNavigate && onNavigate(item)}
        aria-label={item.name}
      >
        <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        {onNavigate && (
          <span className="absolute bottom-1 end-1 flex h-6 w-6 items-center justify-center rounded-full bg-card/95 text-primary shadow-sm">
            <MapPin className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.category || ""}</p>
          </div>
          {item.price > 0 && <span className="whitespace-nowrap text-base font-bold text-foreground">₪{Number(item.price).toFixed(2)}</span>}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center overflow-hidden rounded-lg bg-secondary">
            <button onClick={() => { if ((item.quantity || 1) <= 1) { onRemove && onRemove(item); } else { onUpdateQuantity(item, (item.quantity || 1) - 1); } }} className="flex h-9 w-10 items-center justify-center text-secondary-foreground" aria-label="הפחתה">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-base font-bold text-foreground">{item.quantity || 1}</span>
            <button onClick={() => onUpdateQuantity(item, (item.quantity || 1) + 1)} className="flex h-9 w-10 items-center justify-center text-primary" aria-label="הוספה">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => onToggleBought(item)} className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm" title={t("productItem.bought")}>
            <Check className="h-4 w-4" />
            {t("productItem.bought")}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductItem);