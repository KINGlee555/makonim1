import { base44 } from "@/api/base44Client";

// מבצעים אמיתיים מהרשתות — ישירות מקבצי השקיפות הרשמיים, ונשמרים ליום שלם בשרת.
export async function fetchChainDeals(payload) {
  const response = await base44.functions.invoke("chainDeals", payload);
  return response.data || {};
}

// קוראים את הרשתות בקבוצות קטנות: קריאה אחת שקוראת את קבצי המבצעים של כל הרשתות
// יחד חורגת ממגבלת ה-CPU של השרת, ובקבוצות התוצאות גם מגיעות מהר יותר.
// קבוצה של שתי רשתות היא הגבול שה-worker עומד בו. המבצעים מוצגים ברגע שקבוצה חוזרת,
// ולכן הרשתות שנקראות מהר ובאמינות מגיעות ראשונות, והקבצים הכבדים (רמי לוי ויוחננוף,
// שקריאתם נמשכת עד לקצה הזמן המוקצב) נשארים לאחרונות כדי לא לעכב את כל השאר.
export const DEAL_CHAIN_GROUPS = [
  ["shufersal", "osher_ad"],
  ["keshet", "fresh_market"],
  ["tiv_taam", "politzer"],
  ["stop_market", "salach_dabach"],
  ["yohananof", "rami_levy"]
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

// אחוז ההנחה של מבצע: מהמסמך של הרשת, ואם לא דווח — לפי המחיר שלפני המבצע.
export function dealDiscount(deal) {
  if (!deal) return 0;
  const reported = Number(deal.discount_rate ?? deal.discount ?? 0);
  if (reported > 0) return Math.round(reported);
  const full = Number(deal.price || 0);
  const now = Number(deal.deal_price || 0);
  return full > 0 && now > 0 && now < full ? Math.round((1 - now / full) * 100) : 0;
}

// ===== מטמון המבצעים בדפדפן =====
// המבצעים של היום נשמרים גם במכשיר, כך שהחלון נפתח עם מבצעים מיד והרענון ממשיך ברקע.
const CACHE_PREFIX = "makonim-deals-v1";
const cacheDay = () => new Date().toISOString().slice(0, 10);

// מפתח יציב לפי המוצרים, כדי שמטמון של רשימה אחת לא יידרס על ידי רשימה אחרת
export function listDealsKey(items) {
  return (items || []).map(item => `${item.name}|${item.barcode || ""}`).sort().join(";");
}

export function readDealsCache(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}:${key}`) || "null");
    return parsed?.day === cacheDay() ? parsed.deals || [] : [];
  } catch {
    return [];
  }
}

export function writeDealsCache(key, deals) {
  if (!deals?.length) return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}:${key}`, JSON.stringify({ day: cacheDay(), deals: deals.slice(0, 60) }));
  } catch {
    // אין מקום באחסון המקומי — פשוט לא שומרים
  }
}