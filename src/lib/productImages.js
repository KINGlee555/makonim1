const photos = {
  produce: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
  dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
  bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  meat: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80",
  pantry: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=600&q=80",
  snacks: "https://images.unsplash.com/photo-1621939514649-280e2aa9454?auto=format&fit=crop&w=600&q=80",
  drinks: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
  cleaning: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
  hygiene: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
  frozen: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=600&q=80"
};

const categoryPhotos = {
  "פירות וירקות": photos.produce, "מוצרי חלב": photos.dairy, "לחם ומאפים": photos.bread,
  "בשר ודגים": photos.meat, "שימורים": photos.pantry, "תבלינים": photos.pantry,
  "חטיפים ומתוקים": photos.snacks, "משקאות": photos.drinks, "ניקיון": photos.cleaning,
  "היגיינה": photos.hygiene, "קפואים": photos.frozen
};

export function getProductImageUrl(name = "", category = "") {
  const value = name.toLowerCase();
  if (/חלב|גבינ|יוגורט|קוטג|חמאה|ביצ/.test(value)) return photos.dairy;
  if (/לחם|חלה|פיתה|בגט|בורקס|קרואסון/.test(value)) return photos.bread;
  if (/עוף|בשר|דג|סלמון|טונה|נקניק|שניצל/.test(value)) return photos.meat;
  if (/קולה|מים|מיץ|קפה|תה|בירה|יין|משקה/.test(value)) return photos.drinks;
  if (/כביסה|ניקוי|כלים|טואלט|מגבות|שקיות|ספוג/.test(value)) return photos.cleaning;
  if (/שמפו|סבון|קרם|שיניים|דאודורנט|חיתול|מגבונים/.test(value)) return photos.hygiene;
  return categoryPhotos[category] || photos.pantry;
}