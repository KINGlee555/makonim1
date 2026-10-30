const finalLetters = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };
const resultCaches = new WeakMap();
const MAX_CACHED_SEARCHES = 80;

function cacheResults(products, key, results) {
  let cache = resultCaches.get(products);
  if (!cache) {
    cache = new Map();
    resultCaches.set(products, cache);
  }
  if (cache.size >= MAX_CACHED_SEARCHES) cache.delete(cache.keys().next().value);
  cache.set(key, results);
  return results;
}

export function normalizeProductText(value = "") {
  return value.toLowerCase().replace(/[ךםןףץ]/g, letter => finalLetters[letter]).replace(/[׳'״".,%/\\()\-_]/g, " ").replace(/\s+/g, " ").trim();
}

export function prepareProduct(product) {
  return {
    ...product,
    _search: normalizeProductText(`${product.name || ""} ${product.brand || ""} ${product.category || ""}`),
    _name: normalizeProductText(product.name || "")
  };
}

// "הכי קרוב": גם כשהמלל לא מופיע במדויק בשם המוצר (מילה חסרה, מידה, שגיאת כתיב קטנה)
// מחזיר את המוצרים הקרובים ביותר לחיפוש — כך תמיד יש לאן לכוון את הקונה.
export function closestCatalog(products, query, category, limit = 48) {
  const normalized = normalizeProductText(query);
  if (!normalized) return [];
  const terms = normalized.split(" ").filter(Boolean);
  const mainTerm = terms[0] || normalized;
  const scored = [];
  for (const product of products) {
    if (category && category !== "all" && product.category !== category) continue;
    const words = product._name.split(" ");
    // רק מוצרים שקשורים למילה הראשונה — שלא יוצגו מוצרים לא קשורים רק בגלל המותג
    const mainHit = product._search.includes(mainTerm) || (mainTerm.length >= 3 && words.some(word => word.startsWith(mainTerm.slice(0, 3))));
    if (!mainHit) continue;
    let score = 0;
    for (const term of terms) {
      if (product._search.includes(term)) score += 2;
      else if (term.length >= 3 && words.some(word => word.startsWith(term.slice(0, 3)))) score += 1;
    }
    if (score < 2) continue;
    scored.push({ product, score, length: product._name.length });
  }
  scored.sort((a, b) => b.score - a.score || a.length - b.length || (a.product.price || Number.MAX_VALUE) - (b.product.price || Number.MAX_VALUE));
  return scored.slice(0, limit).map(entry => entry.product);
}

// מיון התוצאות לפי מה שביקש הקונה: התאמה למלל, המחיר הזול ביותר, או ההתאמה הקרובה ביותר
export function sortCatalogResults(items, query, mode) {
  if (mode === "price") {
    return [...items].sort((a, b) => (a.price || Number.MAX_VALUE) - (b.price || Number.MAX_VALUE) || a.name.localeCompare(b.name, "he"));
  }
  if (mode === "closest") {
    const normalized = normalizeProductText(query);
    const terms = normalized.split(" ").filter(Boolean);
    // ניקוד לפי כמה ממילות החיפוש נמצאות בשם המוצר — כך "פסטה אסם" מקדים את "במבה אסם"
    const relevance = (product) => {
      const name = product._name || normalizeProductText(product.name || "");
      if (!normalized) return 0;
      const words = name.split(" ");
      let score = name === normalized ? 30 : name.startsWith(normalized) ? 12 : name.includes(normalized) ? 8 : 0;
      for (const term of terms) {
        if (name.includes(term)) score += 4;
        else if (term.length >= 3 && words.some(word => word.startsWith(term.slice(0, 3)))) score += 2;
      }
      return score;
    };
    return [...items].sort((a, b) => relevance(b) - relevance(a) || a.name.localeCompare(b.name, "he"));
  }
  return items;
}

export function searchCatalog(products, query, category, byPrice, limit = 48) {
  const normalized = normalizeProductText(query);
  if (!normalized) return [];
  const cacheKey = `${normalized}|${category || "all"}|${byPrice ? "price" : "name"}|${limit}`;
  const cached = resultCaches.get(products)?.get(cacheKey);
  if (cached) return cached;

  const terms = normalized.split(" ");
  const buckets = [[], [], [], [], []];
  for (const product of products) {
    if (category && category !== "all" && product.category !== category) continue;
    if (!terms.every(term => product._search.includes(term))) continue;
    const startsWithWord = product._name === normalized || product._name.startsWith(`${normalized} `)
      || product._name.includes(` ${normalized}`);
    const score = product._name === normalized ? 0 : product._name.startsWith(normalized) ? 1 : startsWithWord ? 2 : product._name.includes(normalized) ? 3 : 4;
    buckets[score].push(product);
  }

  // Real barcode-catalog products (authentic photo + brand + size) always rank above generic entries
  const sourceRank = product => (product.catalog_source === "open_food_facts" ? 0 : 1);
  const compare = byPrice
    ? (a, b) => sourceRank(a) - sourceRank(b) || (a.price || Number.MAX_VALUE) - (b.price || Number.MAX_VALUE) || a.name.localeCompare(b.name, "he")
    : (a, b) => sourceRank(a) - sourceRank(b) || a.name.localeCompare(b.name, "he");
  const results = [];
  for (const bucket of buckets) {
    bucket.sort(compare);
    results.push(...bucket.slice(0, limit - results.length));
    if (results.length >= limit) break;
  }
  return cacheResults(products, cacheKey, results);
}