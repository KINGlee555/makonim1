import { useEffect, useState } from "react";
import { fetchChainDeals } from "@/lib/chainDeals";

// מה מגיע מהחנות הקרובה: המבצעים של הרשת על המוצרים שברשימה,
// וההמלצות שלה — המבצעים השווים ברשת שלא נמצאים עדיין ברשימה.
// הקריאה כבדה (קובץ המבצעים של הרשת), ולכן נשמרת ליום שלם במכשיר.
const cacheKey = (chainId, wantedKey) => `makonim-store-deals-v1:${chainId}:${wantedKey}`;
const today = () => new Date().toISOString().slice(0, 10);

function readCache(key) {
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    return cached?.day === today() ? cached : null;
  } catch {
    return null;
  }
}

function writeCache(key, mine, recommended) {
  try { localStorage.setItem(key, JSON.stringify({ day: today(), mine, recommended })); } catch {}
}

export default function useNearestStoreDeals(chainId, items) {
  const wantedKey = (items || [])
    .filter(item => item?.name)
    .map(item => `${item.name}|${item.barcode || ""}`)
    .sort()
    .join(";");
  const key = cacheKey(chainId || "", wantedKey);

  const [mine, setMine] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chainId) return;
    const cached = readCache(key);
    if (cached) {
      setMine(cached.mine || []);
      setRecommended(cached.recommended || []);
      return;
    }

    let cancelled = false;
    const wanted = (items || []).filter(item => item?.name).slice(0, 20)
      .map(item => ({ name: item.name, barcode: item.barcode || "" }));
    const inList = new Set(wanted.map(item => item.name));

    setLoading(true);
    Promise.all([
      wanted.length ? fetchChainDeals({ mode: "items", items: wanted, chains: [chainId] }) : { deals: [] },
      fetchChainDeals({ mode: "popular", chains: [chainId] }),
    ])
      .then(([mineResult, popularResult]) => {
        if (cancelled) return;
        const storeDeals = (mineResult.deals || [])
          .sort((a, b) => (b.discount || 0) - (a.discount || 0))
          .slice(0, 4);
        const suggestions = (popularResult.deals || [])
          .filter(deal => deal.name && !inList.has(deal.name))
          .sort((a, b) => (b.discount || 0) - (a.discount || 0))
          .slice(0, 4);
        setMine(storeDeals);
        setRecommended(suggestions);
        if (storeDeals.length || suggestions.length) writeCache(key, storeDeals, suggestions);
      })
      .catch(() => {
        if (!cancelled) { setMine([]); setRecommended([]); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [chainId, wantedKey]);

  return { mine, recommended, loading };
}