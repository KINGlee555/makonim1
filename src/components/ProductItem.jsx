import { memo } from "react";
import { Plus, Minus, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductEmoji } from "@/lib/productEmoji";
import { useT } from "@/lib/i18n";

function ProductItem({ item, onToggleBought, onUpdateQuantity, onNavigate, onRemove }) {
  const t = useT();

  return (
    <div className="flex items-center gap-2 p-3 rounded-2xl border bg-card border-border transition-all duration-300 hover:shadow-md">
      {/* Image + Info — tap to navigate to store */}
      <div
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        onClick={() => onNavigate && onNavigate(item)}
      >
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-size:24px">${getProductEmoji(item.name, item.category)}</span>`; }} />
          ) : (
            <span className="text-2xl">{getProductEmoji(item.name, item.category)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium truncate text-foreground">{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {item.price > 0 && <span className="text-sm font-semibold text-primary">₪{Number(item.price).toFixed(2)}</span>}
            {item.category && <span className="text-xs text-muted-foreground">· {item.category}</span>}
            {onNavigate && (
              <span className="text-xs text-primary/50 flex items-center gap-0.5 flex-shrink-0">
                <MapPin className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"
          onClick={() => { if ((item.quantity || 1) <= 1) { onRemove && onRemove(item); } else { onUpdateQuantity(item, (item.quantity || 1) - 1); } }}>
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-7 text-center text-lg font-semibold">{item.quantity || 1}</span>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"
          onClick={() => onUpdateQuantity(item, (item.quantity || 1) + 1)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Bought button — prominent checkmark */}
      <Button
        onClick={() => onToggleBought(item)}
        className="h-12 w-12 rounded-full p-0 flex-shrink-0"
        title={t("productItem.bought")}
      >
        <Check className="w-5 h-5" />
      </Button>
    </div>
  );
}

export default memo(ProductItem);