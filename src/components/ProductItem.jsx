import { memo } from "react";
import { Plus, Minus, MapPin, Check, MoreVertical, Pencil, CircleSlash2, Star, Camera } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";
import { cardTone } from "@/lib/marketPalette";
import { isGram, lineCost, quantityStep } from "@/lib/units";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function ProductItem({ item, onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onUnavailable, onToggleFavorite, onChangePhoto, onPhotoFound, isFavorite, paletteIndex = 0, className }) {
  const t = useT();
  const unit = item.unit || "unit";
  const quantity = Number(item.quantity) || 1;
  const step = quantityStep(unit);
  const unitLabel = unit === "unit" ? "" : t(`unit.${unit}`);
  const cost = lineCost(item);
  const rate = isGram(unit) || unit === "kg" ? Number(item.price) || 0 : 0;
  const ribbon = item.note ? item.note.slice(0, 14) : (isFavorite ? t("favorites.saved") : "");

  return (
    <article className={`group relative flex min-h-[330px] flex-col gap-3 overflow-hidden rounded-[30px] border-4 border-market-ink px-5 pt-[22px] pb-[18px] shadow-[0_8px_0_hsl(var(--market-ink))] mk-pop ${cardTone(paletteIndex)} ${className || ""}`}>
      {ribbon && (
        <span className="absolute left-[-34px] top-[14px] w-[130px] -rotate-[35deg] bg-market-pink py-1 text-center text-[15px] font-black text-white">{ribbon}</span>
      )}

      <div className="relative h-28 overflow-hidden rounded-[20px] border-[3px] border-market-ink bg-market-surface">
        <button type="button" className="h-full w-full" onClick={() => onNavigate && onNavigate(item)} aria-label={item.name}>
          <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url}
            onFound={(url) => onPhotoFound && onPhotoFound(item, url)}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`${t("productItem.more")}: ${item.name}`} className="absolute start-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-market-surface shadow-sm">
              {isFavorite ? <Star className="h-4 w-4 fill-market-pink text-market-pink" /> : <MoreVertical className="h-4 w-4 text-market-ink" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 rounded-2xl">
            <DropdownMenuItem onClick={() => onToggleFavorite(item)}>
              <Star className={`me-2 h-4 w-4 ${isFavorite ? "fill-market-pink text-market-pink" : ""}`} />
              {isFavorite ? t("favorites.remove") : t("favorites.save")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="me-2 h-4 w-4" />{t("productItem.edit")}
            </DropdownMenuItem>
            {onChangePhoto && (
              <DropdownMenuItem onClick={() => onChangePhoto(item)}>
                <Camera className="me-2 h-4 w-4" />{t("productItem.changePhoto")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onUnavailable(item)}>
              <CircleSlash2 className="me-2 h-4 w-4" />{t("productItem.notFound")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onNavigate && (
          <span className="absolute bottom-1.5 end-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-market-surface text-market-ink shadow-sm">
            <MapPin className="h-4 w-4" />
          </span>
        )}
      </div>

      <h3 className="product-name text-[22px] font-black leading-tight tracking-[-1px] text-market-ink">{item.name}</h3>

      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate rounded-xl border-2 border-market-ink bg-market-surface px-2.5 py-0.5 text-sm font-extrabold text-market-ink">
          {item.category || t("summary.other")}
          {rate > 0 ? ` · ₪${rate.toFixed(2)} ${t("productItem.perKg")}` : ""}
        </span>
        {cost > 0 && <span className="whitespace-nowrap text-[28px] font-black leading-none tracking-[-1px] text-market-pink">₪{cost.toFixed(2)}</span>}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { if (quantity <= step) { onRemove && onRemove(item); } else { onUpdateQuantity(item, quantity - step); } }}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-market-blue text-white" aria-label="הפחתה">
            <Minus className="h-5 w-5" />
          </button>
          <span className="flex min-w-[52px] flex-col items-center leading-none">
            <b className="text-3xl font-black text-market-ink">{quantity}</b>
            {unitLabel && <small className="mt-0.5 text-[13px] font-black text-market-ink/70">{unitLabel}</small>}
          </span>
          <button onClick={() => onUpdateQuantity(item, quantity + step)}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-market-pink text-white" aria-label="הוספה">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <button onClick={() => onToggleBought(item)} className="flex h-[46px] items-center justify-center gap-1.5 rounded-[23px] bg-market-ink px-4 text-[17px] font-black text-white" title={t("productItem.bought")}>
          <Check className="h-4 w-4" />
          {t("productItem.bought")}
        </button>
      </div>
    </article>
  );
}

export default memo(ProductItem);