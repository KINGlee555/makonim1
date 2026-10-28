import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { loadPurchaseHistory } from "@/lib/purchaseHistoryStore";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { uiEnter, uiSection } from "@/lib/minimalUi";
import { isWeightSold } from "@/lib/weightProducts";
import { loadLocalName } from "@/lib/userName";

const DAYS_BACK = 14;
const HISTORY_LIMIT = 200;

const isRecent = (row) => new Date(row.created_date).getTime() >= Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000;

// כפתור אחד שמחזיר את הקנייה הקבועה: כל מה שנקנה בשבועיים האחרונים וחזר להיות רלוונטי
export default function FillFromLastWeek({ listId, currentItems, onFilled }) {
  const t = useT();
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPurchaseHistory(listId, HISTORY_LIMIT)
      .then(rows => { if (alive) setHistory(rows); })
      .catch(() => {});
    return () => { alive = false; };
  }, [listId]);

  const pendingNames = new Set(currentItems.filter(item => item.status !== "bought").map(item => item.name));
  const products = history
    .filter(row => isRecent(row) && !pendingNames.has(row.item_name))
    .reduce((unique, row) => (
      unique.some(product => product.name === row.item_name)
        ? unique
        : [...unique, { name: row.item_name, price: row.price || 0, category: row.category || "אחר" }]
    ), []);

  // אין מה למלא — לא מפריעים למסך
  if (products.length === 0) return null;

  const fill = async () => {
    setBusy(true);
    try {
      const created = await base44.entities.ListItem.bulkCreate(products.map(product => ({
        list_id: listId,
        name: product.name,
        price: product.price,
        category: product.category,
        note: "",
        image_url: "",
        status: "pending",
        quantity: 1,
        unit: isWeightSold({ name: product.name, category: product.category }) ? "kg" : "unit",
        added_by: loadLocalName()
      })));
      toast({ title: t("fillLast.added", { count: created.length }), duration: 3000 });
      onFilled();
    } catch {
      toast({ title: t("fillLast.error"), variant: "destructive", duration: 3000 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${uiSection} ${uiEnter} pt-3`}>
      <button
        type="button"
        onClick={fill}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-ui-accent bg-ui-canvas px-4 py-3 text-[15px] font-semibold text-ui-accent transition-opacity duration-200 hover:bg-ui-accent/5 active:opacity-70 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" strokeWidth={2.2} />}
        {t("fillLast.button")} · {products.length}
      </button>
    </section>
  );
}