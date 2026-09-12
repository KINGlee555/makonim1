const finalLetters = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

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
  const terms = normalized.split(" ");
  return products
    .filter(product => (category === "all" || product.category === category) && terms.every(term => product._search.includes(term)))
    .map(product => ({ product, score: product._name === normalized ? 0 : product._name.startsWith(normalized) ? 1 : product._name.includes(normalized) ? 2 : 3 }))
    .sort((a, b) => a.score - b.score || (byPrice ? (a.product.price || Number.MAX_VALUE) - (b.product.price || Number.MAX_VALUE) : 0) || a.product.name.localeCompare(b.product.name, "he"))
    .slice(0, 24)
    .map(entry => entry.product);
}