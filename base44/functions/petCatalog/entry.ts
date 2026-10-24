import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

// קטלוג חנויות החיות — נטען מהאתר של כל חנות ונשמר אצלנו, כך שחיפוש, מבצעים
// ושקים גדולים עובדים מהר ובאופן זהה לכל המשפחה. נשמרים רק מוצרים עם תמונה אמיתית.
// shopify = החנות מפרסמת products.json;  woo = חנות ווקומרס עם Store API פתוח.
const STORES = [
  { id: "anipet", name: "אניפט", kind: "shopify", feed: "https://www.anipet.co.il/products.json", site: "https://www.anipet.co.il" },
  { id: "petbest", name: "פט-בסט", kind: "woo", feed: "https://petbest.co.il/wp-json/wc/store/v1/products", site: "https://petbest.co.il" },
  { id: "toppet", name: "טופ פט", kind: "woo", feed: "https://www.toppet.co.il/wp-json/wc/store/v1/products", site: "https://www.toppet.co.il" },
  { id: "petmarket", name: "פט מרקט", kind: "woo", feed: "https://www.petmarket.co.il/wp-json/wc/store/v1/products", site: "https://www.petmarket.co.il" },
  { id: "petpoint", name: "פט פוינט", kind: "shopify", feed: "https://www.petpoint.co.il/products.json", site: "https://www.petpoint.co.il" },
  { id: "petfastgo", name: "פטפסטגו", kind: "shopify", feed: "https://www.petfastgo.co.il/products.json", site: "https://www.petfastgo.co.il" },
  { id: "superpet", name: "סופר פט", kind: "woo", feed: "https://www.superpet.co.il/wp-json/wc/store/v1/products", site: "https://www.superpet.co.il" },
];

const PAGE_SIZE = { shopify: 250, woo: 100 };
const PAGES_PER_CALL = 5;
const WRITE_BATCH = 500;
const LOOKUP_BATCH = 250;
const FRESH_HOURS = 12;
const PET_CATEGORY = "חיות מחמד";

