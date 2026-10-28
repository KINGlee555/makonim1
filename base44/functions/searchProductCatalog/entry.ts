import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { searchPriceCatalog, categoryFromName, displayName } from "../../shared/shufersalPrices.ts";
import { photosForBarcodes } from "../../shared/productPhotos.ts";

function toProduct(item: any, image: string) {
  const name = displayName(item);
  return {
    id: `shufersal-${item.code}`, barcode: item.code, name, brand: item.brand,
    category: categoryFromName(name), price: item.price, image_url: image,
    weighted: Boolean(item.weighted),
    image_verified: true, price_source: "shufersal", catalog_source: "shufersal"
  };
}

// Hebrew queries typed with sizes and punctuation ("חלב טרה 3%") match better once the
// punctuation is gone, and a shorter phrase finds the product when the full one doesn't.
function nameQueries(query: string) {
  const cleaned = query.replace(/[%.,()/\\-]/g, " ").replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ").filter(Boolean);
  const queries = [cleaned];
  if (words.length > 2) queries.push(words.slice(0, 2).join(" "));
  return [...new Set(queries.filter((value: string) => value.length >= 3))];
}

// מקור ישראלי בלבד: מוצרים מהקטלוג שלנו — כלומר מוצרים של הרשתות בישראל — שיש להם תמונה
// אמיתית של הברקוד. כך אין פנייה למאגר בחו"ל, וכל מוצר שנכנס לתוצאות נמכר בישראל.
async function photosByName(base44: any, query: string) {
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    const result = await base44.asServiceRole.entities.CatalogProduct.filter(
      { name: { $regex: safe }, image_url: { $ne: "" } }, "-created_date", 24
    );
    const rows = Array.isArray(result) ? result : result?.items || [];
    return rows.map((row: any) => ({ code: row.barcode, product_name: row.name, brands: row.brand, image_url: row.image_url, price: row.price, chain_name: row.chain_name }));
  } catch (error) {
    console.error("catalog name search skipped", error instanceof Error ? error.message : error);
    return [];
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const query = String(body?.query || "").trim().slice(0, 60);
    const limit = Math.min(Math.max(Number(body?.limit) || 36, 8), 60);
    if (query.length < 2) return Response.json({ products: [] });

    // Price list first (real shelf prices), then keep only items with a photo of that exact barcode.
    const started = Date.now();
    const priced = await searchPriceCatalog(query, 80);
    const pricedAt = Date.now();
    const images = await photosForBarcodes(base44, priced.map((item: any) => item.code));
    const products = priced.filter((item) => images.has(item.code)).slice(0, limit)
      .map((item) => toProduct(item, images.get(item.code) as string));

    // Extra real photos for the products whose barcode had none.
    const known = new Set(products.map((product) => product.barcode));
    const extras: any[] = [];
    if (query.length >= 3) {
      for (const nameQuery of nameQueries(query)) {
        for (const raw of await photosByName(base44, nameQuery)) {
          const code = String(raw.code);
          const image = String(raw.image_front_url || raw.image_url || "").replace(/^http:/, "https:");
          if (!code || !image || known.has(code)) continue;
          known.add(code);
          const name = String(raw.product_name || "").trim().slice(0, 64) || query;
          extras.push({
            id: `openfoodfacts-${code}`, barcode: code, name,
            brand: String(raw.brands || "").split(",")[0].trim(),
            category: categoryFromName(name), price: Number(raw.price) || 0, image_url: image, weighted: false,
            image_verified: true, price_source: "", catalog_source: "catalog"
          });
        }
        if (extras.length >= 8) break;
      }
    }

    const all = [...products, ...extras];
    console.log("timing ms", { prices: pricedAt - started, photos: Date.now() - pricedAt, candidates: priced.length, extras: extras.length });
    return Response.json({ products: all, total: all.length, priced: priced.length, timing: { prices: pricedAt - started, photos: Date.now() - pricedAt } });
  } catch (error) {
    console.error("searchProductCatalog", error);
    return Response.json({ error: error instanceof Error ? error.message : "Catalog search failed" }, { status: 500 });
  }
}