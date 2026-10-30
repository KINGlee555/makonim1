import { base44 } from "@/api/base44Client";
import { normalizeProductText, prepareProduct } from "@/lib/productSearch";

// דפי תוצאות מהקטלוג השמור. הדף הראשון נשמר כדי שפתיחה חוזרת של אותו חיפוש
// תהיה מיידית, וכל דף נוסף נשמר לפי הסמן שלו — כך "טען עוד" לא ממתין לשרת.
const pageCache = new Map();
const pending = new Map();
const MAX_CACHED = 120;

function cachePage(key, page) {
  if (!page.items.length) return page;
  if (pageCache.size >= MAX_CACHED) pageCache.delete(pageCache.keys().next().value);
  pageCache.set(key, page);
  return page;
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

function buildFilter(query, category) {
  const filter = {};
  if (category) filter.category = category;
  if (query) {
    // מילת החיפוש הראשונה מסוננת בשרת; שאר המילים מסוננות מיד אחר כך במסך.
    const first = query.trim().replace(/[%.,()/\\-]/g, " ").replace(/\s+/g, " ").trim().split(" ")[0] || "";
    if (!first) return null;
    // חיפוש לפי תחילת השם — מהיר במיוחד על קטלוג גדול, ומחזיר בדיוק את מה שמחפשים:
    // מי שמקליד "חלב" מקבל את מוצרי החלב, וההשלמה החכמה נשארת במסך.
    const safe = first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: `^${safe}` };
  }
  return Object.keys(filter).length ? filter : null;
}

// החיפוש נעשה בשרת על קטלוג המוצרים השמור (עשרות אלפי מוצרים מכל הרשתות בישראל).
// כל קריאה מחזירה דף אחד מהיר, והדף הבא נטען לפי הסמן — בלי לשלוף שוב את מה שכבר הוצג.
export async function searchStoredCatalog({ query = "", category = "", limit = 60, cursor = "" } = {}) {
  const term = normalizeProductText(query);
  const filter = buildFilter(term ? query : "", category);
  if (!filter) return { items: [], nextCursor: "" };

  const key = `${term}|${category}|${limit}|${cursor}`;
  if (pageCache.has(key)) return pageCache.get(key);
  if (pending.has(key)) return pending.get(key);

  const load = base44.entities.CatalogProduct.filter(filter, { sort: "name", limit, cursor: cursor || undefined })
    .then(page => {
      const rows = Array.isArray(page) ? page : page?.items || [];
      return {
        items: rows.map(toProduct),
        nextCursor: Array.isArray(page) ? "" : page?.next_cursor || ""
      };
    })
    .catch(() => ({ items: [], nextCursor: "" }))
    .finally(() => pending.delete(key));
  pending.set(key, load);
  return cachePage(key, await load);
}

// טעינה מראש של הדף הבא — כך הלחיצה על "טען עוד" מציגה מיד, בלי המתנה.
export function prefetchStoredCatalog(params) {
  if (!params?.cursor) return;
  searchStoredCatalog(params).catch(() => {});
}