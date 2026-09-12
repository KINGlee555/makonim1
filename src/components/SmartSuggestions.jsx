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
    if (history.length < 3) return [];

    const freq = {};
    const lastBought = {};
    history.forEach(h => {
      freq[h.item_name] = (freq[h.item_name] || 0) + 1;
      if (!lastBought[h.item_name] || new Date(h.created_date) > new Date(lastBought[h.item_name])) {
        lastBought[h.item_name] = h.created_date;
      }
    });

    const currentNames = new Set(currentItems.map(i => i.name));
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);

    // Items bought frequently (3+) but not in current list and not bought this week
    const forgotten = Object.entries(freq)
      .filter(([name, count]) => count >= 3 && !currentNames.has(name))
      .filter(([name]) => new Date(lastBought[name]) < weekAgo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, lastBought: lastBought[name] }));

    return forgotten;
  }, [history, currentItems]);

  if (suggestions.length === 0) return null;

  return (
    <section className="mb-0">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{t("smart.title")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {suggestions.slice(0, 2).map(s => (
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