import { useEffect, useRef } from "react";
import { FAST_CHAINS, OTHER_CHAINS, fetchChainPrices } from "@/lib/chainPrices";

// Warms the price cache in the background while the shopping list is open, so the
// comparison screens are ready the moment they're tapped. Runs at most once per
// half hour per basket, and never blocks anything on screen.
const TTL_MS = 30 * 60 * 1000;
const warmed = new Map();

export function useWarmChainPrices(items) {
  const pending = items.filter(item => !item.status || item.status === "pending");
  const signature = pending.map(item => item.barcode || item.name).join("|");
  const done = useRef("");

  useEffect(() => {
    if (!signature || pending.length < 3 || done.current === signature) return;
    const last = warmed.get(signature);
    if (last && Date.now() - last < TTL_MS) return;
    done.current = signature;
    warmed.set(signature, Date.now());
    const basket = pending.slice(0, 24).map(item => ({ name: item.name, barcode: item.barcode || "" }));
    (async () => {
      try {
        await fetchChainPrices(basket, FAST_CHAINS);
        await fetchChainPrices(basket, OTHER_CHAINS);
      } catch {
        // Offline or a chain feed is down — the comparison will retry when opened.
      }
    })();
  }, [signature, pending.length]);
}