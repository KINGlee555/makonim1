import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { CATALOG_CHAINS, catalogChainById, chainCatalogItems, isRealBarcode, photosForCodes, prioritizeForPhotos } from "../../shared/chainCatalog.ts";
import { OPEN_SOURCES, openCountryProducts, photosFromOpenDatabases } from "../../shared/openCatalog.ts";
import { categoryFromName, displayName } from "../../shared/shufersalPrices.ts";

// ברירת מחדל: שלוש רשתות בכל קריאה, כדי לעמוד במגבלות הזמן של השרת.
const DEFAULT_CHAINS = ["shufersal", "rami_levy", "yohananof"];
// אחרי הזמן הזה מפסיקים לפתוח רשתות חדשות בקריאה הזאת, וממשיכים בקריאה הבאה.
const TIME_BUDGET_MS = 200000;
// כמה מוצרים מתחילת קובץ המחירים נבדוק מול מה שכבר יש לנו.
const MAX_CHUNKS = 50;

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
    const perChain = Math.min(Math.max(Number(body?.perChain) || 800, 20), 2500);
    const startedAt = Date.now();
    const report = [];

    // כדי שכל הרשתות ייכנסו בתור ולא תמיד אותן רשתות ראשונות, כל יום מתחילים מרשת אחרת.
    const rotation = Math.floor(Date.now() / 86400000) % requested.length;
    const order = requested.slice(rotation).concat(requested.slice(0, rotation));
    // קריאה שמטפלת רק במאגרים הפתוחים (הרצה יומית אחת) לא סורקת קבצי מחירים.
    const openOnly = body?.openOnly === true;

    for (const requestedId of openOnly ? [] : order) {
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
        const result = await photosForCodes(unknown.map((item) => item.code), 110);
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

    // ---- המאגרים הפתוחים: תמונות אמיתיות למוצרים שלנו ומוצרים חדשים עם תמונה ----
    const open = { photosChecked: 0, photosFilled: 0, imported: 0, sources: {} as Record<string, number>, perSource: {} as Record<string, number> };
    if (body?.open === true && Date.now() - startedAt < TIME_BUDGET_MS) {
      // 1. מוצרים קיימים בלי תמונה מקבלים תמונה אמיתית לפי הברקוד שלהם. מתחילים
      // מהמוצרים החדשים ביותר, ומדלגים על ברקודים שכבר נבדקו (גם אם לא נמצאה תמונה) —
      // כך כל הרצה מתקדמת למוצרים חדשים ולא חוזרת על אותה בדיקה.
      const backfill = Math.min(Math.max(Number(body?.backfill) || 200, 0), 1200);
      if (backfill) {
        const pool = Math.min(backfill * 3, 900);
        const rows = await base44.asServiceRole.entities.CatalogProduct.filter({ image_url: "" }, "-created_date", pool);
        const fresh = [];
        for (let i = 0; i < (rows || []).length && fresh.length < backfill; i += 150) {
          const slice = (rows || []).slice(i, i + 150);
          const seen = await base44.asServiceRole.entities.CatalogImage.filter({ barcode: { $in: slice.map((row) => row.barcode) } }, "-created_date", 150);
          const known = new Set((seen || []).map((row) => row.barcode));
          for (const row of slice) {
            if (fresh.length >= backfill) break;
            if (row.barcode && !known.has(row.barcode)) fresh.push(row);
          }
        }
        open.photosChecked = fresh.length;
        if (fresh.length) {
          const images = await photosFromOpenDatabases(fresh.map((row) => row.barcode));
          const codes = fresh.map((row) => row.barcode);
          const found = fresh.filter((row) => images.has(row.barcode))
            .map((row) => ({ id: row.id, barcode: row.barcode, image_url: images.get(row.barcode) as string }));
          // נשמרים גם הברקודים שנבדקו ולא נמצאה להם תמונה, כדי לא לחזור עליהם.
          await base44.asServiceRole.entities.CatalogImage.bulkCreate(codes.map((code) => ({ barcode: code, image_url: images.get(code) || "" })));
          for (let i = 0; i < found.length; i += 500) {
            const done = await base44.asServiceRole.entities.CatalogProduct.bulkUpdate(found.slice(i, i + 500).map((row) => ({ id: row.id, image_url: row.image_url })));
            open.photosFilled += Array.isArray(done) ? done.length : Math.min(500, found.length - i);
          }
        }
      }

      // 2. מוצרים חדשים עם תמונה אמיתית מהמאגרים הפתוחים — רק כאלה שעוד אין לנו.
      const want = Math.min(Math.max(Number(body?.importLimit) || 400, 0), 2000);
      if (want) {
        // כל הרצה ממשיכה מהדף שאליו הגענו במאגר (נשמר ב-OpenCatalogSync) — ולכן
        // הקטלוג ממשיך לגדול בכל הרצה יומית ולא חוזר על אותם מוצרים.
        const syncRows = await base44.asServiceRole.entities.OpenCatalogSync.filter({ source: { $in: OPEN_SOURCES } }, "-created_date", OPEN_SOURCES.length);
        const syncBySource = new Map<string, any>((syncRows || []).map((row: any) => [row.source, row]));
        const pageBySource: Record<string, number> = {};
        for (const source of OPEN_SOURCES) pageBySource[source] = Math.max(1, Number(syncBySource.get(source)?.next_page) || 1);
        const candidates = await openCountryProducts({ pages: 2, pageBySource });
        const fresh: typeof candidates = [];
        for (let i = 0; i < candidates.length; i += 100) {
          const slice = candidates.slice(i, i + 100);
          const stored = await base44.asServiceRole.entities.CatalogProduct.filter({ barcode: { $in: slice.map((item) => item.code) } }, "-created_date", 100);
          const known = new Set((stored || []).map((row) => row.barcode));
          for (const item of slice) if (!known.has(item.code)) fresh.push(item);
        }
        const rows = fresh.slice(0, want).map((item) => ({
          barcode: item.code, name: item.name.slice(0, 64), brand: item.brand.slice(0, 48),
          category: categoryFromName(item.name), price: 0, chain: item.source,
          chain_name: item.source_name, image_url: item.image, weighted: false, day: new Date().toISOString().slice(0, 10)
        }));
        for (let i = 0; i < rows.length; i += 500) {
          const created = await base44.asServiceRole.entities.CatalogProduct.bulkCreate(rows.slice(i, i + 500));
          const stored = Array.isArray(created) ? created : [];
          open.imported += stored.length;
          for (const row of stored) {
            open.sources[row.chain_name] = (open.sources[row.chain_name] || 0) + 1;
            open.perSource[row.chain] = (open.perSource[row.chain] || 0) + 1;
          }
        }

        // כל מאגר מתקדם בשני דפים ליום, ולכן ההרצה הבאה מביאה מוצרים חדשים.
        for (const source of OPEN_SOURCES) {
          const row = syncBySource.get(source);
          const data = {
            next_page: (pageBySource[source] || 1) + 2,
            imported: (Number(row?.imported) || 0) + (open.perSource[source] || 0),
            last_run: new Date().toISOString()
          };
          if (row) await base44.asServiceRole.entities.OpenCatalogSync.update(row.id, data);
          else await base44.asServiceRole.entities.OpenCatalogSync.create({ source, ...data });
        }
      }
    }
    report.push({ open_catalog: open });
    console.log("catalog build", JSON.stringify(report));
    return Response.json({ ok: true, chains: CATALOG_CHAINS.length, seconds: Math.round((Date.now() - startedAt) / 1000), report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}