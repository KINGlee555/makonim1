// המאגרים הפתוחים העולמיים: ארבעה מאגרי מוצרים שנבנו מסריקות של קונים אמיתיים,
// וכולם שומרים תמונה אמיתית של המוצר עצמו. לאותו ברקוד שאין לו תמונה במאגר המזון
// יש לעיתים תמונה במאגר הטיפוח, במאגר החיות או במאגר מוצרי הבית — ולכן שואלים את כולם.
// כולם חולקים את אותה סכמת API, ולכן אותו קוד משרת את כולם.

type Database = { host: string; source: string; name: string };

const DATABASES: Database[] = [
  { host: "world.openfoodfacts.org", source: "open_food_facts", name: "קטלוג ישראלי — מזון" },
  { host: "world.openbeautyfacts.org", source: "open_beauty_facts", name: "קטלוג ישראלי — טיפוח" },
  { host: "world.openpetfoodfacts.org", source: "open_pet_food_facts", name: "קטלוג ישראלי — חיות" },
  { host: "world.openproductsfacts.org", source: "open_products_facts", name: "קטלוג ישראלי — בית" }
];

const HEADERS = {
  "User-Agent": "MaKonim/1.0 (+https://makonim-share-shop.base44.app)",
  Accept: "application/json"
};

const PHOTO_FIELDS = "code,image_front_url,image_url";
const PRODUCT_FIELDS = "code,product_name,brands,image_front_url,image_url,quantity,countries_tags";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const OPEN_SOURCES = DATABASES.map((database) => database.source);

// תמונה אמיתית בלבד: ה-URL של התמונה שהקונה צילם, ואם אין — של המוצר עצמו.
const realPhoto = (product: any) => String(product?.image_front_url || product?.image_url || "").replace(/^http:/, "https://");

async function fetchJson(url: string, timeout: number) {
  try {
    const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(timeout) });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") || "";
    if (!type.includes("json")) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// תמונה אמיתית לכל ברקוד: עוברים מאגר-מאגר, ובכל מאגר שואלים רק את הברקודים
// שעדיין אין להם תמונה — כך מספר הבקשות נשאר קטן והכיסוי עולה.
export async function photosFromOpenDatabases(codes: string[], options: { skipFoodFacts?: boolean } = {}) {
  const images = new Map<string, string>();
  const wanted = codes.filter(Boolean);
  if (!wanted.length) return images;
  const databases = options.skipFoodFacts ? DATABASES.filter((db) => db.source !== "open_food_facts") : DATABASES;

  for (const database of databases) {
    const missing = wanted.filter((code) => !images.has(code));
    if (!missing.length) break;
    for (let i = 0; i < missing.length; i += 40) {
      const batch = missing.slice(i, i + 40);
      const params = new URLSearchParams({ code: batch.join(","), fields: PHOTO_FIELDS, page_size: "40" });
      const data = await fetchJson(`https://${database.host}/api/v2/search?${params}`, 25000);
      for (const product of data?.products || []) {
        const image = realPhoto(product);
        if (image) images.set(String(product.code), image);
      }
      await pause(300);
    }
  }
  return images;
}

export type OpenProduct = {
  code: string;
  name: string;
  brand: string;
  quantity: string;
  image: string;
  source: string;
  source_name: string;
};

const hebrew = (name: string) => /[\u0590-\u05FF]/.test(name);

// מוצרים אמיתיים עם תמונה מתוך המאגרים הפתוחים, לפי המדינה שבה נסרקו. הדפים ממוינים
// לפי מספר הסריקות, ולכן כל הרצה ממשיכה עמוק יותר — ומה שכבר יש אצלנו פשוט מדולג.
export async function openCountryProducts({ country = "israel", pages = 2, pageSize = 100, pageBySource = {} as Record<string, number> } = {}) {
  const products: OpenProduct[] = [];
  for (const database of DATABASES) {
    const first = Math.max(1, Number(pageBySource[database.source]) || 1);
    for (let page = first; page < first + pages; page++) {
      const params = new URLSearchParams({
        countries_tags_en: country, fields: PRODUCT_FIELDS,
        page_size: String(pageSize), page: String(page), sort_by: "unique_scans_n"
      });
      const data = await fetchJson(`https://${database.host}/api/v2/search?${params}`, 30000);
      const rows: any[] = data?.products || [];
      // מוצר ישראלי עם שם בעברית שימושי למשתמש יותר משם באנגלית — והוא נכנס ראשון.
      const candidates = rows
        .map((raw) => ({
          code: String(raw.code || ""),
          name: String(raw.product_name || "").trim(),
          brand: String(raw.brands || "").split(",")[0].trim(),
          quantity: String(raw.quantity || ""),
          image: realPhoto(raw),
          source: database.source,
          source_name: database.name,
          // נכנס רק מוצר שנמכר בישראל — מוצר שקיים רק בחו"ל פשוט לא נכנס לקטלוג.
          israeli: (raw.countries_tags || []).includes(`en:${country}`)
        }))
        .filter((item) => item.code && item.image && item.name && item.israeli);
      candidates.sort((a, b) => Number(hebrew(b.name)) - Number(hebrew(a.name)));
      products.push(...candidates);
      if (rows.length < pageSize) break;
      await pause(800);
    }
    await pause(1200);
  }
  return products;
}