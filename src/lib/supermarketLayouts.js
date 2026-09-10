// Israeli supermarket chain aisle layouts — categories ordered by typical store flow
// Source: common layout patterns of major Israeli chains (entrance → exit)

export const SUPERMARKET_CHAINS = [
  { id: "shufersal", name: "שופרסל", color: "bg-red-100 text-red-700" },
  { id: "rami_levy", name: "רמי לוי", color: "bg-green-100 text-green-700" },
  { id: "mega", name: "מגא בול", color: "bg-blue-100 text-blue-700" },
  { id: "yochananof", name: "יוחננוף", color: "bg-orange-100 text-orange-700" },
  { id: "victory", name: "ויקטורי", color: "bg-purple-100 text-purple-700" },
  { id: "keshet", name: "קשת טעמים", color: "bg-yellow-100 text-yellow-700" },
  { id: "hatzi_hinam", name: "חצי חינם", color: "bg-pink-100 text-pink-700" },
  { id: "osher_ad", name: "אושר עד", color: "bg-indigo-100 text-indigo-700" },
  { id: "tiv_taam", name: "טיב טעם", color: "bg-teal-100 text-teal-700" },
  { id: "yenot_bitan", name: "יינות ביתן", color: "bg-cyan-100 text-cyan-700" },
];

// Aisle order: entrance → exit (typical Israeli supermarket flow)
const AISLE_ORDER = [
  { aisle: 1, label: "כניסה — ירקות ופירות", categories: ["פירות וירקות", "ירקות ופירות", "פירות", "ירקות"] },
  { aisle: 2, label: "מאפים ולחם", categories: ["לחם ומאפים", "מאפים", "לחם"] },
  { aisle: 3, label: "מוצרי חלב וביצים", categories: ["מוצרי חלב", "חלב", "ביצים", "גבינות"] },
  { aisle: 4, label: "בשר ודגים", categories: ["בשר ודגים", "בשר", "דגים", "עוף"] },
  { aisle: 5, label: "שימורים וממרחים", categories: ["שימורים", "ממרחים", "חומוס", "טונה"] },
  { aisle: 6, label: "פסטה אורז ודגנים", categories: ["פסטה", "אורז", "דגנים", "קמח"] },
  { aisle: 7, label: "תבלינים ורטבים", categories: ["תבלינים", "רטבים", "שמן", "חומץ"] },
  { aisle: 8, label: "חטיפים ומתוקים", categories: ["חטיפים ומתוקים", "חטיפים", "מתוקים", "שוקולד"] },
  { aisle: 9, label: "משקאות", categories: ["משקאות", "מיץ", "קפה", "תה", "מים"] },
  { aisle: 10, label: "מקפיאים", categories: ["קפואים", "גלידות", "קפוא"] },
  { aisle: 11, label: "ניקיון", categories: ["ניקיון", "כביסה"] },
  { aisle: 12, label: "היגיינה ותינוק", categories: ["היגיינה", "תינוק", "תחבושות"] },
  { aisle: 13, label: "אחר", categories: ["אחר", ""] },
];

export function getAisleForCategory(category) {
  if (!category) return 13;
  for (const aisle of AISLE_ORDER) {
    if (aisle.categories.some(c => category.includes(c) || c.includes(category))) {
      return aisle.aisle;
    }
  }
  return 13;
}

export function getAisleLabel(aisleNum) {
  const aisle = AISLE_ORDER.find(a => a.aisle === aisleNum);
  return aisle ? aisle.label : "אחר";
}

export function sortItemsByAisle(items) {
  return [...items].sort((a, b) => {
    const aisleA = getAisleForCategory(a.category);
    const aisleB = getAisleForCategory(b.category);
    return aisleA - aisleB;
  });
}

export function groupItemsByAisle(items) {
  const groups = {};
  items.forEach(item => {
    const aisle = getAisleForCategory(item.category);
    if (!groups[aisle]) groups[aisle] = [];
    groups[aisle].push(item);
  });
  return Object.entries(groups).sort((a, b) => a[0] - b[0]);
}

export { AISLE_ORDER };