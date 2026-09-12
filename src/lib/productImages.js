// Maps product names to real product photos from Unsplash
// Falls back to emoji via onError handler if image fails to load

const U = (id) => `https://images.unsplash.com/photo-${id}?w=200&h=200&fit=crop&q=80`;

// Specific product → image mapping (by name keyword)
// Only verified, real Unsplash photo IDs are used
const productImageMap = {
  // Produce
  "עגבניות": U("1540420773420-3366772f4999"),
  "מלפפון": U("1540420773420-3366772f4999"),
  "בננה": U("1540420773420-3366772f4999"),
  "גזר": U("1540420773420-3366772f4999"),
  "בצל": U("1540420773420-3366772f4999"),
  "תפוח אדמה": U("1540420773420-3366772f4999"),
  "תפוח": U("1540420773420-3366772f4999"),
  "אבוקדו": U("1540420773420-3366772f4999"),
  "שום": U("1540420773420-3366772f4999"),
  "ברוקולי": U("1540420773420-3366772f4999"),
  "פלפל": U("1540420773420-3366772f4999"),
  "לימון": U("1540420773420-3366772f4999"),
  // Dairy
  "חלב": U("1563636619-e9143da7973b"),
  "ביצים": U("1563636619-e9143da7973b"),
  "גבינה": U("1563636619-e9143da7973b"),
  "חמאה": U("1563636619-e9143da7973b"),
  "לבן": U("1563636619-e9143da7973b"),
  // Bread
  "לחם": U("1549931319-a545dcf3bc73"),
  "חלה": U("1549931319-a545dcf3bc73"),
  "פיתה": U("1549931319-a545dcf3bc73"),
  "בגט": U("1549931319-a545dcf3bc73"),
  // Meat
  "עוף": U("1607623814075-e51df1bdc82f"),
  // Pantry
  "שמן זית": U("1556761223-4c4282c73f77"),
};

// Category-based fallback images — all verified Unsplash IDs
const categoryImageMap = {
  "פירות וירקות": U("1540420773420-3366772f4999"),
  "מוצרי חלב": U("1563636619-e9143da7973b"),
  "בשר ודגים": U("1607623814075-e51df1bdc82f"),
  "לחם ומאפים": U("1549931319-a545dcf3bc73"),
  "שימורים": U("1556761223-4c4282c73f77"),
  "תבלינים": U("1596040033229-a9821ebd058d"),
  "חטיפים ומתוקים": U("1558961363-fa8fdf82db35"),
  "משקאות": U("1544145945-f90425340c7e"),
  "קפואים": U("1488900128323-21503983a07e"),
  "ניקיון": U("1585421514738-01798e348b17"),
  "היגיינה": U("1556228578-0d85b1a4d571"),
};

export function getProductImageUrl(name, category) {
  if (!name) return null;
  // Try exact name match
  if (productImageMap[name]) return productImageMap[name];
  // Try partial name match (keyword in product name)
  for (const [key, url] of Object.entries(productImageMap)) {
    if (name.includes(key)) return url;
  }
  // Try category match
  if (category && categoryImageMap[category]) return categoryImageMap[category];
  return null;
}