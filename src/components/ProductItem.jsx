import { Check, Plus, Minus, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductItem({ item, onToggleBought, onUpdateQuantity, onRemove }) {
  const isBought = item.status === "bought";

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
      isBought 
        ? "bg-primary/5 border-primary/20 opacity-70" 
        : "bg-card border-border"
    }`}>
      <button
        onClick={() => onToggleBought(item)}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          isBought
            ? "bg-primary text-primary-foreground"
            : "border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
        }`}
      >
        {isBought && <Check className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {item.image_url && (
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div className="min-w-0">
            <p className={`text-lg font-medium truncate ${isBought ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {item.name}
            </p>
            {item.price > 0 && (
              <p className="text-sm text-muted-foreground">₪{item.price.toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>

      {!isBought ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => onUpdateQuantity(item, Math.max(1, (item.quantity || 1) - 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center text-lg font-semibold">{item.quantity || 1}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => onUpdateQuantity(item, (item.quantity || 1) + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground"
          onClick={() => onToggleBought(item)}
        >
          <Undo2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}