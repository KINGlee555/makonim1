import { normalizeProductText, prepareProduct } from "@/lib/productSearch";

const memoryCache = new Map();
const pending = new Map();
// A query that returned no results is not sent again immediately — searching the catalog is heavy, and there is no reason to repeat a name that wasn't found
const emptyUntil = new Map();
const EMPTY_COOLDOWN_MS = 10 * 60 * 1000;
const MAX_CACHED_QUERIES = 100;

function remember(key, products) {
  // An empty result is not cached forever — a temporary catalog failure won't hide products for the whole session
  if (products.length === 0) {
    emptyUntil.set(key, Date.now() + EMPTY_COOLDOWN_MS);
    return products;
  }
  emptyUntil.delete(key);
  if (memoryCache.size >= MAX_CACHED_QUERIES) memoryCache.delete(memoryCache.keys().next().value);
  memoryCache.set(key, products);
  return products;
}

function cooling(key) {
  const until = emptyUntil.get(key);
  if (!until) return false;
  if (until < Date.now()) { emptyUntil.delete(key); return false; }
  return true;
}

async function lookUp(key, params) {
  if (memoryCache.has(key)) return memoryCache.get(key);
  if (cooling(key)) return [];
  if (!pending.has(key)) {
    // The catalog searches by the real name, so we send the text as is — normalization is only used as a memory key

    // TODO: Replace with your new backend cloud function or API endpoint to search the product catalog
    // Simulating a network request for now
    pending.set(key, new Promise(resolve => setTimeout(resolve, 500))
        .then(() => ({ ok: true, products: [] })) // Mocking an empty response
        .catch(() => ({ ok: false, products: [] }))
        .finally(() => pending.delete(key)));
  }
  const { ok, products } = await pending.get(key);
  if (!ok) return products;
  return remember(key, products);
}

export async function searchRemoteCatalog(query) {
  const text = String(query || "").trim();
  const normalized = normalizeProductText(text);
  if (normalized.length < 2) return [];
  return lookUp(normalized, { query: text, limit: 48 });
}

export async function browseRemoteCategory(category) {
  const text = String(category || "").trim();
  if (!text) return [];
  return lookUp(`category:${normalizeProductText(text)}`, { category: text });
}