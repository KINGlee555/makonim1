import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(error => error?.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || "").trim().slice(0, 64);
    const category = String(body.category || "").trim().slice(0, 64);
    const limit = Math.min(Math.max(Number(body.limit) || 48, 1), 80);
    if (query.length < 2 && !category) return Response.json({ products: [] });
    const terms = query.split(/\s+/).filter(Boolean).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const filter = category ? { category } : { $and: terms.map(term => ({ name: { $regex: term, $options: "i" } })) };
    const page = await base44.asServiceRole.entities.CatalogProduct.filter(filter, { sort: "name", limit, cursor: body.cursor || undefined });
    return Response.json({ products: page.items.map(row => ({ ...row, image_verified: Boolean(row.image_url), catalog_source: "catalog" })), next_cursor: page.next_cursor, has_more: page.has_more });
  } catch (error) {
    console.error("searchProductCatalog", error);
    return Response.json({ error: error.message || "Catalog search failed" }, { status: 500 });
  }
}