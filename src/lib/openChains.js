import { CHAINS } from "@/lib/chainPrices";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";

// הרשתות שפתוחות ממש עכשיו — לפי שעות הפתיחה של הרשת, כולל שעות שבת.
// משמש להצעת חנות רק כשהיא פתוחה: חנות סגורה לא מוצעת בכלל.
export function openChainsNow(now = new Date()) {
  return CHAINS.map(chain => {
    const store = SUPERMARKETS.find(item => item.chain === chain.id);
    const status = storeStatus(now, store?.shabbat || null);
    return { ...chain, open: status.open, until: status.time };
  }).filter(chain => chain.open);
}