import { memo } from "react";
import { Bell, Pencil, CircleSlash2, Star, Camera, Send, Flag, Clock } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import WeightQuantity from "@/components/minimal/WeightQuantity";
import { dealPriceText } from "@/lib/chainDeals";
import { useLanguage, useT } from "@/lib/i18n";
import { addedText } from "@/lib/itemAdded";
import { isGram, isWeight, maxQuantity, quantityStep } from "@/lib/units";
import { isReminderDue, reminderText } from "@/lib/reminders";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// אריח מוצר בכרזה: תמונה עגולה עם תג מחיר, שם, מבצע אם יש, ומתחת שורת פעולות — כמות, "קניתי" ותפריט.
function ListItemRow({ item, index = 0, onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onSetReminder, onUnavailable, onToggleFavorite, onChangePhoto, onSuggestPhoto, onPhotoFound, onUpdateDetails, onReportPrice, deal, isFavorite, viewerName, className }) {
  const t = useT();
  const { lang } = useLanguage();
  // מי הוסיף את המוצר ומתי — גלוי על כל שורה
  const addedLine = addedText(item, lang);
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
    <article
      className={`pst-tile pst-line ${className || ""}`}
      style={className ? undefined : { animationDelay: `${Math.min(index, 8) * 0.1}s` }}
    >
      <div className="pst-ph">
        <button type="button" onClick={() => onNavigate && onNavigate(item)} aria-label={`${t("productItem.navigate")}: ${item.name}`}>
          <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} barcode={item.barcode}
            onFound={(url) => onPhotoFound && onPhotoFound(item, url)} className="h-full w-full" />
        </button>
      </div>
      <div className="pst-body">
        <span className="pst-nm line-clamp-2">{item.name}</span>
        {(price > 0 || unitLabel || secondary || addedLine) && (
          <span className="pst-line-sub">
            {price > 0 && <span className="pst-price">{priceText}</span>}
            {unitLabel && <span className="pst-meta">{unitLabel}</span>}
            {secondary && <span className="pst-meta">{secondary}</span>}
            {addedLine && (
              <span className="pst-meta inline-flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />{addedLine}
              </span>
            )}
          </span>
        )}
        {deal && (
          <span className="pst-deal">
            {t("deals.badge")} · {dealPriceText(deal)}{deal.discount > 0 ? ` -${deal.discount}%` : ""}{deal.chain_name ? ` · ${deal.chain_name}` : ""}
          </span>
        )}
        {item.remind_at && (
          <span className={`pst-remind ${isReminderDue(item) ? "pst-remind-due" : ""}`}>
            <Bell className="h-3.5 w-3.5 shrink-0" />{reminder}
          </span>
        )}

        <div className="pst-ctl">
          {byWeight ? (
            <WeightQuantity item={item} unit={unit} unitLabel={unitLabel}
              onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} onSwitchUnit={switchWeightUnit} />
          ) : (
            <div className="pst-q">
              <button type="button" aria-label="הפחתה"
                onClick={() => { if (quantity <= step) { onRemove && onRemove(item); } else { onUpdateQuantity(item, quantity - step); } }}>
                −
              </button>
              <span>{quantity}</span>
              <button type="button" aria-label="הוספה" disabled={quantity >= max}
                onClick={() => onUpdateQuantity(item, quantity + step)}>
                +
              </button>
            </div>
          )}

          <button type="button" onClick={() => onToggleBought(item)} className="pst-buy">
            {t("productItem.bought")}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label={`${t("productItem.more")}: ${item.name}`} className="pst-more">
                ⋮
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="pst-menu w-52">
              <DropdownMenuItem className="pst-mi" onClick={() => onToggleFavorite(item)}>
                <Star className={`me-2 h-4 w-4 ${isFavorite ? "fill-pst-yellow text-pst-yellow" : ""}`} />
                {isFavorite ? t("favorites.remove") : t("favorites.save")}
              </DropdownMenuItem>
              <DropdownMenuItem className="pst-mi" onClick={() => onEdit(item)}>
                <Pencil className="me-2 h-4 w-4" />{t("productItem.edit")}
              </DropdownMenuItem>
              {onSetReminder && (
                <DropdownMenuItem className="pst-mi" onClick={() => onSetReminder(item)}>
                  <Bell className="me-2 h-4 w-4" />{t("reminder.button")}
                </DropdownMenuItem>
              )}
              {onChangePhoto && (
                <DropdownMenuItem className="pst-mi" onClick={() => onChangePhoto(item)}>
                  <Camera className="me-2 h-4 w-4" />{t("productItem.changePhoto")}
                </DropdownMenuItem>
              )}
              {onSuggestPhoto && (
                <DropdownMenuItem className="pst-mi" onClick={() => onSuggestPhoto(item)}>
                  <Send className="me-2 h-4 w-4" />{t("suggest.menu")}
                </DropdownMenuItem>
              )}
              {onReportPrice && (
                <DropdownMenuItem className="pst-mi" onClick={() => onReportPrice(item)}>
                  <Flag className="me-2 h-4 w-4" />{t("report.menu")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="pst-mi" onClick={() => onUnavailable(item)}>
                <CircleSlash2 className="me-2 h-4 w-4" />{t("productItem.notFound")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}

export default memo(ListItemRow);