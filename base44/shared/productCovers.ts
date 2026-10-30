// תמונה לכל מוצר בקטלוג.
//
// הסדר שבו נבחרת תמונה:
// 1. התמונה של הברקוד של המוצר עצמו (המדויק ביותר).
// 2. התמונה של אותו מוצר בדיוק בגודל אחר — "חלב 3% 1 ליטר" ו"חלב 3% 2 ליטר"
//    הם אותו מוצר ולכן אותה תמונה.
// 3. תמונת המוצר לפי שמו (גבינה, לחם, עגבנייה...).
// 4. תמונה של מוצר אחר של אותו מותג באותה מחלקה.
// 5. תמונה של המחלקה עצמה — תמיד תמונה אמיתית ומתאימה, אף פעם לא מוצר אחר לגמרי.
//
// כך לכל מוצר יש תמונה אמיתית של מוצר אמיתי — גם כשאין תמונה לברקוד המדויק שלו.

import { typePhoto } from "./typePhotos.ts";

const UNITS = /^(גרם|גר|ג|קילו|קג|ק"ג|ק״ג|מל|מ"ל|מ״ל|ליטר|ל|יח|יח'|יח׳|יחידות|מ"ג|אחוז|משקל|אריזה|ארוז)$/;

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": "\"", "&#39;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };

export function cleanName(name: string) {
  let text = String(name || "");
  for (let i = 0; i < 3; i++) {
    text = text.replace(/&(amp|quot|#39|apos|lt|gt|nbsp);/g, (match) => ENTITIES[match] || " ");
  }
  return text.replace(/<[^>]*>/g, " ").replace(/[\u200e\u200f]/g, " ").replace(/["'׳״]/g, " ").replace(/\s+/g, " ").trim();
}

// המילים שמזהות את המוצר עצמו — בלי מידות, כמויות ומספרים, כדי ששני גדלים
// של אותו מוצר יקבלו בדיוק את אותה תמונה.
function keyWords(name: string) {
  return cleanName(name)
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1 && !/^\d+$/.test(word) && !UNITS.test(word) && !/^\d/.test(word));
}

export function familyKey(name: string) {
  const words = keyWords(name).slice(0, 4);
  return words.length >= 2 ? words.join(" ") : "";
}

export function brandKey(brand: string, category: string) {
  const words = keyWords(brand).slice(0, 2);
  return words.length ? `${words.join(" ")}|${category || ""}` : "";
}

const pexels = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

// תמונה אמיתית לכל מחלקה — הגיבוי האחרון, ותמיד משהו שקשור למוצר עצמו
const CATEGORY_PHOTOS: Record<string, string> = {
  "מוצרי חלב": pexels(416656),
  "חטיפים ומתוקים": pexels(298310),
  "משקאות": pexels(50593),
  "בשר ודגים": pexels(1639557),
  "לחם ומאפים": pexels(1775043),
  "קפואים": pexels(158388),
  "פירות וירקות": pexels(1656664),
  "חד פעמי וניקיון": pexels(4239146),
  "שימורים": pexels(4198020),
  "אחר": pexels(264636)
};

export type CoverMaps = {
  family: Map<string, string>;
  brand: Map<string, string>;
};

export function emptyCovers(): CoverMaps {
  return { family: new Map(), brand: new Map() };
}

// המפה נבנית ממוצרים שכבר יש להם תמונה אמיתית בקטלוג — וכך מוצר חדש מקבל את
// התמונה של אותו מוצר בגודל אחר, או של אותו מותג באותה מחלקה.
export function addCover(maps: CoverMaps, { name, brand, category, image }: { name: string; brand?: string; category?: string; image: string }) {
  if (!image) return;
  const family = familyKey(name);
  if (family && !maps.family.has(family)) maps.family.set(family, image);
  const brandId = brandKey(brand || "", category || "");
  if (brandId && !maps.brand.has(brandId)) maps.brand.set(brandId, image);
}

// טוען את המפות מהקטלוג הקיים (בעמודים)
export async function loadCoverMaps(client: any, rows = 20000) {
  const maps = emptyCovers();
  const pageSize = 500;
  let cursor: string | undefined;
  for (let i = 0; i < Math.ceil(rows / pageSize); i++) {
    const page = await client.asServiceRole.entities.CatalogProduct.filter(
      { image_url: { $ne: "" } },
      { sort: "-created_date", limit: pageSize, cursor }
    );
    const items = Array.isArray(page) ? page : page?.items || [];
    if (!items.length) break;
    for (const row of items) addCover(maps, row);
    cursor = Array.isArray(page) ? undefined : page.next_cursor;
    if (!cursor) break;
  }
  return maps;
}

// התמונה של המוצר: המדויקת אם יש, ואם לא — הקרובה והמתאימה ביותר
export function resolveCover(
  maps: CoverMaps,
  { name, brand = "", category = "אחר" }: { name: string; brand?: string; category?: string }
) {
  const family = familyKey(name);
  if (family) {
    const image = maps.family.get(family);
    if (image) return image;
  }
  const typed = typePhoto(name);
  if (typed) return typed;
  const byBrand = maps.brand.get(brandKey(brand, category));
  if (byBrand) return byBrand;
  return CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS["אחר"];
}