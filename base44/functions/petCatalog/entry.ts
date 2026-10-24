import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

// קטלוג חנויות החיות — נטען מהאתר של כל חנות ונשמר אצלנו, כך שחיפוש, מבצעים
// ושקים גדולים עובדים מהר ובאופן זהה לכל המשפחה. נשמרים רק מוצרים עם תמונה אמיתית.
const STORES = [
  { id: "anipet", name: "אניפט", feed: "https://www.anipet.co.il/products.json", site: "https://www.anipet.co.il" },
];

const PAGE_SIZE = 250;
const PAGES_PER_CALL = 4;
const WRITE_BATCH = 400;
const LOOKUP_BATCH = 250;
const FRESH_HOURS = 12;

const sizeFromName = (name: string) => {
  const match = name.match(/(\d+(?:[.,]\d+)?)\s*(ק["׳'’]?ג|קילו|קג|kg|גרם|גר|מ"ל|ליטר)/i);
  return match ? match[0].replace(/\s+/g, " ").trim() : "";
};

const rowFromProduct = (store: any, product: any) => {
  const image = product?.images?.[0]?.src || "";
  if (!image) return null;
  const variant = (product.variants || []).find((item: any) => item && item.available) || product.variants?.[0] || {};
  const price = Number(variant.price);
  if (!(price > 0)) return null;
  const was = Number(variant.compare_at_price) || 0;
  const name = String(product.title || "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!name) return null;
  return {
    store: store.id,
    store_name: store.name,
    product_id: String(product.id || product.handle || name),
    name,
    brand: String(product.vendor || "").slice(0, 60),
    category: "חיות מחמד",
    size_label: sizeFromName(name),
    price,
    was_price: was > price ? was : 0,
    discount_pct: was > price ? Math.round((1 - price / was) * 100) : 0,
    image_url: image,
    url: product.handle ? `${store.site}/products/${product.handle}` : store.site,
    barcode: String(variant.barcode || ""),
    available: variant.available !== false,
  };
};

const batches = (rows: any[], size: number) => {
  const out: any[][] = [];
  for (let index = 0; index < rows.length; index += size) out.push(rows.slice(index, index + size));
  return out;
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const store = STORES.find((item) => item.id === body?.store) || STORES[0];
    let page = Number(body?.from_page) || 0;

    // קריאה בלי from_page רק בודקת אם הקטלוג טרי — ואם כן אין מה לטעון שוב
    if (!page) {
      // הקטלוג נחשב טרי רק אם גם המוצרים הוותיקים בו טריים — כך טעינה שנעצרה באמצע משלימה את עצמה
      const oldest = await base44.asServiceRole.entities.PetProduct.filter({ store: store.id }, "updated_date", 1);
      const total = await base44.asServiceRole.entities.PetProduct.count({ store: store.id });
      const last = oldest?.[0]?.updated_date ? new Date(oldest[0].updated_date).getTime() : 0;
      if (total > 0 && last && Date.now() - last < FRESH_HOURS * 3600 * 1000) {
        return Response.json({ store: store.id, store_name: store.name, skip: true, total, updated_at: oldest[0].updated_date });
      }
      page = 1;
    }

    const rows: any[] = [];
    let done = false;
    for (let step = 0; step < PAGES_PER_CALL; step += 1) {
      const response = await fetch(`${store.feed}?limit=${PAGE_SIZE}&page=${page}`, {
        headers: { "user-agent": "MaKonim pet catalog", "accept-language": "he-IL" },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`${store.name}: ${response.status}`);
      const payload = await response.json();
      const products = Array.isArray(payload?.products) ? payload.products : [];
      products.forEach((product: any) => {
        const row = rowFromProduct(store, product);
        if (row) rows.push(row);
      });
      page += 1;
      if (products.length < PAGE_SIZE) {
        done = true;
        break;
      }
    }

    // מוצר שכבר קיים אצלנו מתעדכן (מחיר ומבצע), וחדש נכנס — בלי כפילויות
    const known = new Map<string, string>();
    for (const batch of batches(rows, LOOKUP_BATCH)) {
      const existing = await base44.asServiceRole.entities.PetProduct.filter(
        { store: store.id, product_id: { $in: batch.map((row) => row.product_id) } }, "-created_date", batch.length
      );
      existing.forEach((record: any) => known.set(record.product_id, record.id));
    }
    const toCreate = rows.filter((row) => !known.has(row.product_id));
    const toUpdate = rows.filter((row) => known.has(row.product_id))
      .map((row) => ({ ...row, id: known.get(row.product_id) }));
    for (const batch of batches(toCreate, WRITE_BATCH)) await base44.asServiceRole.entities.PetProduct.bulkCreate(batch);
    for (const batch of batches(toUpdate, WRITE_BATCH)) await base44.asServiceRole.entities.PetProduct.bulkUpdate(batch);

    const total = await base44.asServiceRole.entities.PetProduct.count({ store: store.id });
    console.log("petCatalog", { store: store.id, page, done, created: toCreate.length, updated: toUpdate.length, total });
    return Response.json({
      store: store.id,
      store_name: store.name,
      created: toCreate.length,
      updated: toUpdate.length,
      pages_read: Math.min(page - (done ? 1 : 0), PAGES_PER_CALL),
      next_page: done ? 0 : page,
      done,
      total,
    });
  } catch (error) {
    console.error("petCatalog", error);
    return Response.json({ error: error instanceof Error ? error.message : "Pet catalog build failed" }, { status: 500 });
  }
}