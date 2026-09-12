import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Plus, Check } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { essentialProductNames } from "@/lib/essentialProducts";

export default function EmptyListSuggestions({ onAddProduct }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedNames, setAddedNames] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const products = await base44.entities.Product.list("-name", 500);
        if (cancelled) return;
        const items = essentialProductNames
          .map(name => products.find(p => p.name === name))
          .filter(Boolean)
          .slice(0, 8);
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

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-7 h-7 rounded-full bg-primary/10" />
          <div className="h-4 w-32 rounded bg-muted shimmer" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 rounded-2xl bg-card border border-border/50 overflow-hidden">
              <div className="w-full h-[120px] bg-muted shimmer" />
              <div className="p-3">
                <div className="h-3 rounded bg-muted shimmer mb-1.5" />
                <div className="h-3 w-12 rounded bg-muted shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">הצעות חכמות להתחלה</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-hide">
        {suggestions.map((product, idx) => {
          const isAdded = addedNames.has(product.name);
          return (
            <button
              key={product.name}
              onClick={() => !isAdded && handleAdd(product)}
              disabled={isAdded}
              className={`flex-shrink-0 w-40 rounded-2xl overflow-hidden text-start transition-all active:scale-95 snap-start animate-slide-up stagger-${Math.min(idx + 1, 6)} ${
                isAdded ? "border border-primary/30 bg-primary/5 opacity-60" : "bg-card shadow-sm hover:shadow-md"
              }`}
            >
              {/* Full-bleed image with floating price badge */}
              <div className="relative w-full h-[120px] bg-muted overflow-hidden">
                <ProductPhoto name={product.name} category={product.category} imageUrl={product.image_url} className="h-full w-full" />
                {/* Price badge floating on image */}
                <div className="absolute bottom-2 right-2 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  ₪{product.price.toFixed(2)}
                </div>
              </div>
              {/* Name + add button */}
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">{product.category || ""}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isAdded ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}>
                    {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}