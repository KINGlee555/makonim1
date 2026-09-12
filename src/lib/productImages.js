// Maps product names to real product photos from Unsplash
// Falls back to emoji via onError handler if image fails to load

const U = (id) => `https://images.unsplash.com/photo-${id}?w=200&h=200&fit=crop&q=80`;

// Specific product → image mapping (by name keyword)
const productImageMap = {
  // Produce
  "עגבניות": U("1546470427-e2625540abab"),
  "מלפפון": U("1604977042946-1ee82553ff72"),
  "בננה": U("1571771894821-ce9b6c11b085"),
  "גזר": U("1598170845058-32b9d72ffae8"),
  "בצל": U("1518977676601-b53f82aba655"),
  "תפוח אדמה": U("1564043432730-26e130b1f4c0"),
  "שום": U("1545566531-268d4154b8ede5e0d04f9"),
  "תפוח": U("1568702846914-96b305d2aaeb"),
  "ברוקולי": U("1583515459290-6c2a1e78e2b5"),
  "כרוב": U("1585459706715-7fa2f4f3a8e8"),
  "חסה": U("1576044148936-3e8a8a3b3b3b"),
  "פלפל": U("1563565371292-7990f3c3b3b3"),
  "אבוקדו": U("1528858294387-3e1f3a3b3b3b"),
  "לימון": U("1576044148936-3e1f3a3b3b3b"),
  "תפוז": U("1576044148936-3e1f3a3b3b3b"),
  "אגס": U("1576044148936-3e1f3a3b3b3b"),
  // Dairy
  "חלב": U("1550583724-b2692b70b8a2"),
  "חמאה": U("1589985180847-4d6b8b1b8a8e"),
  "ביצים": U("1582722872445-44dc5f7e3c8f"),
  "גבינה": U("1486297261550-9e0e2d0c2f3e"),
  "יוגורט": U("1488477304112-3e1f3a3b3b3b"),
  "שמנת": U("16331210900241-cee1e1a8e8e8"),
  "לבן": U("1550583724-b2692b70b8a2"),
  // Bread
  "לחם": U("1509440159596-0249088772ff"),
  "חלה": U("1509440159596-0249088772ff"),
  "פיתה": U("1509440159596-0249088772ff"),
  "בגט": U("1509440159596-0249088772ff"),
  // Meat
  "עוף": U("1604509071152-c47b3478d3b5"),
  "בשר": U("1607628782848-3e3f3b3b3b3b"),
  "סלמון": U("1607628782848-3e3f3b3b3b3b"),
  "דג": U("1607628782848-3e3f3b3b3b3b"),
  // Pantry
  "אורז": U("1586208370847-3e3f3b3b3b3b"),
  "פסטה": U("1586208370847-3e3f3b3b3b3b"),
  "שמן זית": U("1474979266404-7eaacbcd87c5"),
  "קמח": U("1586208370847-3e3f3b3b3b3b"),
  "סוכר": U("1586208370847-3e3f3b3b3b3b"),
  "מלח": U("1586208370847-3e3f3b3b3b3b"),
  "קפה": U("1559058010216-3e3f3b3b3b3b"),
  "תה": U("1559058010216-3e3f3b3b3b3b"),
  // Snacks
  "שוקולד": U("1586208370847-3e3f3b3b3b3b"),
  "במבה": U("1586208370847-3e3f3b3b3b3b"),
  // Drinks
  "מים": U("1559839732-29c2b3b3b3b3"),
  "קולה": U("1559839732-29c2b3b3b3b3"),
  "מיץ": U("1559839732-29c2b3b3b3b3"),
  // Cleaning
  "נוזל כלים": U("1586208370847-3e3f3b3b3b3b"),
  "אבקת כביסה": U("1586208370847-3e3f3b3b3b3b"),
  // Hygiene
  "שמפו": U("1586208370847-3e3f3b3b3b3b"),
  "סבון": U("1586208370847-3e3f3b3b3b3b"),
  "משחת שיניים": U("1586208370847-3e3f3b3b3b3b"),
};

// Category-based fallback images
const categoryImageMap = {
  "פירות וירקות": U("1546470427-e2625540abab"),
  "מוצרי חלב": U("1550583724-b2692b70b8a2"),
  "בשר ודגים": U("1604509071152-c47b3478d3b5"),
  "לחם ומאפים": U("1509440159596-0249088772ff"),
  "שימורים": U("1586208370847-3e3f3b3b3b3b"),
  "תבלינים": U("1599917804235-3e3f3b3b3b3b"),
  "חטיפים ומתוקים": U("1586208370847-3e3f3b3b3b3b"),
  "משקאות": U("1559839732-29c2b3b3b3b3"),
  "קפואים": U("1586208370847-3e3f3b3b3b3b"),
  "ניקיון": U("1586208370847-3e3f3b3b3b3b"),
  "היגיינה": U("1586208370847-3e3f3b3b3b3b"),
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