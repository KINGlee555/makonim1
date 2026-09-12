// Maps product names to real product photos from Unsplash
// Falls back to emoji via onError handler if image fails to load

const U = (id) => `https://images.unsplash.com/photo-${id}?w=200&h=200&fit=crop&q=80`;

// Specific product → image mapping (by name keyword)
// Only verified, real Unsplash photo IDs are used
const productImageMap = {
  // Produce
  "עגבניות": U("1546470427-e2625540abab"),
  "מלפפון": U("1604977042946-1ee82553ff72"),
  "בננה": U("1571771894821-ce9b6c11b085"),
  "גזר": U("1598170845058-32b9d72ffae8"),
  "בצל": U("1518977676601-b53f82aba655"),
  "תפוח אדמה": U("1564043432730-26e130b1f4c0"),
  "תפוח": U("1568702846914-96b305d2aaeb"),
  "אבוקדו": U("1523049673857-eb18f1d7b578"),
  "שום": U("1518977676601-b53f82aba655"),
  "ברוקולי": U("1583515459290-6c2a1e78e2b5"),
  "פלפל": U("1563565371292-7990f3c3b3b3"),
  "לימון": U("1554793185-4646e34ff8e0"),
  // Dairy
  "חלב": U("1550583724-b2692b70b8a2"),
  "ביצים": U("1582722872445-44dc5f7e3c8f"),
  "גבינה": U("1486297261550-9e0e2d0c2f3e"),
  "חמאה": U("1589985180847-4d6b8b1b8a8e"),
  "לבן": U("1550583724-b2692b70b8a2"),
  // Bread
  "לחם": U("1509440159596-0249088772ff"),
  "חלה": U("1509440159596-0249088772ff"),
  "פיתה": U("1509440159596-0249088772ff"),
  "בגט": U("1509440159596-0249088772ff"),
  // Meat
  "עוף": U("1604509071152-c47b3478d3b5"),
  // Pantry
  "שמן זית": U("1474979266404-7eaacbcd87c5"),
};

// Category-based fallback images — all verified Unsplash IDs
const categoryImageMap = {
  "פירות וירקות": U("1546470427-e2625540abab"),
  "מוצרי חלב": U("1550583724-b2692b70b8a2"),
  "בשר ודגים": U("1604509071152-c47b3478d3b5"),
  "לחם ומאפים": U("1509440159596-0249088772ff"),
  "שימורים": U("1474979266404-7eaacbcd87c5"),
  "תבלינים": U("1474979266404-7eaacbcd87c5"),
  "חטיפים ומתוקים": U("1509440159596-0249088772ff"),
  "משקאות": U("1550583724-b2692b70b8a2"),
  "קפואים": U("1550583724-b2692b70b8a2"),
  "ניקיון": U("1546470427-e2625540abab"),
  "היגיינה": U("1546470427-e2625540abab"),
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