// מתי עודכנו המחירים לאחרונה — הזמן שבו נכתב רשומת המחיר החדשה ביותר במסד.
// השאילתה רצה פעם אחת לכל טעינת אפליקציה ונשמרת בזכרון.
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

let cached = null;

function first(result) {
  const rows = result?.items || result || [];
  return rows[0] || null;
}

async function loadLatest() {
  if (!cached) {
    cached = (async () => {
      const [chainPrices, catalog] = await Promise.all([
        base44.entities.ChainPrice.list("-updated_date", 1),
        base44.entities.CatalogProduct.list("-updated_date", 1),
      ]);
      const newest = first(chainPrices) || first(catalog);
      return newest?.updated_date || "";
    })().catch(() => "");
  }
  return cached;
}

export default function usePricesUpdatedAt() {
  const [value, setValue] = useState("");

  useEffect(() => {
    let alive = true;
    loadLatest().then((result) => {
      if (alive) setValue(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  return value;
}