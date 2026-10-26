import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, PawPrint, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PET_CATEGORY, isBigSize } from "@/lib/petStores";
import { useT } from "@/lib/i18n";

// אוכל לחיות — מזון ושימורים במבצע מהקטלוג החי של חנויות החיות,
// עם הוספה ישירה לרשימה. אביזרים וצעצועים לא נכנסים לכאן.
const FOOD = /מזון|שימורים|פאוץ|חטיפ|פינוק|חציר|גרעינ|מעדן|לשון/i;
const SHOWN = 4;

export default function PetFoodDeals({ onAddProduct }) {
  const t = useT();
  const [rows, setRows] = useState([]);
  const [added, setAdded] = useState([]);

  useEffect(() => {
    let cancelled = false;
    base44.entities.PetProduct.filter({ discount_pct: { $gt: 0 } }, "-discount_pct", 100)
      .then(list => {
        if (cancelled) return;
        const food = (list || []).filter(item => item.image_url && (FOOD.test(item.name) || isBigSize(item.name)));
        setRows(food.slice(0, SHOWN));
      })
      .catch(() => setRows([]));
    return () => { cancelled = true; };
  }, []);

  if (rows.length === 0) return null;

  const add = (product) => {
    onAddProduct?.({
      name: String(product.name).slice(0, 64),
      price: product.price,
      image_url: product.image_url,
      category: PET_CATEGORY,
      brand: product.brand || "",
    });
    setAdded(prev => (prev.includes(product.id) ? prev : [...prev, product.id]));
    toast({ title: t("pet.added", { name: String(product.name).slice(0, 28) }) });
  };

  return (
    <section aria-label={t("area.pet")}>
      <h2 className="pst-h2 pst-h2-b">
        <PawPrint className="h-5 w-5 flex-none" />
        {t("area.pet")}
      </h2>
      <p className="mb-3 text-[13px] font-bold text-ui-muted">{t("area.petHint")}</p>

      {rows.map(product => (
        <div key={product.id} className="pst-lrow">
          <img src={product.image_url} alt="" loading="lazy" className="pst-thumb" />
          <div className="pst-lrow-t">
            <span className="block truncate">{product.name}</span>
            <span className="pst-lrow-s block truncate">
              {[product.store_name, product.size_label].filter(Boolean).join(" · ")}
            </span>
          </div>
          <div className="flex flex-none flex-col items-end gap-0.5">
            <span className="rounded-lg bg-market-yellow px-2 py-0.5 text-[14px] font-black text-market-ink">
              ₪{Number(product.price).toFixed(2)}
            </span>
            {product.was_price > 0 && (
              <span className="text-[12px] font-bold text-ui-muted line-through">₪{Number(product.was_price).toFixed(2)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => add(product)}
            aria-label={t("pet.add")}
            title={t("pet.add")}
            className="pst-more flex flex-none items-center justify-center"
          >
            {added.includes(product.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      ))}
    </section>
  );
}