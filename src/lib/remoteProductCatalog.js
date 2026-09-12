import { base44 } from "@/api/base44Client";
import { normalizeProductText, prepareProduct } from "@/lib/productSearch";

const memoryCache = new Map();
const pending = new Map();
const MAX_CACHED_QUERIES = 100;

function remember(key, products) {
  // Never cache an empty result — a temporary catalog hiccup would otherwise hide products for the whole session
  if (products.length === 0) return products;
  if (memoryCache.size >= MAX_CACHED_QUERIES) memoryCache.delete(memoryCache.keys().next().value);
  memoryCache.set(key, products);
  return products;
}

export async function searchRemoteCatalog(query) {
  const normalized = normalizeProductText(query);
  if (normalized.length < 2) return [];
  if (memoryCache.has(normalized)) return memoryCache.get(normalized);
  if (!pending.has(normalized)) {
    pending.set(normalized, base44.functions.invoke("searchProductCatalog", { query: normalized, limit: 48 })
      .then(response => (response.data?.products || []).map(prepareProduct))
      .catch(() => [])
      .finally(() => pending.delete(normalized)));
  }
  const products = await pending.get(normalized);
  return remember(normalized, products);
}

export async function browseRemoteCategory(category) {
  const key = `category:${category}`;
  if (memoryCache.has(key)) return memoryCache.get(key);
  if (!pending.has(key)) {
    pending.set(key, base44.functions.invoke("searchProductCatalog", { category })
      .then(response => (response.data?.products || []).map(prepareProduct))
      .catch(() => [])
      .finally(() => pending.delete(key)));
  }
  const products = await pending.get(key);
  return remember(key, products);
}