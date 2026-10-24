import { memo } from "react";
import { Bell, Plus, Minus, Check, MoreVertical, Pencil, CircleSlash2, Star, Camera, Send, Eye } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { dealPriceText } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";
import { isGram, isWeight, lineCost, quantityStep } from "@/lib/units";
import { isReminderDue, reminderText } from "@/lib/reminders";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { uiEnter, uiStep } from "@/lib/minimalUi";

const action = "flex h-[28px] shrink-0 items-center justify-center gap-1 rounded-[14px] border bg-ui-canvas text-[13px] transition-[background-color,color,box-shadow,opacity] duration-200 active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent";

// שורה אחת צפופה למוצר: תמונה, שם, כמות, מחיר, סימון קניתי — בלי כרטיס ובלי גלילה מיותרת.
function ListItemRow({ item, index = 0, onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onSetReminder, onUnavailable, onToggleFavorite, onChangePhoto, onSuggestPhoto, onPhotoFound, onUpdateDetails, deal, isFavorite, viewerName, className }) {
  const t = useT();
  const unit = item.unit || "unit";
  const quantity = Number(item.quantity) || 1;
  const step = quantityStep(unit);
  const unitLabel = unit === "unit" ? "" : t(`unit.${unit}`);
  const cost = lineCost(item);
  const rate = isGram(unit) || unit === "kg" ? Number(item.price) || 0 : 0;
  // מוצר לפי משקל: הכמות מוצגת ליד הכפתורים יחד עם היחידה, ולכן לא חוזרת בשורת הפרטים
  const byWeight = isWeight(unit);
  const meta = [
    item.category || t("summary.other"),
    byWeight ? "" : (quantity > 1 || unitLabel ? `${quantity}${unitLabel ? ` ${unitLabel}` : ""}` : ""),
    rate > 0 ? `₪${rate.toFixed(2)} ${t("productItem.perKg")}` : "",
    item.note || "",
  ].filter(Boolean).join(" · ");
  // מי מבני הבית כבר ראה את המוצר — בלי השם שלי עצמי
  const seenBy = (item.viewed_by || []).filter(name => name && name !== viewerName);
  // החלפה בין גרמים לק״ג — אותה כמות בדיוק, והמחיר לק״ג נשאר כמו שהוא
  const switchWeightUnit = () => {
    if (!onUpdateDetails) return;
    const amount = Number(item.quantity) || 0;
    if (unit === "gram") onUpdateDetails(item, { unit: "kg", quantity: Math.max(0.1, Math.round((amount / 1000) * 100) / 100) });
    else onUpdateDetails(item, { unit: "gram", quantity: Math.round(amount * 1000) || 1000 });
  };

  return (
    <div className={`${uiEnter} flex min-h-[44px] items-center gap-2.5 border-b border-ui-line-soft py-1.5 sm:gap-3 ${className || ""}`} style={{ animationDelay: `${Math.min(index, 14) * 0.05}s` }}>
      <button
        type="button"
        onClick={() => onNavigate && onNavigate(item)}
        aria-label={`${t("productItem.navigate")}: ${item.name}`}
        className="shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent"
      >
        <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url}
          onFound={(url) => onPhotoFound && onPhotoFound(item, url)} className="pointer-events-none h-10 w-10 rounded-lg object-cover" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] text-ui-ink">{item.name}</span>
        <span className="truncate text-[12px] text-ui-muted">{meta}</span>
        {seenBy.length > 0 && (
          <span className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-ui-muted">
            <Eye className="h-3 w-3 shrink-0" />
            <span className="truncate">{t("productItem.seenBy", { names: `${seenBy.slice(0, 2).join(", ")}${seenBy.length > 2 ? ` +${seenBy.length - 2}` : ""}` })}</span>
          </span>
        )}
        {item.remind_at && (
          <span className={`mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${isReminderDue(item) ? "bg-ui-accent text-white" : "bg-ui-surface text-ui-muted"}`}>
            <Bell className="h-3 w-3" />{reminderText(item.remind_at)}
          </span>
        )}
        {deal && (
          <span className="truncate text-[12px] text-ui-accent">
            {t("deals.badge")} · {dealPriceText(deal)}{deal.discount > 0 ? ` -${deal.discount}%` : ""}{deal.chain_name ? ` · ${deal.chain_name}` : ""}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" aria-label="הפחתה" className={uiStep}
          onClick={() => { if (quantity <= step) { onRemove && onRemove(item); } else { onUpdateQuantity(item, quantity - step); } }}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[24px] text-center text-[14px] tabular-nums text-ui-ink">{quantity}</span>
        {byWeight && (
          <button type="button" onClick={switchWeightUnit} aria-label={t("productItem.switchUnit")} aria-pressed={unit === "kg"}
            className={`${action} h-[24px] border-ui-line bg-ui-surface px-1.5 text-[11px] text-ui-muted hover:text-ui-ink`}>
            {unitLabel}
          </button>
        )}
        <button type="button" aria-label="הוספה" className={uiStep} onClick={() => onUpdateQuantity(item, quantity + step)}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="hidden w-16 shrink-0 text-end text-[14px] tabular-nums text-ui-ink sm:block">{cost > 0 ? `₪${cost.toFixed(2)}` : ""}</span>

      <button type="button" onClick={() => onToggleBought(item)} aria-label={t("productItem.bought")}
        className={`${action} w-7 border-ui-accent text-ui-accent hover:bg-ui-accent hover:text-white sm:w-auto sm:px-3`}>
        <Check className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("productItem.bought")}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={`${t("productItem.more")}: ${item.name}`}
            className={`${action} w-7 border-ui-line text-ui-ink hover:bg-ui-surface sm:w-auto sm:px-2.5`}>
            {isFavorite ? <Star className="h-3.5 w-3.5 fill-ui-accent text-ui-accent" /> : <MoreVertical className="h-4 w-4" />}
            <span className="hidden sm:inline">{t("productItem.more")}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 rounded-xl border-ui-line">
          <DropdownMenuItem onClick={() => onToggleFavorite(item)}>
            <Star className={`me-2 h-4 w-4 ${isFavorite ? "fill-ui-accent text-ui-accent" : ""}`} />
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
          <DropdownMenuItem onClick={() => onUnavailable(item)}>
            <CircleSlash2 className="me-2 h-4 w-4" />{t("productItem.notFound")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default memo(ListItemRow);