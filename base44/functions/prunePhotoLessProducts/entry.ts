import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

// ניקוי הקטלוג: נשאר רק מוצר שיש לו תמונה אמיתית של עצמו. מוצר בלי תמונה לא מוצג
// למשתמשים ולכן גם לא נשאר במסד — כך אין "מוצר בלי תמונה" בכלל.
// הרצה חוזרת ונשנית עד שהקטלוג נקי, ובכל קריאה ממשיכים מאותה נקודה.
const rowsOf = (result: any): any[] => (Array.isArray(result) ? result : result?.items || []);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    try {
      const user = await base44.auth.me();
      if (user && user.role !== "admin") return Response.json({ error: "Admin access required" }, { status: 403 });
    } catch {
      // הרצה מתוזמנת
    }

    const body = await req.json().catch(() => ({}));
    const batch = Math.min(Math.max(Number(body?.batch) || 2000, 10), 5000);
    const seconds = Math.min(Math.max(Number(body?.seconds) || 50, 5), 240);
    const dryRun = body?.dryRun === true;
    const startedAt = Date.now();

    let deleted = 0;
    while (Date.now() - startedAt < seconds * 1000) {
      const rows = rowsOf(await base44.asServiceRole.entities.CatalogProduct.filter({ image_url: "" }, "created_date", batch));
      if (!rows.length) break;
      const ids = rows.map((row) => row.id);
      if (dryRun) {
        deleted += ids.length;
        break;
      }
      await base44.asServiceRole.entities.CatalogProduct.deleteMany({ id: { $in: ids } });
      deleted += ids.length;
      if (rows.length < batch) break;
    }

    const remaining = await base44.asServiceRole.entities.CatalogProduct.count({ image_url: "" });
    const total = await base44.asServiceRole.entities.CatalogProduct.count({});
    console.log("prune catalog", { deleted, remaining, total, dryRun });
    return Response.json({ ok: true, deleted, remaining, total, dryRun, seconds: Math.round((Date.now() - startedAt) / 1000) });
  } catch (error: any) {
    console.error("prunePhotoLessProducts", error);
    return Response.json({ error: error instanceof Error ? error.message : "Prune failed" }, { status: 500 });
  }
}