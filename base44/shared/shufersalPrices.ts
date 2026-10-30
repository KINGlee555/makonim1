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

// המחלקה של המוצר לפי שמו — אותן מחלקות שמופיעות בסינון של האפליקציה,
// כדי שמוצר יוכל להופיע תחת "חלבי", "ניקיון" או "תבלינים" ולא ליפול ל"אחר".
const CATEGORY_RULES: [string, RegExp][] = [
  // אלכוהול וטבק קודם לכל השאר — אחרת הבירה והיין נופלים ל"משקאות" והסיגריות ל"אחר"
  ["אלכוהול", /וודקה|וויסקי|ויסקי|ברנדי|קוניאק|ערק|שמפניה|פרוסקו|ליקר|טקילה|מסקל|אפרול|מרטיני|אלכוהול|יין|יינות|בירה|בירות|סיידר|(?<![א-ת])רום(?![א-ת])|(?<![א-ת])ג'ין(?![א-ת])|(?<![א-ת])ג׳ין(?![א-ת])|משקה\s*חריף/],
  ["סיגריות וטבק", /סיגר|טבק|נרגיל|מקטרת|ריזלה|אי[-\s]?סיג|iqos|glo\b|הסקה/],
  ["מוצרי חלב", /חלב|גבינ|שמנת|יוגורט|קוטג|לבן|ביצים|חמאה|מעדן|אשל|דנונה|לאבנה|צפתית|ריקוטה|מוצרלה|פרמז|קשקבל|בולגר/],
  ["לחם ומאפים", /לחם|פית|לחמני|חלה|באגט|מאפ|קרואסון|בורקס|פרכ|ג'חנון|גחנון|טורטיה|לפה|מצה|פירורית|פירורי/],
  ["פירות וירקות", /עגבני|מלפפון|תפוח(?!\s*אדמה)|בננה|גזר|בצל|חסה|לימון|אבוקדו|תות|פלפל(?!\s*שחור)|תפו"א|תפוא|כרוב|ענבים|אפרסק|שזיף|אגס|מלון|אבטיח|תפוז|קלמנטי|מנגו|אננס|פטריו|ברוקולי|כוסברה|פטרוזיליה|נענע|שום|גמבה|קישוא|חציל|דלעת|סלק|צנון|סלרי|תירס|רוקט|עלים|עשבי/],
  ["בשר ודגים", /עוף|בשר|דג|סלמון|טונה|הודו|נקניק|שניצל|קבב|המבורגר|כבד|פרגית|בקר|כבש|אנטריקוט|פילה|סטייק|נקניקי|פסטרמה|סלמי|חומוס\s*בשר/],
  ["קפואים", /קפוא|קפואה|גליד|קרח/],
  ["תבלינים", /תבלין|פפריקה|כורכום|קינמון|כמון|אורגנו|בזיליקום|אבקת שום|אבקת בצל|וניל|פלפל שחור|מלח\s*ים|ציפורן|הל|זעתר|סומק|שומשום|קורט|רטבים?\s*חריף/],
  ["חטיפים ומתוקים", /חטיף|שוקולד|במבה|ביסלי|עוגי|עוגה|ופל|סוכרי|חלוה|ממתק|מסטיק|קרמבו|טופי|קרמשניט|דוריטוס|צ'יפס|פופקורן|קרקר|בייגל|טורטייה\s*מתקתק|דגני\s*בוקר|קורנפלס|גרנולה|חמאת\s*בוטנים|ריבה|דבש|ממרח|נוטלה|קרמבו/],
  ["משקאות", /מים|קולה|מיץ|בירה|יין|שתי|קפה|תה|סודה|משקה|ספרייט|פאנטה|נקטר|אנרגיה|שוקו|מינרלי|טוניק|סיידר|לימונדה|אבקת\s*שתייה/],
  ["שימורים", /אורז|פסטה|ספגטי|אטריות|קמח|סוכר|שמן|שימור|רכז|רוטב|קטשופ|מיונז|חומוס|טחינה|קוסקוס|פתיתים|עדשים|שעועית|מלח|מרק|אבקת מרק|זיתים|חמוצים|מלפפון חמוץ|טונה\s*בשמן|סרדינ|תירס\s*משומר|פטריות\s*משומר|דגנים|קינואה|בורגול|חיטה|גריס|פול|אפונה|תרכיז/],
  ["ניקיון", /סבון כלים|ניקוי|אקונומיקה|אבקת כביסה|מרכך כביסה|מטהר|אשפריץ|ספוג|מטליות|שקיות אשפה|נייר טואלט|מגבות נייר|מגבות מטבח|מפיות|כלי\s*חד\s*פעמי|צלחות\s*חד|כוסות\s*חד|ניילון נצמד|אשפה|נרות|גפרור|סוללה|כביסה|ברק/],
  ["היגיינה", /שמפו|מרכך שיער|משחת שיניים|מברשת שיניים|דאודורנט|דיאודורנט|גילוח|סכין גילוח|חיתול|מגבונים|טמפון|תחבושת|פלסטר|קרם|לוסיון|איפור|בושם|דאו|סבון(?! כלים)|ג'ל רחצה|מסכה|מייק אפ|שפתון|קוטל|חומר חיטוי|אלכוג'ל/],
  ["חיות מחמד", /לכלב|לחתול|כלב|חתול|חול חתולים|מזון לחיות|דוג|פרווה|פינת חי/]
];

export function categoryFromName(name: string) {
  for (const [category, rule] of CATEGORY_RULES) {
    if (rule.test(name)) return category;
  }
  return "אחר";
}

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return match ? match[1].trim() : "";
}

// The file names carry a YYYYMMDD-HHMMSS stamp, so the newest one sorts first.
const stamp = (url: string) => (url.match(/(\d{8}-\d{6})/) || ["", ""])[1];

// סניפי שופרסל שנקראים לקטלוג — סניף האונליין ועוד סניפים נבחרים מרחבי הארץ
export const SHUFERSAL_STORES = ["413", "001", "002", "005", "007", "013", "018", "006"];

// קובץ המחירים העדכני של כמה סניפי שופרסל. לכל סניף מבחר משלו, ולכן איחוד שלהם
// מכניס לקטלוג מוצרים אמיתיים שלא מופיעים בסניף הבודד שקוראים בדרך כלל.
// חתימת ההורדה של הקובץ קצרה-מועד, ולכן מיד אחרי הרשימה מורידים אותו.
export async function shufersalStoreFiles(stores: string[]) {
  const files: { url: string; headers: Record<string, string>; day: string }[] = [];
  for (const store of stores) {
    try {
      const listing = await fetch(
        `https://prices.shufersal.co.il/FileObject/UpdateCategory?catID=2&storeId=${store}&sort=Time&order=desc&__swhg=${Date.now()}`,
        { headers: { "User-Agent": "MaKonim/1.0", "X-Requested-With": "XMLHttpRequest" }, signal: AbortSignal.timeout(20000) }
      );
      const html = await listing.text();
      const links = [...html.matchAll(/href="(https:\/\/pricesprodpublic[^"]+pricefull[^"]+)"/gi)]
        .map((match) => match[1].replace(/&amp;/g, "&"));
      const fileUrl = links.sort((a, b) => stamp(b).localeCompare(stamp(a)))[0];
      if (!fileUrl) continue;
      const raw = stamp(fileUrl);
      files.push({
        url: fileUrl,
        headers: { "User-Agent": "MaKonim/1.0" },
        day: raw ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : new Date().toISOString().slice(0, 10)
      });
    } catch {
      // סניף שלא ענה — ממשיכים לסניף הבא
    }
  }
  return files;
}

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