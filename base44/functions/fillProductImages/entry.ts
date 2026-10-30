import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { photosFromOpenDatabases } from "../../shared/openCatalog.ts";
import { probeChainPhoto, cleanProductName } from "../../shared/productImageSearch.ts";
import { typePhoto } from "../../shared/typePhotos.ts";

// מילוי תמונות אמיתיות בקטלוג. כל מוצר נבדק פעם אחת:
// 1. מוצר עם ברקוד — התמונה של הברקוד עצמו. גם ברקוד פנימי של רשת מכיל את הברקוד
//    הלאומי, ולכן מחלצים אותו ומשתמשים בו.
// 2. מוצר בלי ברקוד (ירקות, מעדנייה, קצביה) — התמונה האמיתית של אותו מוצר לפי שמו.
// בדיקת המאגרים הפתוחים (איטית) רצה רק כשמבקשים אותה במפורש; מילוי התמונות השוטף
// נשען על תמונת הרשת לפי הברקוד שהיא המהירה והמדויקת.
const clamp = (value: any, min: number, max: number) => Math.min(Math.max(Number(value) || 0, min), max);

const rowsOf = (result: any): any[] => (Array.isArray(result) ? result : result?.items || []);

// הברקוד הלאומי שבתוך הברקוד — "shufersal-7290000066318" → "7290000066318"
export const nationalCode = (barcode: any) => {
  const digits = String(barcode || "").replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(-14) : "";
};

