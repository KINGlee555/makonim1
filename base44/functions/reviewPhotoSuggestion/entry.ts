import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

// אישור או דחייה של הצעת תמונה — רק מנהל האפליקציה.
// אישור מעדכן את התמונה בכל הרשימות, בקטלוג ובמאגר המוצרים, כך שכל המשתמשים רואים אותה.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const id = String(body?.id || "");
    const action = body?.action === "approve" ? "approve" : "reject";
    const note = String(body?.note || "").slice(0, 160);
    if (!id) return Response.json({ error: "Missing suggestion id" }, { status: 400 });

    const suggestion = await base44.asServiceRole.entities.ImageSuggestion.get(id);
    if (!suggestion) return Response.json({ error: "Suggestion not found" }, { status: 404 });

    if (action === "reject") {
      await base44.asServiceRole.entities.ImageSuggestion.update(id, { status: "rejected", review_note: note });
      return Response.json({ status: "rejected" });
    }

    const image = suggestion.suggested_image_url;
    const updated = { items: 0, products: 0, catalog: 0 };

    const byName = await base44.asServiceRole.entities.ListItem.updateMany(
      { name: suggestion.product_name }, { $set: { image_url: image } }
    );
    updated.items = byName?.updated ?? 0;
    if (suggestion.barcode) {
      const byCode = await base44.asServiceRole.entities.ListItem.updateMany(
        { barcode: suggestion.barcode }, { $set: { image_url: image } }
      );
      updated.items = Math.max(updated.items, byCode?.updated ?? 0);
    }

    const products = await base44.asServiceRole.entities.Product.updateMany(
      { name: suggestion.product_name }, { $set: { image_url: image } }
    );
    updated.products = products?.updated ?? 0;

    // הקטלוג שומר תמונה אחת לכל ברקוד — כך היא חוזרת לכל מי שמחפש את המוצר
    if (suggestion.barcode) {
      try {
        const cached = await base44.asServiceRole.entities.CatalogImage.filter({ barcode: suggestion.barcode }, "-created_date", 1);
        if (cached.length) await base44.asServiceRole.entities.CatalogImage.update(cached[0].id, { image_url: image });
        else await base44.asServiceRole.entities.CatalogImage.create({ barcode: suggestion.barcode, image_url: image });
        updated.catalog = 1;
      } catch (error) {
        console.error("catalog image update skipped", error instanceof Error ? error.message : error);
      }
    }

    await base44.asServiceRole.entities.ImageSuggestion.update(id, {
      status: "approved", review_note: note, current_image_url: image
    });
    return Response.json({ status: "approved", updated });
  } catch (error) {
    console.error("reviewPhotoSuggestion", error);
    return Response.json({ error: error instanceof Error ? error.message : "Review failed" }, { status: 500 });
  }
}