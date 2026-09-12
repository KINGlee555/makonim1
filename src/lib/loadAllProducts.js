import { base44 } from "@/api/base44Client";

export async function loadAllProducts(maxProducts = 4000) {
  const products = [];
  const pageSize = 500;

  for (let skip = 0; skip < maxProducts; skip += pageSize) {
    const page = await base44.entities.Product.list("-name", pageSize, skip);
    products.push(...page);
    if (page.length < pageSize) break;
  }

  return products;
}