import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FAST_CHAINS, fetchChainPrices } from "@/lib/chainPrices";

export default function useSyncPricesNow(items, onSynced) {
  const [state, setState] = useState({ syncing: false, syncedAt: "", failed: false, message: "המחירים ברשימה זו טרם נבדקו", partial: false });
  const basket = items.filter(item => !item.status || item.status === "pending");
  const syncNow = async () => {
    if (!basket.length || state.syncing) return;
    setState(previous => ({ ...previous, syncing: true, failed: false }));
    try {
      const result = await fetchChainPrices(basket, FAST_CHAINS, { refresh: true });
      if (!(result.liveMatched > 0)) {
        setState(previous => ({ ...previous, syncing: false, failed: true, message: result.matched ? "הרשתות לא החזירו עדכון; המחירים האחרונים נשמרו" : "לא התקבלו מחירים מהרשתות למוצרי הרשימה. לא שונו מחירים" }));
        return;
      }
      const fresh = new Map(result.statuses.filter(status => status.status === "fresh").map(status => [status.id, new Set(status.keys || [])]));
      const updates = basket.flatMap(item => {
        const key = item.barcode || item.name;
        const prices = result.chains.filter(chain => fresh.get(chain.id)?.has(key)).map(chain => chain.prices[key]).filter(price => price > 0);
        return item.id && prices.length ? [{ id: item.id, price: Math.min(...prices) }] : [];
      });
      if (updates.length) await base44.entities.ListItem.bulkUpdate(updates);
      onSynced?.(updates);
      window.dispatchEvent(new CustomEvent("makonim:prices-updated"));
      const partial = result.statuses.some(status => status.status === "unavailable") || updates.length < basket.length;
      setState({ syncing: false, failed: false, syncedAt: result.checkedAt, partial,
        message: `עודכנו מחירים ל־${updates.length} מתוך ${basket.length} מוצרים${partial ? " · עדכון חלקי" : ""}. המחיר הנמוך שנמצא ברשתות שנבדקו; עשוי להשתנות בסניף` });
    } catch {
      setState(previous => ({ ...previous, syncing: false, failed: true, message: "עדכון המחירים נכשל; המחירים הקיימים לא הוחלפו" }));
    }
  };
  return { ...state, syncNow, ready: basket.length > 0 };
}