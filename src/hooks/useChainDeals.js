import { useEffect, useMemo, useState } from "react";
import { fetchChainDeals, DEAL_BADGE_CHAINS, listDealsKey, readDealsCache, writeDealsCache } from "@/lib/chainDeals";

// המבצעים של הרשימה הנוכחית לתג על הפריטים: קודם מהמטמון במכשיר, ואז רענון קצר מול השרת
// (שגם הוא שומר כל מבצע ליום שלם, כך שהקריאה חוזרת מהמטמון שלו).
export function useChainDeals(items) {
  const key = useMemo(() => `badge:${listDealsKey(items)}`, [items]);
  const [deals, setDeals] = useState(() => readDealsCache(key));

  useEffect(() => {
    const wanted = (items || []).filter(item => item?.name)
      .map(item => ({ name: item.name, barcode: item.barcode || "" }));
    if (!wanted.length) return;
    let cancelled = false;
    let retry;
    // קריאה שנכשלה בגלל עומס זמני מקבלת ניסיון נוסף אחד, כדי שהתג לא ייעלם סתם
    const run = (attempt) => {
      fetchChainDeals({ mode: "items", items: wanted, chains: DEAL_BADGE_CHAINS })
        .then(result => {
          if (cancelled) return;
          const list = result.deals || [];
          setDeals(list);
          writeDealsCache(key, list);
        })
        .catch(() => {
          if (cancelled || attempt > 0) return;
          retry = setTimeout(() => run(1), 5000);
        });
    };
    const timer = setTimeout(() => run(0), 1200);
    return () => { cancelled = true; clearTimeout(timer); clearTimeout(retry); };
  }, [key]);

  return deals;
}