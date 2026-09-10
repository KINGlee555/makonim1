import { useEffect, useMemo, useState } from "react";
import { Sparkles, Plus, TrendingDown, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getProductEmoji } from "@/lib/productEmoji";
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
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{t("smart.title")}</p>
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Bell className="w-3 h-3" />{t("smart.forgotHint")}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestions.map(s => (
            <button key={s.name} onClick={() => onAddProduct({ name: s.name, price: 0, category: "אחר", image_url: "" })}
              className="flex-shrink-0 flex items-center gap-1.5 bg-card border border-primary/20 rounded-full px-3 py-1.5 text-sm hover:bg-primary/10 transition-colors">
              <span>{getProductEmoji(s.name, "")}</span>
              <span className="text-foreground">{s.name}</span>
              <Plus className="w-3 h-3 text-primary" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}