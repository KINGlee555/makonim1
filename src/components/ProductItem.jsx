import { memo } from "react";
import { Plus, Minus, MapPin, Check } from "lucide-react";
import { getProductEmoji } from "@/lib/productEmoji";
import { getProductImageUrl } from "@/lib/productImages";
import { useT } from "@/lib/i18n";

function ProductItem({ item, onToggleBought, onUpdateQuantity, onNavigate, onRemove }) {
  const t = useT();
  const emoji = getProductEmoji(item.name, item.category);
  const imgUrl = item.image_url || getProductImageUrl(item.name, item.category);

  return (
    <div className="group flex items-center gap-3 p-3 rounded-3xl bg-card shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98] animate-slide-up">
      {/* Image — tap to navigate to store */}
      <div
        className="w-16 h-16 rounded-2xl bg-muted overflow-hidden flex-shrink-0 cursor-pointer relative"
        onClick={() => onNavigate && onNavigate(item)}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-size:28px">${emoji}</span>`; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">{emoji}</div>
        )}
        {onNavigate && (
          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Info + quantity */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold truncate text-foreground">{item.name}</p>
        <div className="flex items-center gap-2 mt-1">
          {item.price > 0 && (
            <span className="text-sm font-bold text-primary">₪{Number(item.price).toFixed(2)}</span>
          )}
          {item.category && (
            <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{item.category}</span>
          )}
        </div>
        {/* Quantity controls */}
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={() => { if ((item.quantity || 1) <= 1) { onRemove && onRemove(item); } else { onUpdateQuantity(item, (item.quantity || 1) - 1); } }}
            className="w-7 h-7 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-all active:scale-90"
          >
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span className="w-8 text-center text-base font-bold text-foreground">{item.quantity || 1}</span>
          <button
            onClick={() => onUpdateQuantity(item, (item.quantity || 1) + 1)}
            className="w-7 h-7 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all active:scale-90"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      </div>

      {/* Bought button — gradient circle */}
      <button
        onClick={() => onToggleBought(item)}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        title={t("productItem.bought")}
      >
        <Check className="w-5 h-5" />
      </button>
    </div>
  );
}

export default memo(ProductItem);