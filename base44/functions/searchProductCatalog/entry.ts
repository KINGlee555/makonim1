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

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const query = String(body?.query || "").trim().slice(0, 60);
    const limit = Math.min(Math.max(Number(body?.limit) || 36, 8), 60);
    if (query.length < 2) return Response.json({ products: [] });

    const params = new URLSearchParams({
      search_terms: query,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: String(limit),
      fields: "code,product_name,product_name_he,generic_name_he,brands,image_front_url,image_url,categories_tags"
    });
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`, {
      headers: { "User-Agent": "MaKonim/1.0 (product catalog search)" }
    });
    if (!response.ok) return Response.json({ error: "Catalog unavailable" }, { status: 502 });
    const data = await response.json();
    const seen = new Set();
    const products = (data.products || []).flatMap((product) => {
      const name = String(product.product_name_he || product.product_name || product.generic_name_he || "").trim();
      const image = String(product.image_front_url || product.image_url || "").replace(/^http:/, "https:");
      const code = String(product.code || "");
      if (!name || !image || !code || seen.has(code)) return [];
      seen.add(code);
      return [{
        id: `off-${code}`,
        barcode: code,
        name,
        brand: String(product.brands || "").split(",")[0].trim(),
        category: categoryFor(product.categories_tags),
        price: 0,
        image_url: image,
        image_verified: true,
        catalog_source: "open_food_facts"
      }];
    });
    return Response.json({ products, total: Number(data.count) || products.length });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Catalog search failed" }, { status: 500 });
  }
}