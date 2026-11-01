import { useState } from "react";
import { FAST_CHAINS, fetchChainPrices } from "@/lib/chainPrices";

// סנכרון מחירים לפי דרישת המשתמש: קורא עכשיו את קבצי השקיפות הרשמיים של הרשתות
// עבור המוצרים שברשימה, ומחזיר מתי הפעולה הסתיימה — כדי שהמסך יראה שעה אמיתית.
const basketOf = (items = []) =>
  items
    .filter(item => !item.status || item.status === "pending")
    .slice(0, 12)
    .map(item => ({ name: item.name, barcode: item.barcode || "" }))
    .filter(item => item.name || item.barcode);

export default function useSyncPricesNow(items) {
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState("");
  const [failed, setFailed] = useState(false);

  const syncNow = async () => {
    const basket = basketOf(items);
    if (!basket.length || syncing) return;
    setSyncing(true);
    setFailed(false);
    try {
      // הרשתות הגדולות בלבד — סנכרון שמסתיים תוך שניות, לא דקה
      await fetchChainPrices(basket, FAST_CHAINS);
      setSyncedAt(new Date().toISOString());
    } catch {
      setFailed(true);
    } finally {
      setSyncing(false);
    }
  };

  return { syncing, syncedAt, failed, syncNow, ready: basketOf(items).length > 0 };
}