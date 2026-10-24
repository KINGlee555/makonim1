// איסוף עצמי — הסל המדויק לחנות שנבחרה, והקישור שממנו סוגרים את ההזמנה.
// הקישור הישיר קיים רק לרשתות שאתר ההזמנות שלהן ידוע; לכל השאר מפנים לחיפוש
// שמוביל לאתר ההזמנות שלהן — ולא לכתובת מנוחשת.
export const CHAIN_ORDER_LINKS = {
  shufersal: "https://www.shufersal.co.il/online/he/",
  rami_levy: "https://www.rami-levy.co.il/he/online/market"
};

// כתובת אתר ההזמנות של הרשת: ישירה אם היא ידועה, אחרת חיפוש שמגיע אליה.
export function orderLink(chain) {
  const direct = chain?.id ? CHAIN_ORDER_LINKS[chain.id] : "";
  if (direct) return direct;
  const query = `${chain?.name || ""} הזמנה אונליין איסוף עצמי`;
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
}

export function hasDirectOrderLink(chainId) {
  return !!CHAIN_ORDER_LINKS[chainId];
}

// הסל לחנות: כל פריט עם הכמות והמחיר שלה לפי מחירי המדף,
// ומה שלא נמצא במחירון שלה — כדי שנדע מה כדאי להוסיף בחנות עצמה.
export function basketForChain(rows, items, chainId) {
  const lines = [];
  for (const row of rows) {
    const entry = row.prices.find(price => price.chainId === chainId);
    if (!entry) continue;
    const item = items.find(listItem => (listItem.id || listItem.name) === row.id);
    lines.push({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      unit: item?.unit || "unit",
      unitPrice: entry.unit,
      total: entry.total
    });
  }
  const covered = new Set(lines.map(line => line.name));
  const missing = items.filter(item => !covered.has(item.name)).map(item => item.name);
  const total = lines.reduce((sum, line) => sum + line.total, 0);
  return { lines, missing, total };
}