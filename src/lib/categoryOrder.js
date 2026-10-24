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

// מוצרים לפי סדר המסלול — כל מחלקה ברצף אחד, כדי לעבור על הסופר בלי לחזור אחורה
export function sortItemsByCategory(items, order = DEFAULT_CATEGORY_ORDER) {
  const rank = new Map(order.map((category, index) => [category, index]));
  return [...items].sort((a, b) => {
    const ia = rank.get(a.category || "אחר") ?? order.length;
    const ib = rank.get(b.category || "אחר") ?? order.length;
    return ia - ib;
  });
}

// מקבץ מוצרים לפי מחלקה בסדר המסלול בסופר — מעבר אחד על המוצרים ומיון של המחלקות בלבד
export function groupByCategoryOrder(products, order = DEFAULT_CATEGORY_ORDER) {
  const rank = new Map(order.map((category, index) => [category, index]));
  const groups = new Map();
  for (const product of products) {
    const category = product.category || "אחר";
    let group = groups.get(category);
    if (!group) {
      group = { category, rank: rank.get(category) ?? order.length, items: [] };
      groups.set(category, group);
    }
    group.items.push(product);
  }
  return [...groups.values()].sort((a, b) => a.rank - b.rank);
}