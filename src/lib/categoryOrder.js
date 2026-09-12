const KEY = "makonim-category-order";

export const DEFAULT_CATEGORY_ORDER = [
  "פירות וירקות",
  "לחם ומאפים",
  "מוצרי חלב",
  "בשר ודגים",
  "קפואים",
  "שימורים",
  "תבלינים",
  "חטיפים ומתוקים",
  "משקאות",
  "ניקיון",
  "היגיינה",
  "חיות מחמד",
  "אחר",
];

export function loadCategoryOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_CATEGORY_ORDER;
    const missing = DEFAULT_CATEGORY_ORDER.filter(c => !saved.includes(c));
    return [...saved, ...missing];
  } catch {
    return DEFAULT_CATEGORY_ORDER;
  }
}

export function saveCategoryOrder(order) {
  try {
    localStorage.setItem(KEY, JSON.stringify(order));
  } catch { /* storage limits must not block sorting */ }
}

export function sortByCategoryOrder(categories, order) {
  return [...categories].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
}