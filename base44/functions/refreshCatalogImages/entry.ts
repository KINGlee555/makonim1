import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { categoryFromName } from "../../shared/shufersalPrices.ts";
import { typePhoto } from "../../shared/typePhotos.ts";
import { categoryPhoto } from "../../shared/productCovers.ts";

// שיפור התמונות בקטלוג: מוצר שמקבל כרגע את התמונה הכללית של המחלקה מקבל תמונה של
// סוג המוצר עצמו (חלב, לחם, עגבנייה, אבקת כביסה), וגם המחלקה שלו מתוקנת — כך החיפוש
// מציג תמונות שמתאימות למוצר ולא תמונה אחת לכל הקטלוג.
//
// כל סבב מרים את הקבוצה הראשונה של מוצרים עם תמונה כללית ומעדכן אותה; מוצרים
// שהתמונה שלהם כבר הטובה ביותר לא נשארים בקבוצה, כך שכל סבב מתקדם באמת.
const GENERIC: string[] = [
  categoryPhoto("מוצרי חלב"),
  categoryPhoto("חטיפים ומתוקים"),
  categoryPhoto("משקאות"),
  categoryPhoto("בשר ודגים"),
  categoryPhoto("לחם ומאפים"),
  categoryPhoto("קפואים"),
  categoryPhoto("פירות וירקות"),
  categoryPhoto("ניקיון"),
  categoryPhoto("היגיינה"),
  categoryPhoto("תבלינים"),
  categoryPhoto("חיות מחמד"),
  categoryPhoto("שימורים"),
  categoryPhoto("אחר")
];

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
    const batch = Math.min(Math.max(Number(body?.batch) || 400, 20), 500);
    const seconds = Math.min(Math.max(Number(body?.seconds) || 50, 5), 240);
    const startedAt = Date.now();
    // ממשיכים מאותו מקום בקריאה הבאה — כל קריאה מעמיקה בקטלוג
    let before = typeof body?.before === "string" && body.before ? body.before : "";

    let updated = 0;
    let scanned = 0;
    let rounds = 0;

    while (Date.now() - startedAt < seconds * 1000) {
      const query: any = { image_url: { $in: GENERIC } };
      if (before) query.created_date = { $lt: before };
      const rows = await base44.asServiceRole.entities.CatalogProduct.filter(query, "-created_date", batch);
      if (!rows?.length) {
        before = "";
        break;
      }
      scanned += rows.length;
      rounds += 1;
      before = rows[rows.length - 1].created_date || "";

      const patch = [];
      for (const row of rows) {
        const category = categoryFromName(row.name);
        const image = typePhoto(row.name) || categoryPhoto(category);
        if (image === row.image_url && category === row.category) continue;
        patch.push({ id: row.id, category, image_url: image });
      }
      if (patch.length) {
        for (let i = 0; i < patch.length; i += 200) {
          await base44.asServiceRole.entities.CatalogProduct.bulkUpdate(patch.slice(i, i + 200));
          // קצב עדין — השרת מגביל עדכוני מדף מרוכזים, וככה לא נופלים על המגבלה
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        updated += patch.length;
      }
    }

    console.log("refresh catalog images", { scanned, updated, rounds, before });
    return Response.json({ ok: true, scanned, updated, rounds, nextBefore: before || null, seconds: Math.round((Date.now() - startedAt) / 1000) });
  } catch (error: any) {
    console.error("refreshCatalogImages", error);
    return Response.json({ error: error instanceof Error ? error.message : "Refresh failed" }, { status: 500 });
  }
}