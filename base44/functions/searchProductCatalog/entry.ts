import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

function categoryFor(tags) {
  const value = Array.isArray(tags) ? tags.join(" ") : "";
  if (/dair|milk|cheese|yogurt|egg/.test(value)) return "מוצרי חלב";
  if (/snack|sweet|chocolate|candy|cookie|cereal/.test(value)) return "חטיפים ומתוקים";
  if (/beverage|drink|water|juice|coffee|tea/.test(value)) return "משקאות";
  if (/meat|fish|seafood|poultry/.test(value)) return "בשר ודגים";
  if (/bread|bakery|pastr/.test(value)) return "לחם ומאפים";
  if (/frozen/.test(value)) return "קפואים";
  return "שימורים";
}

function mapProducts(rawProducts, forcedCategory = "") {
  const seen = new Set();
  return rawProducts.flatMap((product) => {
    const baseName = String(product.product_name_he || product.product_name || product.generic_name_he || "").trim();
    const image = String(product.image_front_url || product.image_url || "").replace(/^http:/, "https:");
    const code = String(product.code || "");
    if (!baseName || !image || !code || seen.has(code)) return [];
    seen.add(code);
    const brand = String(product.brands || "").split(",")[0].trim();
    const quantity = String(product.quantity || "").trim();
    // Precise display name: product + brand + package size (e.g. "חלב טרי 1% תנובה 1 ליטר")
    const parts = [baseName];
    if (brand && !baseName.includes(brand)) parts.push(brand);
    if (quantity && !baseName.includes(quantity)) parts.push(quantity);
    const name = parts.join(" ").slice(0, 64);
    return [{
      id: `off-${code}`,
      barcode: code,
      name,
      brand,
      category: forcedCategory || categoryFor(product.categories_tags),
      price: 0,
      image_url: image,
      image_verified: true,
      catalog_source: "open_food_facts"
    }];
  });
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
    const fields = "code,product_name,product_name_he,generic_name_he,brands,quantity,image_front_url,image_url,categories_tags";
    if (!browseIsraeliSnacks && query.length < 2) return Response.json({ products: [] });

    if (browseIsraeliSnacks) {
      const params = new URLSearchParams({
        categories_tags_en: "snacks", countries_tags_en: "israel", page: "1", page_size: "250", sort_by: "unique_scans_n", fields
      });
      const catalogUrl = `https://world.openfoodfacts.org/api/v2/search?${params}`;
      let response = await fetch(catalogUrl, {
        headers: { "User-Agent": "MaKonim/1.0 (Israeli snack catalog)" }
      });
      if (!response.ok) {
        response = await fetch(catalogUrl, {
          headers: { "User-Agent": "MaKonim/1.0 (Israeli snack catalog retry)" }
        });
      }
      if (!response.ok) return Response.json({ error: "Catalog unavailable" }, { status: 502 });
      const data = await response.json();
      const rawProducts = [...(data.products || [])];
      if (Number(data.count) > 250) {
        params.set("page", "2");
        const nextResponse = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, {
          headers: { "User-Agent": "MaKonim/1.0 (Israeli snack catalog)" }
        });
        if (nextResponse.ok) {
          const nextData = await nextResponse.json();
          rawProducts.push(...(nextData.products || []));
        }
      }
      const products = mapProducts(rawProducts, "חטיפים ומתוקים");
      return Response.json({ products, total: Number(data.count) || products.length });
    }

    const params = new URLSearchParams({
      search_terms: query, search_simple: "1", action: "process", json: "1", page_size: String(limit), fields
    });
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?${params}`;
    const headers = { "User-Agent": "MaKonim/1.0 (product catalog search)" };
    let response = await fetch(searchUrl, { headers });
    if (!response.ok) response = await fetch(searchUrl, { headers });
    if (!response.ok) return Response.json({ products: [], total: 0 });
    const data = await response.json();
    const products = mapProducts(data.products || []);
    return Response.json({ products, total: Number(data.count) || products.length });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Catalog search failed" }, { status: 500 });
  }
}