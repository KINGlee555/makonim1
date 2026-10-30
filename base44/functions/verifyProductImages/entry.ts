import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

// סוכן התמונות של הקטלוג — רץ כל בוקר.
// בכל הרצה הוא לוקח חבורת מוצרים שעדיין לא נבדקו, מבקש תמונה אמיתית של המוצר עצמו
// (בקבוק ג׳ין מקבל בקבוק ג׳ין), מוודא שהתמונה באמת נטענת, ומעדכן אותה על המוצר.
// מוצר שנבדק מסומן image_checked, כדי שהרצה הבאה תמשיך הלאה ולא תחזור לאותו מוצר.

const MODEL = "gemini_3_flash";
const BATCH = 4;
const TIME_BUDGET_MS = 200000;

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          barcode: { type: "string" },
          image_url: { type: "string" }
        },
        required: ["barcode", "image_url"]
      }
    }
  },
  required: ["items"]
};

function buildPrompt(products: any[]) {
  const list = products
    .map((product) => `barcode: ${product.barcode} | name: ${product.name} | brand: ${product.brand || "-"} | category: ${product.category || "-"}`)
    .join("\n");
  return `You are checking product photos for an Israeli supermarket shopping app.

For EACH product below, find ONE real photo of THAT exact product:
${list}

Rules:
- Return a direct https image file URL (ends with .jpg, .jpeg, .png or .webp) that loads on its own.
- Prefer the Israeli retailer or the brand's own site (for example Shufersal, Rami Levy,Carrefour, the importer, the manufacturer).
- The photo must show the actual product in its actual packaging. A bottle of gin must be a bottle of gin of that brand, not a bottle of vodka and not an illustration of a bottle.
- Never return a category picture, an icon, a logo, a placeholer service (placehold, dummyimage) or a stock photo of a generic product.
- Never return an image of a person or of an animal.
- If you are not confident, return an empty string for that barcode. An empty answer is better than a wrong photo.

Answer only with the products list, same barcodes.`;
}

async function imageLoads(url: string) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "MaKonim/1.0 (+https://makonim-share-shop.base44.app)" },
      signal: AbortSignal.timeout(12000)
    });
    const type = String(response.headers.get("content-type") || "").toLowerCase();
    const ok = response.ok && type.startsWith("image/");
    response.body?.cancel().catch(() => {});
    return ok;
  } catch {
    return false;
  }
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // המשימה היומית קוראת לפונקציה הזאת, ולכן רק מנהל (או הריצה המתוזמנת) מורשה.
    const user = await base44.auth.me().catch((error: any) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Admin access required" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit) || 24, 1), 120);
    const categories = Array.isArray(body?.categories)
      ? body.categories.filter((value: any) => typeof value === "string" && value.trim()).slice(0, 4)
      : [];
    const startedAt = Date.now();

    // מוצרים שעדיין לא נבדקו. כשמבקשים מחלקה מסוימת (אלכוהול, סיגריות) — רק היא.
    const query: any = { image_checked: { $ne: true } };
    if (categories.length) query.category = { $in: categories };
    const page = await base44.asServiceRole.entities.CatalogProduct.filter(query, "created_date", limit);
    const products: any[] = (Array.isArray(page) ? page : page?.items || []).filter((row: any) => row?.barcode && row?.name);

    if (!products.length) {
      return Response.json({ ok: true, checked: 0, updated: 0, missing: 0, note: "nothing left to check" });
    }

    // מה הסוכן מצא — לפי ברקוד
    const found = new Map<string, string>();
    for (let i = 0; i < products.length; i += BATCH) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) break;
      const slice = products.slice(i, i + BATCH);
      try {
        const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: MODEL,
          add_context_from_internet: true,
          prompt: buildPrompt(slice),
          response_json_schema: SCHEMA
        });
        for (const row of answer?.items || []) {
          const code = String(row?.barcode || "").trim();
          const url = String(row?.image_url || "").trim();
          if (code && /^https:\/\//i.test(url)) found.set(code, url);
        }
      } catch (error: any) {
        console.error("image lookup failed", error?.message);
      }
    }

    // רק תמונה שנטענת בפועל נשמרת על המוצר
    const verified = new Map<string, string>();
    for (const [code, url] of found) {
      if (await imageLoads(url)) verified.set(code, url);
    }

    // כל מוצר שנבדק מסומן ככזה, גם אם לא נמצאה לו תמונה — כך ההרצה הבאה מתקדמת
    // למוצרים חדשים, ואין לולאה על אותם מוצרים בכל בוקר.
    const rows = products.map((product: any) => {
      const image = verified.get(String(product.barcode));
      return image
        ? { id: product.id, image_url: image, image_checked: true }
        : { id: product.id, image_checked: true };
    });

    let updated = 0;
    for (let i = 0; i < rows.length; i += 100) {
      const done = await base44.asServiceRole.entities.CatalogProduct.bulkUpdate(rows.slice(i, i + 100));
      updated += Array.isArray(done) ? done.length : 0;
    }

    const report = {
      ok: true,
      categories,
      checked: products.length,
      updated,
      found: verified.size,
      seconds: Math.round((Date.now() - startedAt) / 1000)
    };
    console.log("catalog image agent", JSON.stringify(report));
    return Response.json(report);
  } catch (error: any) {
    return Response.json({ error: error?.message || "Image check failed" }, { status: 500 });
  }
}