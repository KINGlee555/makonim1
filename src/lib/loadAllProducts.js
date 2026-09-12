import { base44 } from "@/api/base44Client";

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const CACHE_KEY = "makonim-product-catalog-v1";
const CACHE_TTL = 30 * 60 * 1000;
const memoryCatalogs = new Map();

function readStoredCatalog(maxProducts) {
  if (maxProducts < 10000) return null;
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
  if (!cached || Date.now() - cached.savedAt > CACHE_TTL) return null;
  return cached.products;
}

function storeCatalog(products) {
  const compact = products.map(({ name, category, brand, price, image_url }) => ({ name, category, brand, price, image_url }));
  localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), products: compact }));
}

async function loadPage(pageSize, skip) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await base44.entities.Product.list("-name", pageSize, skip);
    } catch (error) {
      const rateLimited = String(error?.message || error).includes("429") || String(error?.message || error).toLowerCase().includes("rate limit");
      if (!rateLimited || attempt === 4) throw error;
      await wait(attempt * 1000);
    }
  }
}

export async function loadAllProducts(maxProducts = 10000) {
  if (memoryCatalogs.has(maxProducts)) return memoryCatalogs.get(maxProducts);
  const stored = readStoredCatalog(maxProducts);
  if (stored) {
    memoryCatalogs.set(maxProducts, stored);
    return stored;
  }

  const products = [];
  const pageSize = 500;
  for (let skip = 0; skip < maxProducts; skip += pageSize) {
    const page = await loadPage(pageSize, skip);
    products.push(...page);
    if (page.length < pageSize) break;
    await wait(600);
  }

  memoryCatalogs.set(maxProducts, products);
  if (maxProducts >= 10000) storeCatalog(products);
  return products;
}