import { base44 } from "@/api/base44Client";

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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
  const products = [];
  const pageSize = 500;

  for (let skip = 0; skip < maxProducts; skip += pageSize) {
    const page = await loadPage(pageSize, skip);
    products.push(...page);
    if (page.length < pageSize) break;
    await wait(600);
  }

  return products;
}