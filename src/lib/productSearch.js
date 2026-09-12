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

export function searchCatalog(products, query, category, byPrice) {
  const normalized = normalizeProductText(query);
  if (!normalized) return [];
  const cacheKey = `${normalized}|${category || "all"}|${byPrice ? "price" : "name"}`;
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

  const compare = byPrice
    ? (a, b) => (a.price || Number.MAX_VALUE) - (b.price || Number.MAX_VALUE) || a.name.localeCompare(b.name, "he")
    : (a, b) => a.name.localeCompare(b.name, "he");
  const results = [];
  for (const bucket of buckets) {
    bucket.sort(compare);
    results.push(...bucket.slice(0, 48 - results.length));
    if (results.length === 48) break;
  }
  return cacheResults(products, cacheKey, results);
}