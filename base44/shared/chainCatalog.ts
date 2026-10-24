// הקטלוג האמיתי של מוצרי הסופר בישראל.
//
// כל רשת חייבת לפרסם קובץ מחירים יומי (חוק שקיפות המחירים). אנחנו קוראים את הקובץ
// בזרימה, מוציאים ממנו מוצרים אמיתיים עם ברקוד, ומשאירים בקטלוג רק את אלה שיש להם
// תמונה אמיתית של אותו ברקוד. כך נבנה קטלוג של אלפי מוצרים — ובזמן חיפוש באפליקציה
// אין שום קריאה החוצה, הכל כבר שמור.

import { CHAINS, chainDataFile, type Chain } from "./priceTransparency.ts";

// כל הרשתות הגדולות בישראל. הראשונות מפרסמות גם קבצי מבצעים; הנוספות מפרסמות
// קובץ מחירים בפורטל השקיפות, ומהן אנחנו לוקחים מוצרים לקטלוג.
export const CATALOG_CHAINS: Chain[] = [
  ...CHAINS,
  { id: "machsanei_hashuk", name: "מחסני השוק", source: "cerberus", user: "MachsaneiHashuk" },
  { id: "victory", name: "ויקטורי", source: "cerberus", user: "Victory" },
  { id: "hazi_hinam", name: "חצי חינם", source: "cerberus", user: "HaziHinam" },
  { id: "super_yuda", name: "סופר יודה", source: "cerberus", user: "SuperYuda" },
  { id: "yeinot_bitan", name: "יינות ביתן", source: "cerberus", user: "YeinotBitan" }
];

export function catalogChainById(id: string) {
  return CATALOG_CHAINS.find((chain) => chain.id === id) || null;
}

