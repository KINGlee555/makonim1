import { useEffect, useMemo, useState } from "react";
import { Sparkles, Plus, TrendingDown, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";

export default function SmartSuggestions({ listId, currentItems, onAddProduct }) {
  const t = useT();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;
    base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", 200)
      .then(h => { if (!cancelled) setHistory(h); }).catch(() => {});
    return () => { cancelled = true; };
  }, [listId]);

  const suggestions = useMemo(() => {
    const buyers = {};
    history.forEach(h => {
      if (!buyers[h.item_name]) buyers[h.item_name] = new Set();
      buyers[h.item_name].add(h.bought_by || "—");
    });

    const currentNames = new Set(currentItems.map(i => i.name));

    // Most-bought items (by how many different people bought them) that aren't on the list
    return Object.entries(buyers)
      .filter(([name]) => !currentNames.has(name))
      .map(([name, people]) => ({ name, buyers: people.size }))
      .sort((a, b) => b.buyers - a.buyers)
      .slice(0, 6);
  }, [history, currentItems]);

  if (suggestions.length === 0) return null;

  return (
    <section className="mb-0">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{t("smart.title")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map(s => (
          <button key={s.name} onClick={() => onAddProduct({ name: s.name, price: 0, category: "אחר", image_url: "" })} className="flex min-w-0 items-center gap-2 rounded-xl border border-primary/10 bg-card p-2 text-start shadow-sm">
            <ProductPhoto name={s.name} category="אחר" className="h-12 w-12 flex-shrink-0 rounded-lg" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{s.name}</span>
            <Plus className="h-4 w-4 flex-shrink-0 text-primary" />
          </button>
        ))}
      </div>
    </section>
  );
}