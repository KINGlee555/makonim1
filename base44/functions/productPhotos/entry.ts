import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { barcodeAliases, exactProductPhoto, normalizedPhotoCode, photoIdentity } from "../../shared/productPhotoIdentity.ts";
import { chainPhotoUrl } from "../../shared/productImageSearch.ts";

// Resolve exact products in two batched local reads. No slow external search,
// arbitrary twelve-product cutoff, or permanent negative entries.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(error => error?.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const raw = Array.isArray(body.items) ? body.items : (body.barcodes || []).map(barcode => ({ barcode }));
    const items = raw.slice(0, 80).filter(item => item && typeof item === "object").map(item => ({ barcode: String(item.barcode || "").trim(), name: String(item.name || "").trim().slice(0, 64), brand: String(item.brand || "").trim().slice(0, 64) }));
    const codes = [...new Set(items.flatMap(item => barcodeAliases(item.barcode)))];
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
      let rows = [...images.items, ...products.items].filter(row => item.barcode
        ? barcodeAliases(item.barcode).includes(String(row.barcode))
        : row.name === item.name && (!item.brand || row.brand === item.brand));
      // A name shared by different products/brands is ambiguous, not an image match.
      if (!item.barcode && new Set(rows.map(row => normalizedPhotoCode(row.barcode) || row.barcode)).size > 1) rows = [];
      const urls = [...new Set(rows.filter(row => exactProductPhoto(row.image_url, row.barcode)).map(row => row.image_url))];
      const direct = item.barcode ? chainPhotoUrl(item.barcode) : rows.length ? chainPhotoUrl(rows[0].barcode) : "";
      if (direct) { const index = urls.indexOf(direct); if (index !== -1) urls.splice(index, 1); urls.unshift(direct); }
      candidates[key] = urls;
      candidates[photoIdentity(item)] = urls;
      if (urls.length) photos[key] = urls[0];
    }
    return Response.json({ photos, candidates });
  } catch (error) {
    console.error("productPhotos", error);
    return Response.json({ error: error.message || "Photo lookup failed" }, { status: 500 });
  }
}