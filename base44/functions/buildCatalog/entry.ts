import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { CATALOG_CHAINS, catalogChainById, chainCatalogItems, isRealBarcode, photosForCodes, prioritizeForPhotos } from "../../shared/chainCatalog.ts";
import { categoryFromName, displayName } from "../../shared/shufersalPrices.ts";

// ברירת מחדל: שלוש רשתות בכל קריאה, כדי לעמוד במגבלות הזמן של השרת.
const DEFAULT_CHAINS = ["shufersal", "rami_levy", "yohananof"];
// אחרי הזמן הזה מפסיקים לפתוח רשתות חדשות בקריאה הזאת, וממשיכים בקריאה הבאה.
const TIME_BUDGET_MS = 200000;
// כמה מוצרים מתחילת קובץ המחירים נבדוק מול מה שכבר יש לנו.
const MAX_CHUNKS = 30;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // קריאה מתוך המשימה היומית מגיעה בלי משתמש; קריאה ישירה דורשת מנהל.
    try {
      const user = await base44.auth.me();
      if (user && user.role !== "admin") {
        return Response.json({ error: "Admin access required" }, { status: 403 });
      }
    } catch {
      // אין משתמש — המשימה היומית
    }

    const body = await req.json().catch(() => ({}));
    const requested = Array.isArray(body?.chains) && body.chains.length ? body.chains : DEFAULT_CHAINS;
    // כמה מוצרים לסרוק מקובץ המחירים, וכמה מהם לבדוק מול קטלוג התמונות בקריאה הזאת.
    const scan = Math.min(Math.max(Number(body?.scan) || 6000, 200), 30000);
    const perChain = Math.min(Math.max(Number(body?.perChain) || 800, 20), 1200);
    const startedAt = Date.now();
    const report = [];

    // כדי שכל הרשתות ייכנסו בתור ולא תמיד אותן רשתות ראשונות, כל יום מתחילים מרשת אחרת.
    const rotation = Math.floor(Date.now() / 86400000) % requested.length;
    const order = requested.slice(rotation).concat(requested.slice(0, rotation));

    for (const requestedId of order) {
      const chain = catalogChainById(String(requestedId));
      if (!chain) {
        report.push({ chain: String(requestedId), error: "unknown chain" });
        continue;
      }
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        report.push({ chain: chain.id, skipped: "next run" });
        continue;
      }
      try {
        const { items, day } = await chainCatalogItems(chain, scan);

        // ברקוד שכבר בדקנו בעבר (גם אם לא נמצאה לו תמונה) לא נבדק שוב — כך כל הרצה
        // ממשיכה הלאה ומתקדמת למוצרים חדשים.
        const known = new Set<string>();
        const candidates = [];
        for (let i = 0; i < items.length && i < MAX_CHUNKS * 150; i += 150) {
          const slice = items.slice(i, i + 150);
          const codes = slice.map((item) => item.code);
          const stored = await base44.asServiceRole.entities.CatalogProduct.filter({ barcode: { $in: codes } }, "-created_date", 150);
          const seen = await base44.asServiceRole.entities.CatalogImage.filter({ barcode: { $in: codes } }, "-created_date", 150);
          for (const row of stored || []) known.add(row.barcode);
          for (const row of seen || []) known.add(row.barcode);
          for (const item of slice) if (!known.has(item.code)) candidates.push(item);
        }

        const unknown = prioritizeForPhotos(candidates, perChain);
        // בדיקת התמונות האישית מוגבלת, כדי שכל קריאה תסתיים בזמן ותוכל לכסות עוד רשתות.
        const result = await photosForCodes(unknown.map((item) => item.code), 150);
        const images = result.images;
        const checked = result.checked;

        // נשמרים גם הברקודים שנבדקו ולא נמצאה להם תמונה, כדי לא לחזור עליהם.
        if (checked.length) {
          await base44.asServiceRole.entities.CatalogImage.bulkCreate(checked.map((code) => ({ barcode: code, image_url: images.get(code) || "" })));
        }

        // נשמר כל מוצר שיש לו תמונה אמיתית, וגם כל מוצר עם ברקוד אמיתי — כך הקטלוג גדל
        // גם במוצרים שאין להם תמונה בקטלוג העולמי (מותג פרטי, טרי, מעדנייה).
        const rows = unknown.filter((item) => images.has(item.code) || isRealBarcode(item.code)).map((item) => ({
          barcode: item.code,
          name: displayName(item).slice(0, 64),
          brand: item.brand.slice(0, 48),
          category: categoryFromName(item.name),
          price: item.price,
          chain: chain.id,
          chain_name: chain.name,
          image_url: images.get(item.code) || "",
          weighted: item.weighted,
          day
        }));

        let stored = 0;
        for (let i = 0; i < rows.length; i += 500) {
          const created = await base44.asServiceRole.entities.CatalogProduct.bulkCreate(rows.slice(i, i + 500));
          stored += Array.isArray(created) ? created.length : 0;
        }
        report.push({ chain: chain.id, chain_name: chain.name, day, scanned: items.length, candidates: candidates.length, branded: unknown.filter((item) => item.brand).length, checked: checked.length, withPhoto: rows.length, stored });
      } catch (error) {
        report.push({ chain: chain.id, error: error instanceof Error ? error.message : String(error) });
      }
    }

    console.log("catalog build", JSON.stringify(report));
    return Response.json({ ok: true, chains: CATALOG_CHAINS.length, seconds: Math.round((Date.now() - startedAt) / 1000), report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}