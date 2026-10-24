import { useEffect, useMemo, useState } from "react";
import { TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChainPrices } from "@/hooks/useChainPrices";
import { uiBanner, uiEnter, uiPill, uiSection } from "@/lib/minimalUi";
import { useT } from "@/lib/i18n";

const MIN_SAVING = 0.5;   // פחות מחצי שקל לא שווה התראה
const MIN_DROP = 0.9;     // התראה רק בירידה ממשית — 10% ומעלה

// ירידת מחיר אמיתית: המחיר הזול עכשיו ברשתות מול המחיר ששילמת בפעם האחרונה.
export default function PriceDropNotice({ listId, items }) {
  const t = useT();
  const [paid, setPaid] = useState({});
  const [hidden, setHidden] = useState(false);
  // בלי כמויות בבקשה — שינוי כמות לא מפעיל חיפוש מחירים מחדש
  const basketKey = items.map(item => item.barcode || item.name).join("|");
  const basket = useMemo(() => items.map(item => ({ name: item.name, barcode: item.barcode })), [basketKey]);
  const { rows } = useChainPrices(basket, items.length > 0);

  useEffect(() => {
    if (!listId) return;
    base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", 80)
      .then(history => {
        const latest = {};
        for (const entry of history) {
          if (entry.price > 0 && !(entry.item_name in latest)) latest[entry.item_name] = entry.price;
        }
        setPaid(latest);
      })
      .catch(() => {});
  }, [listId]);

  const drops = (rows || []).map(row => {
    const was = paid[row.name];
    if (!was || !row.prices?.length) return null;
    const best = row.prices.reduce((cheap, entry) => (entry.unit < cheap.unit ? entry : cheap));
    const save = was - best.unit;
    if (save < MIN_SAVING || best.unit > was * MIN_DROP) return null;
    return { name: row.name, was, now: best.unit, chain: best.chain, save };
  }).filter(Boolean).sort((a, b) => b.save - a.save).slice(0, 3);

  if (hidden || drops.length === 0) return null;
  const saving = drops.reduce((sum, drop) => sum + drop.save, 0);

  return (
    <div className={`${uiSection} ${uiEnter}`}>
      <div className={uiBanner}>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ui-ink">
            <TrendingDown className="h-4 w-4 text-ui-accent" />{t("drops.title")}
          </p>
          {drops.map(drop => (
            <p key={drop.name} className="truncate text-[13px] text-ui-ink">
              {t("drops.row", { name: drop.name, was: drop.was.toFixed(2), now: drop.now.toFixed(2), chain: drop.chain })}
            </p>
          ))}
          <p className="text-[12px] text-ui-muted">{t("drops.summary", { amount: saving.toFixed(2) })}</p>
        </div>
        <button type="button" onClick={() => setHidden(true)} className={uiPill}>{t("drops.hide")}</button>
      </div>
    </div>
  );
}