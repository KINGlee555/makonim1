import { base44 } from "@/api/base44Client";
import { normalizeProductText, prepareProduct } from "@/lib/productSearch";

const memoryCache = new Map();
const pending = new Map();
const MAX_CACHED = 60;

function remember(key, products) {
  if (products.length === 0) return products;
  if (memoryCache.size >= MAX_CACHED) memoryCache.delete(memoryCache.keys().next().value);
  memoryCache.set(key, products);
  return products;
}

function toProduct(row) {
  return prepareProduct({
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    brand: row.brand || "",
    category: row.category || "אחר",
    price: row.price || 0,
    image_url: row.image_url || "",
    image_verified: true,
    catalog_source: "catalog",
    chain_name: row.chain_name || "",
    weighted: Boolean(row.weighted)
  });
}

// החיפוש נעשה בשרת על קטלוג המוצרים השמור (אלפי מוצרים מכל הרשתות), ולכן הוא מהיר
// ואינו תלוי באף אתר חיצוני. תמונות אמיתיות כבר שמורות לכל מוצר.
export async function searchStoredCatalog({ query = "", category = "", limit = 150 } = {}) {
  const term = normalizeProductText(query);
  const key = `${term}|${category}|${limit}`;
  if (memoryCache.has(key)) return memoryCache.get(key);
  if (pending.has(key)) return pending.get(key);

  const filter = {};
  if (category) filter.category = category;
  if (term.length >= 1) {
    // מילת החיפוש הראשונה מסוננת בשרת; שאר המילים מסוננות מיד אחר כך במסך.
    const first = query.trim().replace(/[%.,()/\\-]/g, " ").replace(/\s+/g, " ").trim().split(" ")[0] || "";
    if (!first) return [];
    // מאות ראשונה ההצעות מופיעות מיד — לפי המוצרים שמתחילים באות הזו
    filter.name = { $regex: first.length === 1 ? `^${first}` : first };
  }
  if (!Object.keys(filter).length) return [];

  const load = base44.entities.CatalogProduct.filter(filter, { sort: "name", limit })
    .then(rows => (Array.isArray(rows) ? rows : rows?.items || []).map(toProduct))
    .catch(() => [])
    .finally(() => pending.delete(key));
  pending.set(key, load);
  return remember(key, await load);
}