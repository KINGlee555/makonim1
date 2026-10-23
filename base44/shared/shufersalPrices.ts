// Official price-transparency feed (חוק שקיפות המחירים): Shufersal publishes a full
// price file per branch every night. We load the Shufersal Online branch (413) once,
// keep it in memory for a few hours and search it by Hebrew name.
const LISTING_URL = "https://prices.shufersal.co.il/FileObject/UpdateCategory?catID=2&storeId=413&sort=Time&order=desc";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cache = { loadedAt: 0, items: [] as any[], byCode: new Map<string, any>(), loading: null as Promise<void> | null };

const finalLetters: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };
export function normalizeText(value = "") {
  return String(value).toLowerCase().replace(/[ךםןףץ]/g, (l) => finalLetters[l])
    .replace(/[׳'״".,%/\\()\-_]/g, " ").replace(/\s+/g, " ").trim();
}

export function categoryFromName(name: string) {
  if (/חלב|גבינ|שמנת|יוגורט|קוטג|לבן|ביצים|חמאה|מעדן|אשל|גיל|דנונה/.test(name)) return "מוצרי חלב";
  if (/חטיף|שוקולד|במבה|ביסלי|עוגי|ופל|סוכרי|גלידה|חלוה|ממתק|מסטיק|קרמבו/.test(name)) return "חטיפים ומתוקים";
  if (/מים|קולה|מיץ|בירה|יין|שתי|קפה|תה |סודה|משקה|ספרייט|פאנטה/.test(name)) return "משקאות";
  if (/עוף|בשר|דג|סלמון|טונה|הודו|נקניק|שניצל|קבב|המבורגר|כבד|פרגית|בקר/.test(name)) return "בשר ודגים";
  if (/לחם|פית|לחמני|חלה|באגט|מאפ|קרואסון|בורקס/.test(name)) return "לחם ומאפים";
  if (/קפוא|קפואים|קרח/.test(name)) return "קפואים";
  if (/עגבני|מלפפון|תפוח|בננה|גזר|בצל|חסה|לימון|אבוקדו|תות|פלפל|תפו"א|תפוא|כרוב|ענבים|אפרסק|שזיף|אגס|מלון|אבטיח/.test(name)) return "פירות וירקות";
  if (/סבון|ניקוי|אקונומיקה|נייר|שמפו|משחת שיניים|כלים|מגבונים|חיתול|אבקת כביסה|מרכך|מטהר/.test(name)) return "חד פעמי וניקיון";
  if (/אורז|פסטה|קמח|סוכר|שמן|שימור|רוטב|קטשופ|מיונז|חומוס|טחינה|קוסקוס|פתיתים|עדשים|שעועית|מלח|תבלין/.test(name)) return "שימורים";
  return "אחר";
}

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return match ? match[1].trim() : "";
}

// The file names carry a YYYYMMDD-HHMMSS stamp, so the newest one sorts first.
const stamp = (url: string) => (url.match(/(\d{8}-\d{6})/) || ["", ""])[1];

async function loadPriceFile() {
  // The listing page builds its file table asynchronously, so the links only come back
  // when the request carries the site's own cache-buster parameter.
  const listing = await fetch(`${LISTING_URL}&__swhg=${Date.now()}`, {
    headers: { "User-Agent": "MaKonim/1.0", "X-Requested-With": "XMLHttpRequest" }
  });
  const html = await listing.text();
  const links = [...html.matchAll(/href="(https:\/\/pricesprodpublic[^"]+pricefull[^"]+)"/gi)]
    .map((match) => match[1].replace(/&amp;/g, "&"));
  const fileUrl = links.sort((a, b) => stamp(b).localeCompare(stamp(a)))[0];
  if (!fileUrl) throw new Error("Shufersal price file link not found");
  const response = await fetch(fileUrl);
  if (!response.ok || !response.body) throw new Error(`Shufersal price file ${response.status}`);
  const xml = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).text();

  const items: any[] = [];
  const byCode = new Map<string, any>();
  for (const block of xml.split("<Item>").slice(1)) {
    const code = tag(block, "ItemCode");
    const name = tag(block, "ItemName");
    const price = Number(tag(block, "ItemPrice"));
    if (!code || !name || !(price > 0)) continue;
    const brand = tag(block, "ManufacturerName").replace(/^לא ידוע$/, "");
    const quantity = tag(block, "Quantity");
    const unit = tag(block, "UnitQty");
    const weighted = tag(block, "bIsWeighted") === "1";
    const item = { code, name, brand, price, quantity, unit, weighted, _search: normalizeText(`${name} ${brand}`) };
    items.push(item);
    byCode.set(code, item);
  }
  cache = { loadedAt: Date.now(), items, byCode, loading: null };
}

export async function getPriceCatalog() {
  if (cache.items.length && Date.now() - cache.loadedAt < CACHE_TTL_MS) return cache;
  if (!cache.loading) cache.loading = loadPriceFile().catch((error) => { cache.loading = null; throw error; });
  await cache.loading;
  return cache;
}

export async function priceByBarcode(code: string) {
  const { byCode } = await getPriceCatalog();
  return byCode.get(code) || null;
}

// Rank: exact name, then name starting with the query, then query as a whole word, then anywhere.
export async function searchPriceCatalog(query: string, limit: number) {
  const { items } = await getPriceCatalog();
  const normalized = normalizeText(query);
  const terms = normalized.split(" ").filter(Boolean);
  if (!terms.length) return [];
  const buckets: any[][] = [[], [], [], []];
  for (const item of items) {
    if (!terms.every((term) => item._search.includes(term))) continue;
    const name = normalizeText(item.name);
    const score = name === normalized ? 0 : name.startsWith(normalized) ? 1 : name.includes(` ${normalized}`) ? 2 : 3;
    buckets[score].push(item);
  }
  const results: any[] = [];
  for (const bucket of buckets) {
    bucket.sort((a, b) => a.name.length - b.name.length);
    results.push(...bucket.slice(0, limit - results.length));
    if (results.length >= limit) break;
  }
  return results;
}

export function displayName(item: any) {
  const parts = [item.name];
  if (item.brand && !item.name.includes(item.brand)) parts.push(item.brand);
  const amount = Number(item.quantity);
  const unit = String(item.unit || "").replace(/^לא ידוע$/, "");
  const compact = amount > 0 ? String(Math.round(amount * 100) / 100) : "";
  // Add the package size only when the name doesn't already state it (e.g. "קוטג' 5% 250ג")
  if (!item.weighted && compact && unit && !item.name.includes(compact)) parts.push(`${compact} ${unit}`);
  return parts.join(" ").slice(0, 64);
}