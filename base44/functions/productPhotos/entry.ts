import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { photosForBarcodes } from "../../shared/productPhotos.ts";

const MAX_CODES = 40;

// תמונות אמיתיות למוצרים לפי הברקוד שלהם, מהמאגרים הפתוחים.
// ברקוד שנבדק פעם אחת לא נבדק שוב, והתמונה שנמצאה נשמרת גם על המוצר בקטלוג שלנו.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error: any) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const codes = (Array.isArray(body?.barcodes) ? body.barcodes : [])
      .map((code: any) => String(code || "").trim())
      .filter(Boolean)
      .slice(0, MAX_CODES);
    if (!codes.length) return Response.json({ photos: {} });

    const images = await photosForBarcodes(base44, codes);
    const photos: Record<string, string> = {};
    for (const [code, image] of images) if (image) photos[code] = image;

    // המוצר עצמו זוכה בתמונה — מהחיפוש הבא היא כבר מגיעה מהמאגר שלנו
    const found = Object.keys(photos);
    if (found.length) {
      try {
        const rows = await base44.asServiceRole.entities.CatalogProduct.filter({ barcode: { $in: found } }, "-created_date", MAX_CODES);
        const list = Array.isArray(rows) ? rows : rows?.items || [];
        const updates = list
          .filter((row: any) => !row.image_url)
          .map((row: any) => ({ id: row.id, image_url: photos[String(row.barcode)] }));
        if (updates.length) await base44.asServiceRole.entities.CatalogProduct.bulkUpdate(updates);
      } catch (error) {
        console.error("catalog photo update skipped", error instanceof Error ? error.message : error);
      }
    }

    console.log("photos resolved", { asked: codes.length, found: found.length });
    return Response.json({ photos });
  } catch (error) {
    console.error("productPhotos", error);
    return Response.json({ error: error instanceof Error ? error.message : "Photo lookup failed" }, { status: 500 });
  }
}