// ברקוד אמיתי (EAN-13 / UPC-A עם ספרת ביקורת) כמעט תמיד קיים בקטלוג התמונות העולמי,
// בעוד הקוד הפנימי של הרשת כמעט אף פעם לא. בודקים קודם את אלה — כך כל בדיקה מניבה יותר.
export function isRealBarcode(code: string) {
  const digits = code.length === 12 ? `0${code}` : code;
  if (!/^\d{13}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (i % 2 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === Number(digits[12]);
}

// מוצר ממותג עם ברקוד אמיתי הוא הסיכוי הגבוה ביותר לתמונה אמיתית; ירקות טריים
// ובשר בתפזורת כמעט שאף פעם לא נמצאים בקטלוג העולמי.
export function prioritizeForPhotos(items: CatalogItem[], keep: number) {
  const rank = (item: CatalogItem) => (isRealBarcode(item.code) ? 0 : 2) + (item.brand ? 0 : 1);
  const sorted = items.slice().sort((a, b) => rank(a) - rank(b) || a.name.length - b.name.length);
  return sorted.slice(0, keep);
}

const tag = (block: string, name: string) => (block.match(new RegExp(`<${name}>([^<]*)</${name}>`)) || [])[1]?.trim() || "";

// שורות שהן לא מוצר אמיתי לקונה: תוויות, שלטים, פריטי בדיקה וציוד חנות.
const NOT_A_PRODUCT = /(לבדיקה|לא למכירה|לא למכירה לצרכן|תווית|שלט|מדבקה|עמדה|פלייר|אביזר|מוצר לא|שקית אריזה|קופה רושמת|מדף)/;

export type CatalogItem = {
  code: string;
  name: string;
  brand: string;
  price: number;
  quantity: string;
  unit: string;
  weighted: boolean;
};

function isRealProduct(name: string) {
  if (NOT_A_PRODUCT.test(name)) return false;
  return name.replace(/[^A-Za-z\u0590-\u05FF]/g, "").length >= 3;
}

// קריאה בזרימה של קובץ המחירים היומי: כל עוד לא מצאנו מספיק מוצרים אנחנו ממשיכים
// לקרוא, וברגע שיש מספיק — מפסיקים. הקובץ עצמו (עשרות MB) אף פעם לא נשמר בזיכרון.
export async function chainCatalogItems(chain: Chain, limit: number) {
  const file = await chainDataFile(chain, "price");
  const response = await fetch(file.url, { headers: file.headers, signal: AbortSignal.timeout(120000) });
  if (!response.ok || !response.body) throw new Error(`${chain.id}: price file ${response.status}`);

  const items: CatalogItem[] = [];
  const seen = new Set<string>();

  const collect = (block: string) => {
    const start = block.lastIndexOf("<Item>");
    const body = start === -1 ? block : block.slice(start + 6);
    const code = tag(body, "ItemCode");
    if (!code || code.length < 6 || seen.has(code)) return;
    const name = tag(body, "ItemName");
    const price = Number(tag(body, "ItemPrice"));
    if (!name || !(price > 0) || !isRealProduct(name)) return;
    seen.add(code);
    items.push({
      code, name, price,
      brand: tag(body, "ManufacturerName").replace(/^לא ידוע$/, ""),
      quantity: tag(body, "Quantity"),
      unit: tag(body, "UnitQty"),
      weighted: tag(body, "bIsWeighted") === "1"
    });
  };

  const reader = response.body.pipeThrough(new DecompressionStream("gzip")).getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let enough = false;
  while (!enough) {
    const chunk = await reader.read();
    if (chunk.done) {
      if (buffer) collect(buffer);
      break;
    }
    buffer += decoder.decode(chunk.value, { stream: true });
    let end = buffer.indexOf("</Item>");
    while (end !== -1) {
      collect(buffer.slice(0, end));
      buffer = buffer.slice(end + 7);
      end = buffer.indexOf("</Item>");
      if (items.length >= limit) { enough = true; break; }
    }
  }
  reader.cancel().catch(() => {});
  return { items, day: file.day };
}

// תמונה אמיתית לכל ברקוד. קודם שואלים את הקטלוג בקבוצות של 40 מוצרים (מהיר), ואם
// הקטלוג לא עונה — עוברים לשאילתה מוצר-מוצר בקצב עדין. מחזירים גם את הברקודים
// שנבדקו, כדי שלא נחזור עליהם בהמשך.
const PHOTO_HEADERS = {
  "User-Agent": "MaKonim/1.0 (+https://makonim-share-shop.base44.app)",
  Accept: "application/json"
};

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchPhotos(batch: string[], images: Map<string, string>) {
  const params = new URLSearchParams({ code: batch.join(","), fields: "code,image_front_url,image_url", page_size: "40" });
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, {
      headers: PHOTO_HEADERS, signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) return false;
    const type = response.headers.get("content-type") || "";
    if (!type.includes("json")) return false;
    const data = await response.json();
    for (const product of data.products || []) {
      const image = String(product.image_front_url || product.image_url || "").replace(/^http:/, "https://");
      if (image) images.set(String(product.code), image);
    }
    return true;
  } catch {
    return false;
  }
}

async function searchOnePhoto(code: string, images: Map<string, string>) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json?fields=code,image_front_url,image_url`, {
      headers: PHOTO_HEADERS, signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return;
    const data = await response.json();
    const image = String(data?.product?.image_front_url || data?.product?.image_url || "").replace(/^http:/, "https://");
    if (data?.status === 1 && image) images.set(code, image);
  } catch {
    // ברקוד בודד שלא ענה — פשוט לא נשמרה לו תמונה
  }
}

export async function photosForCodes(codes: string[], maxSingle = 450) {
  const images = new Map<string, string>();
  const checked: string[] = [];
  const pendingCodes: string[] = [];
  const known = new Set<string>();
  for (const code of codes) {
    if (!code || known.has(code)) continue;
    known.add(code);
    pendingCodes.push(code);
  }

  const batches: string[][] = [];
  for (let i = 0; i < pendingCodes.length; i += 40) {
    batches.push(pendingCodes.slice(i, i + 40));
  }

  // סיבוב ראשון: שאילתות קבוצתיות של 40 מוצרים — מהיר, אבל לא כל הברקודים חוזרים.
  let failures = 0;
  for (const batch of batches) {
    const ok = await searchPhotos(batch, images);
    failures = ok ? 0 : failures + 1;
    if (failures >= 2) break;
    await pause(250);
  }

  // סיבוב שני: כל ברקוד שלא נמצאה לו תמונה נשאל בנפרד. זה מה שמעלה את כיסוי
  // התמונות באמת, ולכן מוגבל בכמות מוצרים לכל קריאה.
  const left = pendingCodes.filter((code) => !images.has(code)).slice(0, maxSingle);
  for (let i = 0; i < left.length; i += 6) {
    const wave = left.slice(i, i + 6);
    await Promise.allSettled(wave.map((code) => searchOnePhoto(code, images)));
    for (const code of wave) checked.push(code);
    await pause(2000);
  }

  // ברקוד עם תמונה תמיד נחשב בדוק; ברקודים שנשארו בלי תמונה ייבדקו שוב בהמשך.
  for (const code of pendingCodes) {
    if (images.has(code) && !checked.includes(code)) checked.push(code);
  }

  return { images, checked };
}