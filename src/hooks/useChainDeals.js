import { useEffect, useMemo, useState } from "react";
import { fetchChainDeals, DEAL_BADGE_CHAINS } from "@/lib/chainDeals";

const CACHE_KEY = "makonim-chain-deals-v1";
const today = () => new Date().toISOString().slice(0, 10);

// המבצעים של היום נשמרים גם בדפדפן, כך שהתג מופיע מיד בפתיחה הבאה.
function readCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return parsed?.day === today() ? parsed.deals || [] : [];
  } catch {
    return [];
  }
}

function writeCache(deals) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ day: today(), deals }));
  } catch {
    // אין מקום באחסון המקומי — פשוט לא שומרים
  }
}

// המבצעים של הרשימה הנוכחית: קודם מהמטמון בדפדפן, ואז רענון קצר מול השרת
// (שגם הוא שומר כל מבצע ליום שלם, כך שהקריאה חוזרת מהמטמון שלו).
export function useChainDeals(items) {
  const [deals, setDeals] = useState(readCache);
  const signature = useMemo(
    () => (items || []).map(item => `${item.name}|${item.barcode || ""}`).sort().join(";"),
    [items]
  );

  useEffect(() => {
    if (!signature) return;
    const wanted = (items || []).filter(item => item?.name)
      .map(item => ({ name: item.name, barcode: item.barcode || "" }));
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchChainDeals({ mode: "items", items: wanted, chains: DEAL_BADGE_CHAINS })
        .then(result => {
          if (cancelled) return;
          const list = result.deals || [];
          setDeals(list);
          writeCache(list);
        })
        .catch(() => {});
    }, 1200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [signature]);

  return deals;
}