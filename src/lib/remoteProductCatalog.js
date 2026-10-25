import { base44 } from "@/api/base44Client";
import { normalizeProductText, prepareProduct } from "@/lib/productSearch";

const memoryCache = new Map();
const pending = new Map();
// שאילתה שחזרה בלי תוצאות לא נשלחת שוב מיד — החיפוש בקטלוג כבד, ואין סיבה לחזור על שם שלא נמצא
const emptyUntil = new Map();
const EMPTY_COOLDOWN_MS = 10 * 60 * 1000;
const MAX_CACHED_QUERIES = 100;

function remember(key, products) {
  // תוצאה ריקה לא נשמרת לתמיד — תקלה זמנית בקטלוג לא תסתיר מוצרים לכל הסשן
  if (products.length === 0) {
    emptyUntil.set(key, Date.now() + EMPTY_COOLDOWN_MS);
    return products;
  }
  emptyUntil.delete(key);
  if (memoryCache.size >= MAX_CACHED_QUERIES) memoryCache.delete(memoryCache.keys().next().value);
  memoryCache.set(key, products);
  return products;
}

function cooling(key) {
  const until = emptyUntil.get(key);
  if (!until) return false;
  if (until < Date.now()) { emptyUntil.delete(key); return false; }
  return true;
}

async function lookUp(key, params) {
  if (memoryCache.has(key)) return memoryCache.get(key);
  if (cooling(key)) return [];
  if (!pending.has(key)) {
    // הקטלוג מחפש לפי השם האמיתי, ולכן נשלח את הטקסט כמו שהוא — הנרמול משמש רק כמפתח לזיכרון
    pending.set(key, base44.functions.invoke("searchProductCatalog", params)
      .then(response => ({ ok: true, products: (response.data?.products || []).map(prepareProduct) }))
      .catch(() => ({ ok: false, products: [] }))
      .finally(() => pending.delete(key)));
  }
  const { ok, products } = await pending.get(key);
  if (!ok) return products;
  return remember(key, products);
}

export async function searchRemoteCatalog(query) {
  const text = String(query || "").trim();
  const normalized = normalizeProductText(text);
  if (normalized.length < 2) return [];
  return lookUp(normalized, { query: text, limit: 48 });
}

export async function browseRemoteCategory(category) {
  const text = String(category || "").trim();
  if (!text) return [];
  return lookUp(`category:${normalizeProductText(text)}`, { category: text });
}