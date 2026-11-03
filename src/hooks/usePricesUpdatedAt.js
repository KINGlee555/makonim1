// העדכון האחרון מול קבצי השקיפות של הרשתות: מתי נמשכו המחירים, לאיזה יום,
// ומכמה רשתות באמת הגיעו מחירים. השאילתה רצה פעם אחת לכל טעינה ונשמרת בזכרון.
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const EMPTY = { at: "", day: "", chains: 0 };
let cached = null;

const firstOf = (result) => (Array.isArray(result) ? result : result?.items || [])[0] || null;
const rowsOf = (result) => (Array.isArray(result) ? result : result?.rows || []);

// כמה רשתות שונות דיווחו מחירים ליום הזה — מהמחירים שנשמרו ומהקטלוג
async function countChains(day) {
  const [shelf, catalog] = await Promise.all([
    base44.entities.ChainPrice.aggregate({ query: { day }, groupBy: "chain" }).catch(() => []),
    base44.entities.CatalogProduct.aggregate({ query: { day }, groupBy: "chain" }).catch(() => []),
  ]);
  const ids = new Set([...rowsOf(shelf), ...rowsOf(catalog)].map(row => row.chain).filter(Boolean));
  return ids.size;
}

async function load() {
  const [shelf, catalog] = await Promise.all([
    base44.entities.ChainPrice.list("-updated_date", 1),
    base44.entities.CatalogProduct.list("-updated_date", 1),
  ]);
  const a = firstOf(shelf);
  const b = firstOf(catalog);
  const newest = !a ? b : !b ? a : String(b.updated_date) > String(a.updated_date) ? b : a;
  if (!newest) return EMPTY;
  const day = newest.day || String(newest.updated_date || "").slice(0, 10);
  return { at: newest.updated_date || "", day, chains: await countChains(day) };
}

export default function usePricesUpdatedAt() {
  const [value, setValue] = useState(EMPTY);

  useEffect(() => {
    let alive = true;
    if (!cached) cached = load().catch(() => EMPTY);
    cached.then(result => {
      if (alive) setValue(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  return value;
}