// שם נקי בלי תגיות HTML — חלק מהחנויות מפרסמות שם עם עיצוב
const cleanName = (value: any) => String(value || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&[a-z#0-9]+;/gi, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 120);

const sizeFromName = (name: string) => {
  const match = name.match(/(\d+(?:[.,]\d+)?)\s*(ק["׳'’]?ג|קילו|קג|kg|גרם|גר|מ"ל|ליטר)/i);
  return match ? match[0].replace(/\s+/g, " ").trim() : "";
};

const brandOf = (product: any) => {
  const brand = Array.isArray(product?.brands) ? product.brands[0]?.name : "";
  if (brand) return String(brand).slice(0, 60);
  const attribute = (product?.attributes || []).find((item: any) => /מותג|brand/i.test(item?.name || ""));
  const term = attribute?.terms?.[0]?.name;
  return String(term || product?.vendor || "").slice(0, 60);
};

const baseRow = (store: any, name: string, productId: any, price: number, was: number, image: string, url: string, barcode: string, available: boolean, brand: string) => ({
  store: store.id,
  store_name: store.name,
  product_id: String(productId || name),
  name,
  brand,
  category: PET_CATEGORY,
  size_label: sizeFromName(name),
  price,
  was_price: was > price ? was : 0,
  discount_pct: was > price ? Math.round((1 - price / was) * 100) : 0,
  image_url: image,
  url: url || store.site,
  barcode,
  available,
});

const rowFromShopify = (store: any, product: any) => {
  const image = product?.images?.[0]?.src || "";
  if (!image) return null;
  const variant = (product.variants || []).find((item: any) => item && item.available) || product.variants?.[0] || {};
  const price = Number(variant.price);
  if (!(price > 0)) return null;
  const was = Number(variant.compare_at_price) || 0;
  const name = cleanName(product.title);
  if (!name) return null;
  const url = product.handle ? `${store.site}/products/${product.handle}` : store.site;
  return baseRow(store, name, product.id || product.handle, price, was, image, url, String(variant.barcode || ""), variant.available !== false, brandOf(product));
};

const rowFromWoo = (store: any, product: any) => {
  const image = product?.images?.[0]?.src || product?.images?.[0]?.thumbnail || "";
  if (!image) return null;
  // ווקומרס מחזיר מחיר ביחידות הקטנות של המטבע — לפי מה שהחנות מצהירה
  const minor = Number(product?.prices?.currency_minor_unit);
  const scale = 10 ** (Number.isFinite(minor) ? minor : 2);
  const price = Number(product?.prices?.price) / scale;
  const regular = Number(product?.prices?.regular_price) / scale;
  if (!(price > 0)) return null;
  const was = product?.on_sale && regular > price ? regular : 0;
  const name = cleanName(product?.name);
  if (!name) return null;
  return baseRow(store, name, product.id || product.slug, price, was, image, product?.permalink || store.site, String(product?.sku || ""), product?.is_in_stock !== false, brandOf(product));
};

const batches = (rows: any[], size: number) => {
  const out: any[][] = [];
  for (let index = 0; index < rows.length; index += size) out.push(rows.slice(index, index + size));
  return out;
};

// מצב הסנכרון של כל חנות — כדי שטעינה שנקטעה באמצע תמשיך מהדף שנעצר בו
const syncState = async (base44: any, store: any) => {
  const rows = await base44.asServiceRole.entities.PetSync.filter({ store: store.id }, "-created_date", 1);
  return rows?.[0] || null;
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const store = STORES.find((item) => item.id === body?.store) || STORES[0];
    const size = PAGE_SIZE[store.kind as keyof typeof PAGE_SIZE] || 250;
    let page = Number(body?.from_page) || 0;

    const sync = await syncState(base44, store);
    const storedTotal = await base44.asServiceRole.entities.PetProduct.count({ store: store.id });
    const syncedAt = sync?.last_run ? new Date(sync.last_run).getTime() : 0;

    // קריאה בלי from_page רק בודקת אם הקטלוג שלם וטרי — ואם כן אין מה לטעון שוב.
    // חנות שנקטעה באמצע ממשיכה מהדף שעצרנו בו, ולכן היא לא נחשבת מוכנה.
    if (!page) {
      const fresh = sync?.done && storedTotal > 0 && syncedAt && Date.now() - syncedAt < FRESH_HOURS * 3600 * 1000;
      if (fresh) {
        return Response.json({ store: store.id, store_name: store.name, skip: true, total: storedTotal, updated_at: sync.last_run });
      }
      page = sync && !sync.done ? (Number(sync.next_page) || 1) : 1;
    }

    const rows: any[] = [];
    let done = false;
    let published = 0;
    for (let step = 0; step < PAGES_PER_CALL; step += 1) {
      const url = store.kind === "woo"
        ? `${store.feed}?per_page=${size}&page=${page}`
        : `${store.feed}?limit=${size}&page=${page}`;
      const response = await fetch(url, {
        headers: { "user-agent": "MaKonim pet catalog", "accept-language": "he-IL" },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`${store.name}: ${response.status}`);
      if (!published) published = Number(response.headers.get("x-wp-total")) || 0;
      const payload = await response.json();
      const products = store.kind === "woo"
        ? (Array.isArray(payload) ? payload : [])
        : (Array.isArray(payload?.products) ? payload.products : []);
      products.forEach((product: any) => {
        const row = store.kind === "woo" ? rowFromWoo(store, product) : rowFromShopify(store, product);
        if (row) rows.push(row);
      });
      page += 1;
      if (products.length < size) {
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
    const state = { next_page: done ? 1 : page, published, done, last_run: new Date().toISOString() };
    if (sync) await base44.asServiceRole.entities.PetSync.update(sync.id, state);
    else await base44.asServiceRole.entities.PetSync.create({ store: store.id, ...state });
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