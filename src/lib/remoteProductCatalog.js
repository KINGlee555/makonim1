import { base44 } from "@/api/base44Client";
import { normalizeProductText, prepareProduct } from "@/lib/productSearch";

const memoryCache = new Map();
const pending = new Map();

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
  memoryCache.set(normalized, products);
  return products;
}