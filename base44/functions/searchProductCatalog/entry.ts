import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

function categoryFor(tags) {
  const value = Array.isArray(tags) ? tags.join(" ") : "";
  if (/dair|milk|cheese|yogurt|egg/.test(value)) return "מוצרי חלב";
  if (/snack|sweet|chocolate|candy|cookie|cereal/.test(value)) return "חטיפים ומתוקים";
  if (/beverage|drink|water|juice|coffee|tea/.test(value)) return "משקאות";
  if (/meat|fish|seafood|poultry/.test(value)) return "בשר ודגים";
  if (/bread|bakery|pastr/.test(value)) return "לחם ומאפים";
  if (/frozen/.test(value)) return "קפואים";
  if (/canned|preserv|sauce|pasta|rice|flour|spread|legume/.test(value)) return "שימורים";
  return "אחר";
}

// OFF rate-limits bursts — retry a couple of times with a short backoff so a
// single hiccup doesn't hand the app an empty catalog.
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

// Many Israeli items have no usable category tags — infer from the Hebrew name.
function categoryFromName(name) {
  if (/חלב|גבינ|שמנת|יוגורט|קוטג|לבן|ביצים|חמאה/.test(name)) return "מוצרי חלב";
  if (/חטיף|שוקולד|במבה|ביסלי|עוגי|ופל|סוכרי|גלידה|חלוה/.test(name)) return "חטיפים ומתוקים";
  if (/מים|קולה|מיץ|בירה|יין|שתי|קפה|תה|סודה/.test(name)) return "משקאות";
  if (/עוף|בשר|דג|סלמון|טונה|הודו|נקניק|שניצל/.test(name)) return "בשר ודגים";
  if (/לחם|פית|לחמני|חלה|באגט|מאפ/.test(name)) return "לחם ומאפים";
  if (/קפוא|קפואים/.test(name)) return "קפואים";
  if (/עגבני|מלפפון|תפוח|בננה|גזר|בצל|חסה|לימון|אבוקדו|תות/.test(name)) return "פירות וירקות";
  if (/סבון|ניקוי|אקונומיקה|נייר|שמפו|משחת שיניים|כלים/.test(name)) return "חד פעמי וניקיון";
  return "";
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
      category: forcedCategory || categoryFromName(name) || categoryFor(product.categories_tags),
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
      const response = await fetchWithRetry(catalogUrl, "Israeli snack catalog");
      if (!response) return Response.json({ error: "Catalog unavailable" }, { status: 502 });
      const data = await response.json();
      const rawProducts = [...(data.products || [])];
      if (Number(data.count) > 250) {
        params.set("page", "2");
        const nextResponse = await fetchWithRetry(`https://world.openfoodfacts.org/api/v2/search?${params}`, "Israeli snack catalog page 2");
        if (nextResponse) {
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
    const response = await fetchWithRetry(searchUrl, "product catalog search");
    if (!response) return Response.json({ products: [], total: 0 });
    const data = await response.json();
    const products = mapProducts(data.products || []);
    return Response.json({ products, total: Number(data.count) || products.length });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Catalog search failed" }, { status: 500 });
  }
}