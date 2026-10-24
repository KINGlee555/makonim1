// רשימת דוגמה לאורח — נתונים קבועים, בלי גישה למסד הנתונים, כדי שגם מי שלא נרשם
// יוכל לראות איך נראית רשימה משפחתית משותפת לפני שהוא פותח אחת משלו.

export const demoItems = [
  { name: "חלב 3%", category: "מוצרי חלב", emoji: "🥛", price: 6.9, quantity: 2 },
  { name: "קוטג׳ 5%", category: "מוצרי חלב", emoji: "🧀", price: 6.5, quantity: 2 },
  { name: "לחם אחיד פרוס", category: "לחם ומאפים", emoji: "🍞", price: 5.9, quantity: 1 },
  { name: "ביצים L", category: "מוצרי יסוד", emoji: "🥚", price: 22.9, quantity: 1 },
  { name: "עגבניות", category: "פירות וירקות", emoji: "🍅", price: 7.9, quantity: 1000, unit: "gram" },
  { name: "בננות", category: "פירות וירקות", emoji: "🍌", price: 7.9, quantity: 1000, unit: "gram" },
  { name: "עוף טרי", category: "בשר ועוף", emoji: "🍗", price: 29.9, quantity: 1000, unit: "gram" },
  { name: "שמן זית כתית", category: "מוצרי יסוד", emoji: "🫒", price: 34.9, quantity: 1 },
  { name: "נייר טואלט 32", category: "טואלטיקה", emoji: "🧻", price: 29.9, quantity: 1 },
];

export const demoMembers = ["דנה", "יוסי", "נועה"];

// הפער בין הרשת הזולה ליקרה ביותר בסל הדוגמה
export const demoSavings = { cheapestChain: "רמי לוי", factor: 0.88 };

export const lineCost = (item) =>
  (item.price || 0) * ((item.unit === "gram" ? item.quantity / 1000 : item.quantity) || 1);

export const demoBasketTotal = demoItems.reduce((sum, item) => sum + lineCost(item), 0);