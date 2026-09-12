import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Plus } from "lucide-react";
import { getProductEmoji } from "@/lib/productEmoji";
import { getProductImageUrl } from "@/lib/productImages";
import { essentialProductNames } from "@/lib/essentialProducts";
import { useT } from "@/lib/i18n";

export default function EmptyListSuggestions({ onAddProduct }) {
  const t = useT();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedNames, setAddedNames] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const products = await base44.entities.Product.list("-name", 500);
        if (cancelled) return;
        // Use essentials as "AI suggestions" — these are the most common household items
        const items = essentialProductNames
          .map(name => products.find(p => p.name === name))
          .filter(Boolean)
          .slice(0, 6);
        if (!cancelled) { setSuggestions(items); setLoading(false); }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAdd = (product) => {
    onAddProduct(product);
    setAddedNames(prev => new Set([...prev, product.name]));
  };

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3 px-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-muted-foreground">הצעות חכמות להתחלה</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {suggestions.map((product) => {
          const isAdded = addedNames.has(product.name);
          const emoji = getProductEmoji(product.name, product.category);
          const imgUrl = getProductImageUrl(product.name, product.category);
          return (
            <button
              key={product.name}
              onClick={() => !isAdded && handleAdd(product)}
              disabled={isAdded}
              className={`flex-shrink-0 w-28 rounded-2xl border p-2.5 text-center transition-all active:scale-95 ${
                isAdded ? "border-primary/30 bg-primary/5 opacity-60" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-1.5 overflow-hidden">
                {imgUrl ? (
                  <img src={imgUrl} alt={product.name} className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-size:24px">${emoji}</span>`; }} />
                ) : (
                  <span className="text-2xl">{emoji}</span>
                )}
              </div>
              <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
              <p className="text-xs text-primary font-semibold">₪{product.price.toFixed(2)}</p>
              <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center mx-auto ${
                isAdded ? "bg-primary text-primary-foreground" : "border border-primary/30 text-primary"
              }`}>
                {isAdded ? <span className="text-xs">✓</span> : <Plus className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}