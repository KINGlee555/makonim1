import { memo } from "react";
import { Bell, Plus, Minus, MoreVertical, Pencil, CircleSlash2, Star, Camera, Send, Flag } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { dealPriceText } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";
import { isGram, isWeight, maxQuantity, quantityStep } from "@/lib/units";
import { isReminderDue, reminderText } from "@/lib/reminders";
import { cardTint } from "@/lib/cardTints";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// כרטיס צבעוני אחד למוצר: תמונה עם טבעת וטור שם־מחיר למעלה, וכל הפעולות ברצועה בתחתית.
// גוון הכרטיס נגזר מהמחלקה של המוצר, כדי שהרשימה תיקרא כמקטעי צבע בגלילה.
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
    <article
      className={`mkc-card ${cardTint(item.category)} ${className || ""}`}
      style={className ? undefined : { animationDelay: `${Math.min(index, 8) * 0.1 + 0.04}s` }}
    >
      <div className="mkc-top">
        <button type="button" onClick={() => onNavigate && onNavigate(item)} aria-label={`${t("productItem.navigate")}: ${item.name}`} className="shrink-0 rounded-full">
          <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url}
            onFound={(url) => onPhotoFound && onPhotoFound(item, url)} className="mkc-photo" />
        </button>

        <div className="mkc-name">
          <span className="line-clamp-2">{item.name}</span>
          {secondary && <span className="mkc-meta">{secondary}</span>}
          {(item.remind_at || deal) && (
            <span className="mkc-tags">
              {item.remind_at && (
                <span className={`mkc-tag ${isReminderDue(item) ? "mkc-tag-due" : ""}`}>
                  <Bell className="h-3 w-3 shrink-0" />{reminder}
                </span>
              )}
              {deal && (
                <span className="mkc-tag">
                  {t("deals.badge")} · {dealPriceText(deal)}{deal.discount > 0 ? ` -${deal.discount}%` : ""}{deal.chain_name ? ` · ${deal.chain_name}` : ""}
                </span>
              )}
            </span>
          )}
        </div>

        {price > 0 && <span className="mkc-price">{priceText}</span>}
      </div>

      <div className="mkc-controls">
        <div className="mkc-qty">
          <button type="button" aria-label="הפחתה" className="mkc-step"
            onClick={() => { if (quantity <= step) { onRemove && onRemove(item); } else { onUpdateQuantity(item, quantity - step); } }}>
            <Minus className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <span className="mkc-count">{quantity}</span>
          {byWeight && (
            <button type="button" onClick={switchWeightUnit} aria-label={t("productItem.switchUnit")} aria-pressed={unit === "kg"} className="mkc-unit">
              {unitLabel}
            </button>
          )}
          <button type="button" aria-label="הוספה" disabled={quantity >= max} className="mkc-step"
            onClick={() => onUpdateQuantity(item, quantity + step)}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <button type="button" onClick={() => onToggleBought(item)} aria-label={t("productItem.bought")} className="mkc-bought">
          {t("productItem.bought")}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`${t("productItem.more")}: ${item.name}`} className="mkc-more">
              <MoreVertical className="h-4 w-4" strokeWidth={2.5} />
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
    </article>
  );
}

export default memo(ListItemRow);