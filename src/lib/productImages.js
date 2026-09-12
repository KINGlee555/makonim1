const photos = {
  produce: "https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=600",
  dairy: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=600",
  bread: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=600",
  meat: "https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=600",
  pantry: "https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=600",
  snacks: "https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=600",
  drinks: "https://images.pexels.com/photos/544961/pexels-photo-544961.jpeg?auto=compress&cs=tinysrgb&w=600",
  cleaning: "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=600",
  hygiene: "https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=600",
  frozen: "https://images.pexels.com/photos/4109943/pexels-photo-4109943.jpeg?auto=compress&cs=tinysrgb&w=600"
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