import { israeliProducts } from "@/lib/israeliProducts";
import { curatedProducts } from "@/lib/curatedProducts";
import { petProducts } from "@/lib/petProducts";
import { getSpecificProductImage } from "@/lib/productImages";
import { normalizeProductText, prepareProduct } from "@/lib/productSearch";

const CACHE_KEY = "makonim-product-catalog-v8";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const memoryCatalogs = new Map();
const pendingLoads = new Map();

function readCache(maxProducts) {
  if (maxProducts < 5000) return null;
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return cached && Date.now() - cached.savedAt < CACHE_TTL ? cached.products.map(prepareProduct) : null;
  } catch { return null; }
}

function buildCatalog(remoteProducts) {
  const unique = new Map();
  [...curatedProducts, ...israeliProducts, ...petProducts, ...remoteProducts].forEach(product => {
    if (!product?.name || !product?.category || typeof product.price !== "number") return;
    const key = `${normalizeProductText(product.name)}|${normalizeProductText(product.brand)}`;
    if (!unique.has(key)) {
      // Only the product's own image enters the catalog — and for branded products, only their real image
      const specific = product.image_url || (product.brand ? "" : getSpecificProductImage(product.name));
      unique.set(key, prepareProduct({
        ...product,
        image_url: specific,
        image_verified: Boolean(product.image_verified || specific)
      }));
    }
  });
  return [...unique.values()];
}

async function fetchCatalog(maxProducts) {
  let remote = [];
  try {
    // TODO: Fetch remote products from your new backend database
    // Mocking an empty array for now
    // remote = await newBackend.getProducts(Math.min(maxProducts, 5000));
    remote = [];
  } catch { /* curated catalog remains available offline */ }

  const products = buildCatalog(remote);
  if (maxProducts >= 5000) {
    try {
      const compact = products.map(({ name, category, brand, price, image_url, image_verified, curated }) => ({ name, category, brand, price, image_url, image_verified, curated }));
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), products: compact }));
    } catch { /* storage limits must not block search */ }
  }
  return products;
}

export async function loadAllProducts(maxProducts = 5000) {
  if (memoryCatalogs.has(maxProducts)) return memoryCatalogs.get(maxProducts);
  const cached = readCache(maxProducts);
  if (cached) { memoryCatalogs.set(maxProducts, cached); return cached; }
  if (!pendingLoads.has(maxProducts)) pendingLoads.set(maxProducts, fetchCatalog(maxProducts));
  const products = await pendingLoads.get(maxProducts);
  pendingLoads.delete(maxProducts);
  memoryCatalogs.set(maxProducts, products);
  return products;
}