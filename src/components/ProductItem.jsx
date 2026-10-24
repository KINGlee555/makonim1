import { memo } from "react";
import { Plus, Minus, MapPin, Check, Pencil, CircleSlash2, Star, Camera } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";
import { cardTone } from "@/lib/marketPalette";

function ProductItem({ item, onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onUnavailable, onToggleFavorite, onChangePhoto, isFavorite, paletteIndex = 0, className }) {
  const t = useT();
  const unitLabel = t(`unit.${item.unit || "unit"}`);
  const ribbon = item.note ? item.note.slice(0, 14) : (isFavorite ? t("favorites.saved") : "");

  return (
    <article className={`group relative flex min-h-[330px] flex-col gap-3 overflow-hidden rounded-[30px] border-4 border-market-ink px-5 pt-[22px] pb-[18px] shadow-[0_8px_0_hsl(var(--market-ink))] mk-pop ${cardTone(paletteIndex)} ${className || ""}`}>
      {ribbon && (
        <span className="absolute left-[-34px] top-[14px] w-[130px] -rotate-[35deg] bg-market-pink py-1 text-center text-[15px] font-black text-white">{ribbon}</span>
      )}

      <button
        type="button"
        className="relative h-28 w-full overflow-hidden rounded-[20px] border-[3px] border-market-ink bg-market-surface"
        onClick={() => onNavigate && onNavigate(item)}
        aria-label={item.name}
      >
        <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        {onNavigate && (
          <span className="absolute bottom-1.5 end-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-market-surface text-market-ink shadow-sm">
            <MapPin className="h-4 w-4" />
          </span>
        )}
      </button>

      <h3 className="product-name text-[22px] font-black leading-tight tracking-[-1px] text-market-ink">{item.name}</h3>

      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 rounded-xl border-2 border-market-ink bg-market-surface px-2.5 py-0.5 text-sm font-extrabold text-market-ink">
          {item.category || t("summary.other")}{item.unit && item.unit !== "unit" ? ` · ${unitLabel}` : ""}
        </span>
        {item.price > 0 && <span className="whitespace-nowrap text-[28px] font-black leading-none tracking-[-1px] text-market-pink">₪{Number(item.price).toFixed(2)}</span>}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if ((item.quantity || 1) <= 1) { onRemove && onRemove(item); } else { onUpdateQuantity(item, (item.quantity || 1) - 1); } }}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-market-blue text-white" aria-label="הפחתה">
            <Minus className="h-5 w-5" />
          </button>
          <span className="min-w-[30px] text-center text-3xl font-black text-market-ink">{item.quantity || 1}</span>
          <button onClick={() => onUpdateQuantity(item, (item.quantity || 1) + 1)}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-market-pink text-white" aria-label="הוספה">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <button onClick={() => onToggleBought(item)} className="flex h-[46px] items-center justify-center gap-1.5 rounded-[23px] bg-market-ink px-4 text-[17px] font-black text-white" title={t("productItem.bought")}>
          <Check className="h-4 w-4" />
          {t("productItem.bought")}
        </button>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {onChangePhoto && (
          <button onClick={() => onChangePhoto(item)} aria-label={`החלפת תמונה: ${item.name}`} className="flex items-center gap-1 text-sm font-extrabold text-market-ink underline">
            <Camera className="h-3.5 w-3.5" />החלף תמונה
          </button>
        )}
        <button onClick={() => onToggleFavorite(item)} aria-label={`${isFavorite ? t("favorites.remove") : t("favorites.save")}: ${item.name}`} className={`flex items-center gap-1 text-sm font-extrabold underline ${isFavorite ? "text-market-pink" : "text-market-ink"}`}>
          <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-market-pink" : ""}`} />{isFavorite ? t("favorites.saved") : t("favorites.save")}
        </button>
        <button onClick={() => onEdit(item)} aria-label={`${t("productItem.edit")}: ${item.name}`} className="flex items-center gap-1 text-sm font-extrabold text-market-ink underline">
          <Pencil className="h-3.5 w-3.5" />{t("productItem.edit")}
        </button>
        <button onClick={() => onUnavailable(item)} aria-label={`${t("productItem.notFound")}: ${item.name}`} className="flex items-center gap-1 text-sm font-extrabold text-market-ink underline">
          <CircleSlash2 className="h-3.5 w-3.5" />{t("productItem.notFound")}
        </button>
      </div>
    </article>
  );
}

export default memo(ProductItem);