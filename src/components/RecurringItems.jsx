import { useState, useMemo, useEffect } from "react";
import { Repeat, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";

export default function RecurringItems({ listId, currentItems, onAddProduct }) {
  const t = useT();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;
    base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", 200)
      .then(h => { if (!cancelled) setHistory(h); }).catch(() => {});
    return () => { cancelled = true; };
  }, [listId]);

  const suggestions = useMemo(() => {
    const freq = {};
    history.forEach(h => { freq[h.item_name] = (freq[h.item_name] || 0) + 1; });
    const currentNames = new Set(currentItems.map(i => i.name));
    return Object.entries(freq)
      .filter(([name, count]) => count >= 2 && !currentNames.has(name))
      .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name]) => name);
  }, [history, currentItems]);

  if (suggestions.length === 0) return null;

  return (
    <section className="mb-0">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Repeat className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{t("recurring.title")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {suggestions.slice(0, 2).map(name => (
          <button key={name} onClick={() => onAddProduct({ name, price: 0, category: "אחר", image_url: "" })} className="flex min-w-0 items-center gap-2 rounded-xl border border-primary/10 bg-card p-2 text-start shadow-sm">
            <ProductPhoto name={name} category="אחר" className="h-12 w-12 flex-shrink-0 rounded-lg" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{name}</span>
            <Plus className="h-4 w-4 flex-shrink-0 text-primary" />
          </button>
        ))}
      </div>
    </section>
  );
}