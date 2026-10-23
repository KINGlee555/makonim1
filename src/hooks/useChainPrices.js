import { useEffect, useMemo, useState } from "react";
import { CHAINS, fetchChainPrices } from "@/lib/chainPrices";

// Real per-chain pricing for the current basket.
// Returns one row per item that at least one chain has a price for, plus the
// basket total each chain would cost (over the items that chain carries).
export function useChainPrices(items, enabled) {
  const key = items.map(item => `${item.id || item.name}:${item.quantity || 1}:${item.barcode || ""}`).join("|");
  const [state, setState] = useState({ loading: false, error: false, day: "", chains: [], barcodes: {} });

  useEffect(() => {
    if (!enabled || !items.length) {
      setState({ loading: false, error: false, day: "", chains: [], barcodes: {} });
      return;
    }
    let cancelled = false;
    setState(prev => ({ ...prev, loading: true, error: false }));
    fetchChainPrices(items)
      .then(data => {
        if (cancelled) return;
        const barcodes = {};
        for (const entry of data.items || []) if (entry.name && !barcodes[entry.name]) barcodes[entry.name] = entry.barcode;
        setState({ loading: false, error: false, day: data.day || "", chains: data.chains || [], barcodes });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: true, day: "", chains: [], barcodes: {} });
      });
    return () => { cancelled = true; };
  }, [key, enabled]);

  const comparison = useMemo(() => {
    const rows = items.map(item => {
      const barcode = item.barcode || state.barcodes[item.name] || "";
      const quantity = item.quantity || 1;
      const prices = CHAINS
        .map(chain => ({ chain, price: state.chains.find(c => c.id === chain.id)?.prices?.[barcode] }))
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
  }, [items, state.barcodes, state.chains]);

  return { ...state, ...comparison };
}