import { base44 } from "@/api/base44Client";

// מבצעים אמיתיים מהרשתות — ישירות מקבצי השקיפות הרשמיים, ונשמרים ליום שלם בשרת.
export async function fetchChainDeals(payload) {
  const response = await base44.functions.invoke("chainDeals", payload);
  return response.data || {};
}

// קוראים את הרשתות בקבוצות קטנות: קריאה אחת שקוראת את קבצי המבצעים של כל הרשתות
// יחד חורגת ממגבלת ה-CPU של השרת, ובקבוצות התוצאות גם מגיעות מהר יותר.
export const DEAL_CHAIN_GROUPS = [
  ["shufersal", "rami_levy"],
  ["yohananof", "osher_ad"],
  ["tiv_taam", "keshet", "fresh_market"],
  ["stop_market", "politzer", "salach_dabach"]
];

// התג ברשימה נבדק מול שתי הרשתות הגדולות — קריאה קלה ומהירה.
export const DEAL_BADGE_CHAINS = ["shufersal", "rami_levy"];

export async function fetchChainDealsInGroups(payload, onProgress) {
  let all = [];
  for (const chains of DEAL_CHAIN_GROUPS) {
    try {
      const data = await fetchChainDeals({ ...payload, chains });
      all = [...all, ...(data.deals || [])];
      all.sort((a, b) => (b.discount - a.discount) || (a.deal_price - b.deal_price));
      if (onProgress) onProgress([...all]);
    } catch {
      // רשת שלא ענתה לא עוצרת את השאר
    }
  }
  return all;
}

export function itemDeals(items, onProgress) {
  const wanted = (items || []).filter(item => item?.name)
    .map(item => ({ name: item.name, barcode: item.barcode || "" }));
  if (!wanted.length) return Promise.resolve([]);
  return fetchChainDealsInGroups({ mode: "items", items: wanted }, onProgress);
}

// המבצע הטוב ביותר לפריט: קודם לפי ברקוד, ואם אין — לפי שם המוצר.
export function dealForItem(deals, item) {
  if (!deals?.length || !item) return null;
  return (item.barcode && deals.find(deal => deal.barcode === item.barcode))
    || deals.find(deal => deal.name === item.name) || null;
}

// מבצעי "2 ב-18" מוצגים כמו שהם כתובים ברשת, ולא כמחיר ליחידה.
export function multiBuyText(deal) {
  const match = String(deal?.description || "").match(/(\d+)\s*ב\s*[־-]?\s*(\d+(?:\.\d+)?)/);
  return match ? `${match[1]} ב-${match[2]}` : "";
}

export function dealPriceText(deal) {
  if (!deal) return "";
  return multiBuyText(deal) || `₪${Number(deal.deal_price || 0).toFixed(2)}`;
}