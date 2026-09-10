import { useState, useMemo, useEffect } from "react";
import { Repeat, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getProductEmoji } from "@/lib/productEmoji";
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
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Repeat className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{t("recurring.title")}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {suggestions.map(name => (
          <button key={name} onClick={() => onAddProduct({ name, price: 0, category: "אחר", image_url: "" })}
            className="flex-shrink-0 flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-full px-3 py-1.5 text-sm hover:bg-primary/10 transition-colors">
            <span>{getProductEmoji(name, "")}</span>
            <span className="text-foreground">{name}</span>
            <Plus className="w-3 h-3 text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}