import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CHAINS, FAST_CHAINS, OTHER_CHAINS, fetchChainPrices } from "@/lib/chainPrices";

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
  chains: [...(first.chains || []), ...(second.chains || [])].filter(
    (chain, index, all) => all.findIndex(other => other.id === chain.id) === index
  ),
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
  const saved = useRef(false);

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
      try {
        const first = await fetchChainPrices(basket, FAST_CHAINS);
        if (cancelled) return;
        setState({ loading: false, error: false, day: first.day || "", chains: first.chains || [], barcodes: barcodesOf(first) });
        setRefreshing(true);
        const rest = await fetchChainPrices(basket, OTHER_CHAINS);
        if (cancelled) return;
        const merged = merge(first, rest);
        setState(merged);
        setRefreshing(false);
        cache.set(signature, { at: Date.now(), data: merged });
      } catch {
        if (cancelled) return;
        setState({ ...empty, error: true });
        setRefreshing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [signature, enabled]);

  // Learn the barcode of items that only had a name — the next visit is a direct lookup.
  useEffect(() => {
    if (saved.current || !Object.keys(state.barcodes).length) return;
    saved.current = true;
    const updates = itemsRef.current
      .filter(item => item.id && !item.barcode && state.barcodes[item.name])
      .map(item => ({ id: item.id, barcode: state.barcodes[item.name] }));
    if (updates.length) base44.entities.ListItem.bulkUpdate(updates).catch(() => {});
  }, [state.barcodes]);

  const comparison = useMemo(() => {
    const rows = items.map(item => {
      const key = item.barcode || item.name;
      const quantity = item.quantity || 1;
      const prices = state.chains
        .map(chain => ({ chain, price: chain.prices?.[key] }))
        .filter(entry => entry.price > 0)
        .map(entry => ({ chain: entry.chain.name, chainId: entry.chain.id, unit: entry.price, total: entry.price * quantity }));
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
    }).filter(chain => chain.covered > 0).sort((a, b) => a.total - b.total);

    return { rows, totals, matched: rows.length, coverage: totals.length ? Math.max(...totals.map(chain => chain.covered)) : 0 };
  }, [items, state.chains]);

  return { ...state, refreshing, ...comparison };
}