const CONCURRENCY = 60;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    // קריאה מהמשימה המתוזמנת מגיעה בלי משתמש; קריאה ידנית דורשת מנהל
    try {
      const user = await base44.auth.me();
      if (user && user.role !== "admin") return Response.json({ error: "Admin access required" }, { status: 403 });
    } catch {
      // אין משתמש — הרצה מתוזמנת
    }

    const body = await req.json().catch(() => ({}));
    const limit = clamp(body?.limit ?? 2000, 10, 12000);
    const itemsLimit = clamp(body?.items ?? 40, 0, 200);
    const seconds = clamp(body?.seconds ?? 45, 5, 240);
    const useOpen = body?.useOpen === true;
    const startedAt = Date.now();
    const budgetLeft = () => Date.now() - startedAt < seconds * 1000;

    // מוצרים שכבר סומנו כנבדקים לא נבדקים שוב — כל הרצה ממשיכה למוצרים חדשים
    // כל מוצר מקבל תמונה כבר בבנייה; כאן מדייקים אותה לתמונה של הברקוד עצמו,
    // ולכן נבדקים כל המוצרים שעוד לא נבדקו מול הברקוד — גם אם יש להם תמונה חלופית.
    const pool = rowsOf(await base44.asServiceRole.entities.CatalogProduct.filter(
      { image_checked: { $ne: true } },
      "-created_date",
      limit
    ));

    const images = new Map<string, string>();   // ברקוד מלא → תמונה
    const withCode = pool.filter((row) => nationalCode(row.barcode));
    const withoutCode = pool.filter((row) => !nationalCode(row.barcode));

    // ---- 1. מוצרים בלי ברקוד לאומי — תמונת המוצר עצמו לפי שמו ----
    for (const row of withoutCode) {
      const image = typePhoto(cleanProductName(row.name));
      if (image) images.set(String(row.barcode), image);
    }

    // ---- 2. לפי הברקוד הלאומי: תמונת הרשת של אותו מוצר ----
    const byCode = new Map<string, string[]>();
    for (const row of withCode) {
      const code = nationalCode(row.barcode);
      byCode.set(code, [...(byCode.get(code) || []), String(row.barcode)]);
    }
    const codes = [...byCode.keys()];

    // מה שכבר נמצא בעבר נשמר ב-CatalogImage — לא שואלים שוב
    const cached = new Map<string, string>();
    for (let i = 0; i < codes.length; i += 200) {
      const slice = codes.slice(i, i + 200);
      const stored = rowsOf(await base44.asServiceRole.entities.CatalogImage.filter({ barcode: { $in: slice } }, "-created_date", 200));
      for (const row of stored) if (row.image_url) cached.set(String(row.barcode), row.image_url);
    }
    for (const [code, barcodes] of byCode) {
      const image = cached.get(code);
      if (image) for (const barcode of barcodes) images.set(barcode, image);
    }

    const pendingCodes = codes.filter((code) => !cached.has(code));
    const chainFound = new Map<string, string>();
    for (let i = 0; i < pendingCodes.length; i += CONCURRENCY) {
      if (!budgetLeft()) break;
      const wave = pendingCodes.slice(i, i + CONCURRENCY);
      const found = await Promise.all(wave.map((code) => probeChainPhoto(code).catch(() => "")));
      wave.forEach((code, index) => { if (found[index]) chainFound.set(code, found[index]); });
    }

    // מאגרים פתוחים — רק לפי בקשה מפורשת, שאילתה אחת לכל 40 ברקודים
    const openFound = useOpen && budgetLeft()
      ? await photosFromOpenDatabases(pendingCodes.filter((code) => !chainFound.has(code)).slice(0, 400))
      : new Map<string, string>();

    for (const [code, barcodes] of byCode) {
      const image = chainFound.get(code) || openFound.get(code);
      if (image) for (const barcode of barcodes) images.set(barcode, image);
    }

    // ---- 3. שומרים תמונות ומסמנים כל מוצר שנבדק, כדי שההרצה הבאה תמשיך הלאה ----
    const updates = pool.map((row) => {
      const barcode = String(row.barcode);
      const image = images.get(barcode) || "";
      return image ? { id: row.id, image_url: image, image_checked: true } : { id: row.id, image_checked: true };
    });
    for (let i = 0; i < updates.length; i += 500) {
      await base44.asServiceRole.entities.CatalogProduct.bulkUpdate(updates.slice(i, i + 500));
    }

    // מטמון תמונות לפי ברקוד — כדי שחיפוש לא יבדוק שוב את אותו מוצר
    const fresh: any[] = [];
    const seen = new Set<string>();
    for (const [code, image] of chainFound) {
      if (seen.has(code)) continue;
      seen.add(code);
      fresh.push({ barcode: code, image_url: image });
    }
    for (let i = 0; i < fresh.length; i += 500) {
      try {
        await base44.asServiceRole.entities.CatalogImage.bulkCreate(fresh.slice(i, i + 500));
      } catch {
        // הברקוד כבר קיים במטמון
      }
    }

    // ---- 4. גם פריטים ברשימות הקניות מקבלים תמונה אמיתית ----
    let itemsUpdated = 0;
    if (itemsLimit) {
      const items = rowsOf(await base44.asServiceRole.entities.ListItem.filter({ image_url: "" }, "-created_date", itemsLimit));
      const patches: any[] = [];
      for (const item of items) {
        const code = nationalCode(item.barcode);
        const image = images.get(String(item.barcode))
          || (code ? chainFound.get(code) || openFound.get(code) || cached.get(code) : "")
          || typePhoto(cleanProductName(item.name));
        if (image) patches.push({ id: item.id, image_url: image });
      }
      for (let i = 0; i < patches.length; i += 500) {
        const done = await base44.asServiceRole.entities.ListItem.bulkUpdate(patches.slice(i, i + 500));
        itemsUpdated += Array.isArray(done) ? done.length : 0;
      }
    }

    const report = {
      ok: true,
      seconds: Math.round((Date.now() - startedAt) / 1000),
      scanned: pool.length,
      found: images.size,
      items_updated: itemsUpdated
    };
    console.log("product images", JSON.stringify(report));
    return Response.json(report);
  } catch (error: any) {
    console.error("fillProductImages", error);
    return Response.json({ error: error instanceof Error ? error.message : "Image fill failed" }, { status: 500 });
  }
}