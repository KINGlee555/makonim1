import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { searchPriceCatalog, priceByBarcode, categoryFromName, displayName } from "../../shared/shufersalPrices.ts";

const OFF_FIELDS = "code,image_front_url,image_url";

// OFF rate-limits bursts — retry a couple of times with a short backoff.
async function fetchWithRetry(url: string, label: string) {
  const headers = { "User-Agent": `MaKonim/1.0 (${label})` };
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, { headers });
    if (response.ok) return response;
    console.error("catalog request failed", label, response.status, attempt);
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
  }
  return null;
}

// Real photos of the exact barcode. Known barcodes come from our own cache (including
// "no photo" results); only new ones are looked up in the barcode catalog.
async function imagesForCodes(base44: any, codes: string[]) {
  const images = new Map<string, string>();
  if (!codes.length) return images;
  const cached = await base44.asServiceRole.entities.CatalogImage.filter({ barcode: { $in: codes } }, "-created_date", codes.length);
  const known = new Set<string>();
  for (const row of cached) {
    known.add(row.barcode);
    if (row.image_url) images.set(row.barcode, row.image_url);
  }
  const fresh = codes.filter((code) => !known.has(code));
  const batches: string[][] = [];
  for (let i = 0; i < fresh.length; i += 40) batches.push(fresh.slice(i, i + 40));
  const resolved: string[] = [];
  await Promise.all(batches.map(async (batch) => {
    const params = new URLSearchParams({ code: batch.join(","), fields: OFF_FIELDS, page_size: "40" });
    const response = await fetchWithRetry(`https://world.openfoodfacts.org/api/v2/search?${params}`, "barcode photos");
    if (!response) return;
    const data = await response.json();
    resolved.push(...batch);
    for (const product of data.products || []) {
      const image = String(product.image_front_url || product.image_url || "").replace(/^http:/, "https:");
      if (image) images.set(String(product.code), image);
    }
  }));
  if (resolved.length) {
    // Two lookups can reach the same new barcode at the same time; the second insert is
    // refused as a duplicate and can simply be ignored.
    try {
      await base44.asServiceRole.entities.CatalogImage.bulkCreate(resolved.map((code) => ({ barcode: code, image_url: images.get(code) || "" })));
    } catch (error) {
      console.error("catalog image store skipped", error instanceof Error ? error.message : error);
    }
  }
  return images;
}

function toProduct(item: any, image: string) {
  const name = displayName(item);
  return {
    id: `shufersal-${item.code}`, barcode: item.code, name, brand: item.brand,
    category: categoryFromName(name), price: item.price, image_url: image,
    image_verified: true, price_source: "shufersal", catalog_source: "open_food_facts"
  };
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const query = String(body?.query || "").trim().slice(0, 60);
    const category = String(body?.category || "");
    const browseIsraeliSnacks = category === "חטיפים ומתוקים" && query.length < 2;
    const limit = Math.min(Math.max(Number(body?.limit) || 36, 8), 60);
    if (!browseIsraeliSnacks && query.length < 2) return Response.json({ products: [] });

    if (browseIsraeliSnacks) {
      const params = new URLSearchParams({
        categories_tags_en: "snacks", countries_tags_en: "israel", page: "1", page_size: "250", sort_by: "unique_scans_n", fields: OFF_FIELDS
      });
      const response = await fetchWithRetry(`https://world.openfoodfacts.org/api/v2/search?${params}`, "Israeli snack catalog");
      if (!response) return Response.json({ error: "Catalog unavailable" }, { status: 502 });
      const data = await response.json();
      const products: any[] = [];
      const seen = new Set<string>();
      for (const raw of data.products || []) {
        const code = String(raw.code);
        const image = String(raw.image_front_url || raw.image_url || "").replace(/^http:/, "https:");
        const priced = image && !seen.has(code) ? await priceByBarcode(code) : null;
        if (!priced) continue;
        seen.add(code);
        products.push({ ...toProduct(priced, image), category: "חטיפים ומתוקים" });
      }
      return Response.json({ products, total: products.length });
    }

    // Price list first (real shelf prices), then keep only items with a photo of that exact barcode.
    const started = Date.now();
    const priced = await searchPriceCatalog(query, 80);
    const pricedAt = Date.now();
    const images = await imagesForCodes(base44, priced.map((item) => item.code));
    console.log("timing ms", { prices: pricedAt - started, photos: Date.now() - pricedAt, candidates: priced.length });
    const products = priced.filter((item) => images.has(item.code)).slice(0, limit)
      .map((item) => toProduct(item, images.get(item.code) as string));
    return Response.json({ products, total: products.length, priced: priced.length, timing: { prices: pricedAt - started, photos: Date.now() - pricedAt } });
  } catch (error) {
    console.error("searchProductCatalog", error);
    return Response.json({ error: error instanceof Error ? error.message : "Catalog search failed" }, { status: 500 });
  }
}