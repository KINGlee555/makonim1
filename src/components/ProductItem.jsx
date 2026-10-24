import { memo } from "react";
import { Plus, Minus, Check, MoreVertical, Pencil, CircleSlash2, Star, Camera, Send } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import DealBadge from "@/components/DealBadge";
import { useT } from "@/lib/i18n";
import { cardTone } from "@/lib/marketPalette";
import { isGram, lineCost, quantityStep } from "@/lib/units";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function ProductItem({ item, onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onUnavailable, onToggleFavorite, onChangePhoto, onSuggestPhoto, onPhotoFound, deal, isFavorite, paletteIndex = 0, className }) {
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

      <div className="relative h-44 overflow-hidden rounded-[24px] border-[3px] border-market-ink bg-market-surface md:h-48">
        <button type="button" className="h-full w-full" onClick={() => onNavigate && onNavigate(item)} aria-label={`${t("productItem.navigate")}: ${item.name}`}>
          <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url}
            onFound={(url) => onPhotoFound && onPhotoFound(item, url)}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`${t("productItem.more")}: ${item.name}`} className="absolute start-2 top-2 flex h-11 items-center gap-1.5 rounded-[22px] border-2 border-market-ink bg-market-surface px-3 text-[15px] font-black text-market-ink shadow-sm">
              {isFavorite ? <Star className="h-4 w-4 fill-market-pink text-market-pink" /> : <MoreVertical className="h-5 w-5" />}
              {t("productItem.more")}
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
            {onSuggestPhoto && (
              <DropdownMenuItem onClick={() => onSuggestPhoto(item)}>
                <Send className="me-2 h-4 w-4" />{t("suggest.menu")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onUnavailable(item)}>
              <CircleSlash2 className="me-2 h-4 w-4" />{t("productItem.notFound")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {deal && <DealBadge deal={deal} />}

      <h3 className="product-name text-[26px] font-black leading-tight tracking-[-1px] text-market-ink md:text-[28px]">{item.name}</h3>

      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate rounded-xl border-2 border-market-ink bg-market-surface px-2.5 py-0.5 text-base font-extrabold text-market-ink">
          {item.category || t("summary.other")}
          {rate > 0 ? ` · ₪${rate.toFixed(2)} ${t("productItem.perKg")}` : ""}
        </span>
        {cost > 0 && <span className="whitespace-nowrap text-[32px] font-black leading-none tracking-[-1px] text-market-pink">₪{cost.toFixed(2)}</span>}
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2 rounded-[26px] border-[3px] border-market-ink bg-market-surface px-2 py-1.5">
          <button
            onClick={() => { if (quantity <= step) { onRemove && onRemove(item); } else { onUpdateQuantity(item, quantity - step); } }}
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-market-blue text-white" aria-label="הפחתה">
            <Minus className="h-6 w-6" />
          </button>
          <span className="flex flex-col items-center leading-none">
            <b className="text-[38px] font-black text-market-ink">{quantity}</b>
            {unitLabel && <small className="mt-0.5 text-[15px] font-black text-market-ink/70">{unitLabel}</small>}
          </span>
          <button onClick={() => onUpdateQuantity(item, quantity + step)}
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-market-pink text-white" aria-label="הוספה">
            <Plus className="h-6 w-6" />
          </button>
        </div>
        <button onClick={() => onToggleBought(item)} className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[28px] bg-market-ink text-[20px] font-black text-white">
          <Check className="h-5 w-5" />
          {t("productItem.bought")}
        </button>
      </div>
    </article>
  );
}

export default memo(ProductItem);