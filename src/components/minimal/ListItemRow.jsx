import { memo } from "react";
import { Bell, Plus, Minus, MoreVertical, Pencil, CircleSlash2, Star, Camera, Send, Flag } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { dealPriceText } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";
import { isGram, isWeight, maxQuantity, quantityStep } from "@/lib/units";
import { isReminderDue, reminderText } from "@/lib/reminders";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// כפתור כמות עגול וגדול וכפתור "קניתי" בולט — הקשה אחת, בלי לכוון
const stepBtn = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-big-accent bg-big-canvas text-big-accent hover:bg-big-accent hover:text-big-canvas disabled:opacity-40 sm:h-[60px] sm:w-[60px]";
const boughtBtn = "h-11 shrink-0 rounded-full border-0 bg-big-accent px-5 text-[16px] text-big-canvas hover:shadow-[0_4px_14px_rgba(14,143,130,0.4)] sm:h-14 sm:px-6 sm:text-[22px]";

// שורה אחת גדולה וקריאה למוצר: תמונה, שם, מחיר, כמות וקניתי — וכל השאר בתפריט.
function ListItemRow({ item, index = 0, onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onSetReminder, onUnavailable, onToggleFavorite, onChangePhoto, onSuggestPhoto, onPhotoFound, onUpdateDetails, onReportPrice, deal, isFavorite, viewerName, className }) {
  const t = useT();
  const unit = item.unit || "unit";
  const quantity = Number(item.quantity) || 1;
  const step = quantityStep(unit);
  // אין מה להעלות מעבר לטווח שהוגדר — 10 ק״ג למוצר לפי משקל
  const max = maxQuantity(item);
  const unitLabel = unit === "unit" ? "" : t(`unit.${unit}`);
  const byWeight = isWeight(unit);
  const price = Number(item.price) || 0;
  const rate = isGram(unit) || unit === "kg" ? price : 0;
  // מוצר לפי משקל מוצג במחיר לק״ג, ומוצר ביחידות במחיר ליחידה
  const priceText = byWeight ? `₪${rate.toFixed(2)} ${t("productItem.perKg")}` : `₪${price.toFixed(2)}`;
  // מה שעוד שווה לדעת נשאר בשורה אחת שקטה: הערה ומי ראה
  const seenBy = (item.viewed_by || []).filter(name => name && name !== viewerName);
  const seenText = seenBy.length ? t("productItem.seenBy", { names: `${seenBy.slice(0, 2).join(", ")}${seenBy.length > 2 ? ` +${seenBy.length - 2}` : ""}` }) : "";
  const secondary = [item.note, seenText].filter(Boolean).join(" · ");
  const reminder = item.remind_at ? reminderText(item.remind_at) : "";
  // החלפה בין גרמים לק״ג — אותה כמות בדיוק, והמחיר לק״ג נשאר כמו שהוא
  const switchWeightUnit = () => {
    if (!onUpdateDetails) return;
    const amount = Number(item.quantity) || 0;
    if (unit === "gram") onUpdateDetails(item, { unit: "kg", quantity: Math.max(0.1, Math.round((amount / 1000) * 100) / 100) });
    else onUpdateDetails(item, { unit: "gram", quantity: Math.round(amount * 1000) || 1000 });
  };

  return (
    <div className={`big-in flex flex-wrap items-center gap-x-3 gap-y-3 border-b-2 border-big-line-soft py-4 sm:flex-nowrap sm:gap-x-5 sm:py-[26px] ${className || ""}`}
      style={{ animationDelay: `${Math.min(index, 8) * 0.1 + 0.2}s` }}>
      <button type="button" onClick={() => onNavigate && onNavigate(item)} aria-label={`${t("productItem.navigate")}: ${item.name}`} className="shrink-0 rounded-full">
        <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url}
          onFound={(url) => onPhotoFound && onPhotoFound(item, url)}
          className="pointer-events-none h-14 w-14 rounded-full border-2 border-big-line object-cover sm:h-[84px] sm:w-[84px]" />
      </button>

      <div className="flex min-w-0 basis-[calc(100%-68px)] flex-col gap-1 sm:basis-auto sm:flex-1">
        <span className="line-clamp-2 text-[22px] leading-tight tracking-[0.02em] text-big-ink sm:text-[32px]">{item.name}</span>
        {secondary && <span className="truncate text-[13px] text-big-muted sm:text-[18px]">{secondary}</span>}
        {item.remind_at && (
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] sm:text-[16px] ${isReminderDue(item) ? "bg-big-attn text-big-ink" : "bg-big-surface text-big-muted"}`}>
            <Bell className="h-3.5 w-3.5 shrink-0" />{reminder}
          </span>
        )}
        {deal && (
          <span className="truncate text-[13px] text-big-attn-ink sm:text-[18px]">
            {t("deals.badge")} · {dealPriceText(deal)}{deal.discount > 0 ? ` -${deal.discount}%` : ""}{deal.chain_name ? ` · ${deal.chain_name}` : ""}
          </span>
        )}
      </div>

      {/* בטלפון השורה מתפצלת לשניים — שם למעלה, וכאן המחיר והפעולות */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-3 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-x-5">
        {price > 0 && (
          <span className="shrink-0 text-[20px] font-semibold tracking-[0.06em] tabular-nums text-big-accent sm:min-w-[120px] sm:text-[32px]">{priceText}</span>
        )}

        <div className="flex shrink-0 items-center gap-3 sm:gap-3.5">
          <button type="button" aria-label="הפחתה" className={stepBtn}
            onClick={() => { if (quantity <= step) { onRemove && onRemove(item); } else { onUpdateQuantity(item, quantity - step); } }}>
            <Minus className="h-5 w-5 sm:h-7 sm:w-7" />
          </button>
          <span className="min-w-[26px] text-center text-[22px] tabular-nums text-big-ink sm:min-w-[32px] sm:text-[30px]">{quantity}</span>
          {byWeight && (
            <button type="button" onClick={switchWeightUnit} aria-label={t("productItem.switchUnit")} aria-pressed={unit === "kg"}
              className="h-11 shrink-0 rounded-full border-2 border-big-line bg-big-canvas px-3 text-[15px] text-big-ink hover:bg-big-surface sm:h-[60px] sm:px-4 sm:text-[20px]">
              {unitLabel}
            </button>
          )}
          <button type="button" aria-label="הוספה" disabled={quantity >= max} className={stepBtn}
            onClick={() => onUpdateQuantity(item, quantity + step)}>
            <Plus className="h-5 w-5 sm:h-7 sm:w-7" />
          </button>
        </div>

        <button type="button" onClick={() => onToggleBought(item)} aria-label={t("productItem.bought")} className={boughtBtn}>
          {t("productItem.bought")}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`${t("productItem.more")}: ${item.name}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-big-line bg-big-canvas text-big-ink hover:bg-big-surface sm:h-14 sm:w-14">
              <MoreVertical className="h-5 w-5 sm:h-7 sm:w-7" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 rounded-xl border-big-line">
            <DropdownMenuItem onClick={() => onToggleFavorite(item)}>
              <Star className={`me-2 h-4 w-4 ${isFavorite ? "fill-big-accent text-big-accent" : ""}`} />
              {isFavorite ? t("favorites.remove") : t("favorites.save")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="me-2 h-4 w-4" />{t("productItem.edit")}
            </DropdownMenuItem>
            {onSetReminder && (
              <DropdownMenuItem onClick={() => onSetReminder(item)}>
                <Bell className="me-2 h-4 w-4" />{t("reminder.button")}
              </DropdownMenuItem>
            )}
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
            {onReportPrice && (
              <DropdownMenuItem onClick={() => onReportPrice(item)}>
                <Flag className="me-2 h-4 w-4" />{t("report.menu")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onUnavailable(item)}>
              <CircleSlash2 className="me-2 h-4 w-4" />{t("productItem.notFound")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default memo(ListItemRow);