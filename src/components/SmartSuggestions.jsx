import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";
import { uiPillRow, uiSection, uiEnter } from "@/lib/minimalUi";

export default function SmartSuggestions({ listId, currentItems, onAddProduct, delay = 0 }) {
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
    <section className={`${uiSection} ${uiEnter}`} style={{ animationDelay: `${delay}s` }}>
      <p className="mb-2 text-[12px] text-ui-muted">{t("smart.title")}</p>
      <div className={uiPillRow}>
        {suggestions.map(s => (
          <button key={s.name} type="button"
            onClick={() => onAddProduct({ name: s.name, price: 0, category: "אחר", image_url: "" })}
            className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-[15px] border border-ui-line bg-ui-canvas ps-1.5 pe-2.5 text-[13px] text-ui-ink transition-[background-color,color,box-shadow,opacity] duration-200 hover:bg-ui-surface active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent">
            <ProductPhoto name={s.name} category="אחר" className="h-6 w-6 flex-shrink-0 rounded-full object-cover" />
            <span className="max-w-[9rem] truncate">{s.name}</span>
            <Plus className="h-3.5 w-3.5 flex-shrink-0 text-ui-accent" />
          </button>
        ))}
      </div>
    </section>
  );
}