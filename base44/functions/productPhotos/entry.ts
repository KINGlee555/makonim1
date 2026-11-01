import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

// Resolve exact products in two batched local reads. No slow external search,
// arbitrary twelve-product cutoff, or permanent negative entries.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(error => error?.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const raw = Array.isArray(body.items) ? body.items : (body.barcodes || []).map(barcode => ({ barcode }));
    const items = raw.slice(0, 80).map(item => ({ barcode: String(item.barcode || "").trim(), name: String(item.name || "").trim().slice(0, 64) }));
    const codes = [...new Set(items.map(item => item.barcode).filter(Boolean))];
    const names = [...new Set(items.filter(item => !item.barcode).map(item => item.name).filter(Boolean))];
    const clauses = [...(codes.length ? [{ barcode: { $in: codes } }] : []), ...(names.length ? [{ name: { $in: names } }] : [])];
    if (!clauses.length) return Response.json({ photos: {}, candidates: {} });
    const [images, products] = await Promise.all([
      codes.length ? base44.asServiceRole.entities.CatalogImage.filter({ barcode: { $in: codes }, image_url: { $ne: "" } }, { limit: 500 }) : { items: [] },
      base44.asServiceRole.entities.CatalogProduct.filter({ $or: clauses, image_url: { $ne: "" } }, { limit: 500 })
    ]);
    const candidates = {};
    const photos = {};
    for (const item of items) {
      const key = item.barcode || item.name;
      const rows = [...images.items, ...products.items].filter(row => item.barcode ? row.barcode === item.barcode : row.name === item.name);
      const urls = [...new Set(rows.map(row => row.image_url).filter(Boolean))];
      urls.sort((a, b) => Number(/images\.(pexels|unsplash)\.com/.test(a)) - Number(/images\.(pexels|unsplash)\.com/.test(b)));
      candidates[key] = urls;
      if (urls.length) photos[key] = urls[0];
    }
    return Response.json({ photos, candidates });
  } catch (error) {
    console.error("productPhotos", error);
    return Response.json({ error: error.message || "Photo lookup failed" }, { status: 500 });
  }
}