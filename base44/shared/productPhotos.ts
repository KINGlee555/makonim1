// תמונה אמיתית של המוצר לפי הברקוד שלו. הברקוד הוא המזהה המדויק של המוצר, ולכן תמונה
// שנמצאה לפיו היא של המוצר עצמו — לא ניחוש לפי שם.
//
// הדרך לשאול את המאגרים הפתוחים (מזון, טיפוח, מזון לחיות, מוצרי בית) היא שאילתת מוצר
// אחת לברקוד (api/v2/product/<code>) ולא חיפוש — היא מדויקת, מהירה, ולא נופלת כשהחיפוש
// של המאגר עמוס. ברקוד שנבדק פעם אחת נשמר אצלנו, כולל "אין תמונה", ולכן לא נבדק שוב.
import { OPEN_DATABASES } from "./openCatalog.ts";

const IMAGE_FIELDS = "code,image_front_url,image_url";
const MAX_CODES = 12;
const BATCH = 6;
const REQUEST_TIMEOUT = 12000;

const HEADERS = { "User-Agent": "MaKonim/1.0 (barcode photos)", Accept: "application/json" };

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// התמונה שצילם קונה אמיתי, ואם אין — תמונת המוצר עצמו
const realPhoto = (product: any) => String(product?.image_front_url || product?.image_url || "").replace(/^http:/, "https://");

// מאגרים חיצוניים מגבילים בקשות עוקבות — ניסיון חוזר קצר, ואם אין תשובה ממשיכים הלאה
export async function fetchOpenJson(url: string, label: string, timeout = 20000): Promise<any> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { ...HEADERS, "User-Agent": `MaKonim/1.0 (${label})` },
        signal: AbortSignal.timeout(timeout)
      });
      if (response.ok) return await response.json();
      console.error("open database request failed", label, response.status, attempt);
    } catch (error) {
      console.error("open database request error", label, error instanceof Error ? error.message : error);
    }
    if (attempt < 2) await pause(400 * (attempt + 1));
  }
  return null;
}

// הברקוד הזה במאגר אחד: תמונה, והאם התשובה הייתה סופית (כלומר אפשר לזכור שאין תמונה)
async function photoFromDatabase(host: string, code: string) {
  const url = `https://${host}/api/v2/product/${encodeURIComponent(code)}.json?fields=${IMAGE_FIELDS}`;
  try {
    const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    if (!response.ok) return { image: "", definitive: response.status === 404 || response.status === 400 };
    const type = response.headers.get("content-type") || "";
    if (!type.includes("json")) return { image: "", definitive: false };
    const data = await response.json();
    return { image: realPhoto(data?.product), definitive: true };
  } catch {
    // תקלה זמנית במאגר — לא מסמנים את הברקוד כ"בלי תמונה"
    return { image: "", definitive: false };
  }
}

// עוברים מאגר-מאגר עד שנמצאה תמונה של המוצר; רוב המוצרים נמצאים כבר במאגר המזון
async function photoByBarcode(code: string) {
  let definitive = true;
  for (const database of OPEN_DATABASES) {
    const result = await photoFromDatabase(database.host, code);
    if (result.image) return { image: result.image, definitive: true };
    if (!result.definitive) definitive = false;
  }
  return { image: "", definitive };
}

// תמונה אמיתית לכל ברקוד. ברקוד שכבר נשמר אצלנו עם תמונה פשוט מוחזר מהמטמון, וכך גם
// ברקוד שנבדק וקיבל תשובה סופית. ברקוד שנשמר כ"בלי תמונה" לפני שהבדיקה אומתה (בלי
// checked_at) נבדק שוב — כך גם ברקודים שנכשלו בגלל עומס במאגר מקבלים הזדמנות שנייה.
export async function photosForBarcodes(base44: any, codes: string[]): Promise<Map<string, string>> {
  const images = new Map<string, string>();
  const wanted = [...new Set((codes || []).map((code) => String(code || "").trim()).filter(Boolean))].slice(0, MAX_CODES);
  if (!wanted.length) return images;

  const cached = await base44.asServiceRole.entities.CatalogImage.filter({ barcode: { $in: wanted } }, "-created_date", wanted.length);
  const rows = new Map<string, any>();
  for (const row of Array.isArray(cached) ? cached : cached?.items || []) {
    const code = String(row.barcode);
    rows.set(code, row);
    if (row.image_url) images.set(code, row.image_url);
  }

  const fresh = wanted.filter((code) => {
    const row = rows.get(code);
    if (!row) return true;
    return !row.image_url && !row.checked_at;
  });

  const verified: { code: string; image: string }[] = [];
  for (let i = 0; i < fresh.length; i += BATCH) {
    const batch = fresh.slice(i, i + BATCH);
    const settled = await Promise.allSettled(batch.map(async (code) => ({ code, ...(await photoByBarcode(code)) })));
    for (const entry of settled) {
      if (entry.status !== "fulfilled" || !entry.value.definitive) continue;
      if (entry.value.image) images.set(entry.value.code, entry.value.image);
      verified.push({ code: entry.value.code, image: entry.value.image });
    }
    await pause(200);
  }

  if (verified.length) {
    const stamp = new Date().toISOString();
    const creates: any[] = [];
    const patches: any[] = [];
    for (const { code, image } of verified) {
      const row = rows.get(code);
      if (row) patches.push({ id: row.id, image_url: image, checked_at: stamp });
      else creates.push({ barcode: code, image_url: image, checked_at: stamp });
    }
    // שתי בדיקות יכולות להגיע לאותו ברקוד במקביל — הכפילות נדחית וזה בסדר
    try {
      if (creates.length) await base44.asServiceRole.entities.CatalogImage.bulkCreate(creates);
    } catch (error) {
      console.error("catalog image store skipped", error instanceof Error ? error.message : error);
    }
    try {
      if (patches.length) await base44.asServiceRole.entities.CatalogImage.bulkUpdate(patches);
    } catch (error) {
      console.error("catalog image refresh skipped", error instanceof Error ? error.message : error);
    }
  }
  return images;
}