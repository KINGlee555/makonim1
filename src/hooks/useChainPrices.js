import { useEffect, useMemo, useRef, useState } from "react";
import { CHAINS, FAST_CHAINS, OTHER_CHAINS, MORE_CHAINS, fetchChainPrices } from "@/lib/chainPrices";
import { isWeight, weightInKg } from "@/lib/units";

// Answers are kept in memory for a while: reopening the comparison inside the same
// visit is instant and never hits the network again.
const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map();

const empty = { loading: false, error: false, day: "", chains: [], barcodes: {} };

const barcodesOf = (data) => {
  const map = {};
  for (const entry of data.items || []) if (entry.name && entry.barcode) map[entry.name] = entry.barcode;
  return map;
};

const merge = (first, second) => ({
  loading: false, error: false,
  day: second.day || first.day || "",
  chains: [...new Map([...(first.chains || []), ...(second.chains || [])].map(chain => [chain.id, chain])).values()],
  barcodes: { ...barcodesOf(first), ...barcodesOf(second) }
});

// Real per-chain pricing for the current basket, in two quick rounds so the first
// prices appear fast. Returns one row per item at least one chain has a price for,
// plus what the basket would cost at each chain.
export function useChainPrices(items, enabled) {
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const signature = useMemo(
    () => items.map(item => `${item.barcode || item.name}:${item.quantity || 1}`).join("|"),
    [items]
  );
  const [state, setState] = useState(empty);
  const [refreshing, setRefreshing] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const invalidate = () => { cache.clear(); setRevision(value => value + 1); };
    window.addEventListener("makonim:prices-updated", invalidate);
    return () => window.removeEventListener("makonim:prices-updated", invalidate);
  }, []);

  useEffect(() => {
    if (!enabled || !itemsRef.current.length) return;
    const hit = cache.get(signature);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      setState(hit.data);
      setRefreshing(false);
      return;
    }
    let cancelled = false;
    const basket = itemsRef.current;
    setState({ ...empty, loading: true });
    setRefreshing(false);
    (async () => {
      let accumulated = { chains: [], items: [], day: "" };
      try {
        const cached = await fetchChainPrices(basket, undefined, { cacheOnly: true });
        accumulated = cached;
        if (cancelled) return;
        if (cached.chains?.length) setState({ loading: false, error: false, day: cached.day || "", chains: cached.chains, barcodes: barcodesOf(cached) });
        setRefreshing(true);
        for (const chains of [FAST_CHAINS, OTHER_CHAINS, MORE_CHAINS]) {
          const result = await fetchChainPrices(basket, chains);
          if (cancelled) return;
          const joined = merge(accumulated, result);
          accumulated = { ...joined, items: [...(accumulated.items || []), ...(result.items || [])] };
          setState({ ...joined, error: !joined.chains.length });
        }
        cache.set(signature, { at: Date.now(), data: { ...accumulated, loading: false, error: !accumulated.chains.length, barcodes: barcodesOf(accumulated) } });
      } catch {
        if (!cancelled) setState(previous => ({ ...previous, loading: false, error: !previous.chains.length }));
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [signature, enabled, revision]);



  const comparison = useMemo(() => {
    const rows = items.map(item => {
      const key = item.barcode || item.name;
      const quantity = item.quantity || 1;
      // מוצרי משקל מתומחרים לק״ג — הגרמים מומרים בהתאם
      const factor = isWeight(item.unit) ? weightInKg(item) : quantity;
      const prices = state.chains
        .map(chain => ({ chain, price: chain.prices?.[key] }))
        .filter(entry => entry.price > 0)
        .map(entry => ({ chain: entry.chain.name, chainId: entry.chain.id, unit: entry.price, total: entry.price * factor }));
      if (!prices.length) return null;
      const totals = prices.map(entry => entry.total);
      const min = Math.min(...totals);
      const max = Math.max(...totals);
      return { id: item.id || item.name, name: item.name, quantity, prices, min, max, diff: max - min, best: prices.find(entry => entry.total === min).chain };
    }).filter(Boolean);

    const totals = CHAINS.map(chain => {
      let total = 0;
      let covered = 0;
      for (const row of rows) {
        const entry = row.prices.find(price => price.chainId === chain.id);
        if (!entry) continue;
        total += entry.total;
        covered += 1;
      }
      return { id: chain.id, name: chain.name, total, covered };
    }).filter(chain => chain.covered > 0).sort((a, b) => b.covered - a.covered || a.total - b.total);

    return { rows, totals, matched: rows.length, coverage: totals.length ? Math.max(...totals.map(chain => chain.covered)) : 0 };
  }, [items, state.chains]);

  return { ...state, refreshing, ...comparison };
}