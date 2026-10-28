import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { photosFromOpenDatabases } from "../../shared/openCatalog.ts";
import { probeChainPhoto, photoByName, cleanProductName } from "../../shared/productImageSearch.ts";

// מערכת הרקע שמשלימה תמונה לכל מוצר בקטלוג. כל מוצר נבדק פעם אחת מול מקורות התמונה
// לפי הסדר: תמונת הרשת לפי הברקוד (התמונה של המוצר עצמו), המאגרים הפתוחים, ואם אין —
// חיפוש לפי שם המוצר. מוצר שנבדק מסומן ולא נבדק שוב, כך שכל הרצה מתקדמת למוצרים חדשים.
const clamp = (value: any, min: number, max: number) => Math.min(Math.max(Number(value) || 0, min), max);

const rowsOf = (result: any): any[] => (Array.isArray(result) ? result : result?.items || []);

const NUMERIC = "^[0-9]{8,14}$";
const INTERNAL = "^[a-zA-Z_]+-";

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
    const limit = clamp(body?.limit ?? 600, 10, 1200);
    const nameBudget = clamp(body?.nameBudget ?? 20, 0, 60);
    const itemsLimit = clamp(body?.items ?? 40, 0, 200);
    const startedAt = Date.now();

    // ---- 1. מוצרים שעדיין לא נבדקו ואין להם תמונה ----
    const pool = rowsOf(await base44.asServiceRole.entities.CatalogProduct.filter(
      { image_url: "", image_checked: { $ne: true }, barcode: { $regex: NUMERIC } },
      "-created_date",
      Math.min(limit * 2, 1600)
    ));
    const byBarcode = new Map<string, any>();
    for (const row of pool) if (row.barcode && !byBarcode.has(String(row.barcode))) byBarcode.set(String(row.barcode), row);
    const codes = [...byBarcode.keys()].slice(0, limit);

    // ---- 2. מה כבר נבדק בעבר לפי הברקוד ----
    const known = new Map<string, any>();
    for (let i = 0; i < codes.length; i += 200) {
      const slice = codes.slice(i, i + 200);
      const stored = rowsOf(await base44.asServiceRole.entities.CatalogImage.filter({ barcode: { $in: slice } }, "-created_date", 200));
      for (const row of stored) known.set(String(row.barcode), row);
    }
    const chainTargets = codes.filter((code) => !known.get(code)?.chain_checked);

    const images = new Map<string, string>();

    // ---- 3. תמונת הרשת לפי הברקוד ----
    for (let i = 0; i < chainTargets.length; i += 12) {
      const wave = chainTargets.slice(i, i + 12);
      const found = await Promise.all(wave.map((code) => probeChainPhoto(code)));
      wave.forEach((code, index) => { if (found[index]) images.set(code, found[index]); });
    }

    // ---- 4. מי שלא נמצאה לו תמונה — המאגרים הפתוחים לפי הברקוד ----
    const missing = chainTargets.filter((code) => !images.has(code));
    if (missing.length) {
      const open = await photosFromOpenDatabases(missing);
      for (const [code, image] of open) if (image) images.set(code, image);
    }

    // ---- 5. עדיין בלי תמונה — חיפוש לפי שם המוצר ----
    const nameTargets = [
      ...chainTargets.filter((code) => !images.has(code)),
      ...rowsOf(await base44.asServiceRole.entities.CatalogProduct.filter(
        { image_url: "", image_checked: { $ne: true }, barcode: { $regex: INTERNAL } },
        "-created_date",
        nameBudget
      )).map((row) => String(row.barcode))
    ].slice(0, nameBudget);
    for (const code of nameTargets) {
      if (images.has(code)) continue;
      const row = byBarcode.get(code) || rowsOf(await base44.asServiceRole.entities.CatalogProduct.filter({ barcode: code }, "-created_date", 1))[0];
      if (!row) continue;
      const image = await photoByName(cleanProductName(row.name), row.brand || "");
      if (image) images.set(code, image);
    }

    // ---- 6. כל שורות המוצר עם הברקוד הזה מקבלות תמונה, ומסומנות כנבדקות ----
    const checked = [...new Set([...chainTargets, ...nameTargets])];
    let productsUpdated = 0;
    for (let i = 0; i < checked.length; i += 60) {
      const slice = checked.slice(i, i + 60);
      const rows = rowsOf(await base44.asServiceRole.entities.CatalogProduct.filter({ barcode: { $in: slice } }, "-created_date", 300));
      const updates = rows.map((row) => {
        const image = images.get(String(row.barcode)) || "";
        return image && !row.image_url
          ? { id: row.id, image_url: image, image_checked: true }
          : { id: row.id, image_checked: true };
      });
      for (let j = 0; j < updates.length; j += 500) {
        const done = await base44.asServiceRole.entities.CatalogProduct.bulkUpdate(updates.slice(j, j + 500));
        productsUpdated += Array.isArray(done) ? done.length : 0;
      }
    }

    // ---- 7. סימון המקורות שנבדקו לכל ברקוד ----
    const probedChain = new Set(chainTargets);
    const probedName = new Set(nameTargets);
    const now = new Date().toISOString();
    const fresh: any[] = [];
    const changed: any[] = [];
    for (const code of checked) {
      const existing = known.get(code);
      const patch = {
        image_url: images.get(code) || existing?.image_url || "",
        checked_at: now,
        chain_checked: Boolean(existing?.chain_checked) || probedChain.has(code),
        name_checked: Boolean(existing?.name_checked) || probedName.has(code)
      };
      if (existing) changed.push({ id: existing.id, ...patch });
      else fresh.push({ barcode: code, ...patch });
    }
    for (let i = 0; i < fresh.length; i += 500) await base44.asServiceRole.entities.CatalogImage.bulkCreate(fresh.slice(i, i + 500));
    for (let i = 0; i < changed.length; i += 500) await base44.asServiceRole.entities.CatalogImage.bulkUpdate(changed.slice(i, i + 500));

    // ---- 8. גם פריטים ברשימות הקניות עצמן מקבלים תמונה ----
    let itemsUpdated = 0;
    if (itemsLimit) {
      const items = rowsOf(await base44.asServiceRole.entities.ListItem.filter({ image_url: "" }, "-created_date", itemsLimit));
      const wanted = [...new Set(items.map((item) => String(item.barcode || "").trim()).filter(Boolean))];
      const catalogImages = new Map<string, string>();
      for (let i = 0; i < wanted.length; i += 100) {
        const slice = wanted.slice(i, i + 100);
        const rows = rowsOf(await base44.asServiceRole.entities.CatalogProduct.filter({ barcode: { $in: slice }, image_url: { $ne: "" } }, "-created_date", 200));
        for (const row of rows) if (row.image_url) catalogImages.set(String(row.barcode), row.image_url);
      }
      const updates: any[] = [];
      for (const item of items) {
        const code = String(item.barcode || "").trim();
        const image = images.get(code) || catalogImages.get(code) || (/^\d{8,14}$/.test(code) ? await probeChainPhoto(code) : "");
        if (image) updates.push({ id: item.id, image_url: image });
      }
      for (let i = 0; i < updates.length; i += 500) {
        const done = await base44.asServiceRole.entities.ListItem.bulkUpdate(updates.slice(i, i + 500));
        itemsUpdated += Array.isArray(done) ? done.length : 0;
      }
    }

    console.log("product images", { checked: checked.length, found: images.size, productsUpdated, itemsUpdated });
    return Response.json({
      ok: true,
      seconds: Math.round((Date.now() - startedAt) / 1000),
      checked: checked.length,
      found: images.size,
      products_updated: productsUpdated,
      items_updated: itemsUpdated
    });
  } catch (error: any) {
    console.error("fillProductImages", error);
    return Response.json({ error: error instanceof Error ? error.message : "Image fill failed" }, { status: 500 });
  }
}