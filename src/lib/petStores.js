// חנויות חיות מחמד — מה נטען אוטומטית עם מחירים בזמן אמת ומה אפשר לפתוח ולנווט אליו.
// "live" = החנות מפרסמת קטלוג פתוח שאנחנו קוראים ממנו מחיר, תמונה ומבצע.
// אתר ג'ונגל חוסם קריאה אוטומטית, ולכן הוא מופיע לנווט ולפתיחה באתר בלי מחירים.
export const PET_STORES = [
  { id: "anipet", name: "אניפט", live: true, site: "https://www.anipet.co.il", nav: "אניפט" },
  { id: "petbest", name: "פט-בסט", live: true, site: "https://petbest.co.il", nav: "פט בסט" },
  { id: "toppet", name: "טופ פט", live: true, site: "https://www.toppet.co.il", nav: "טופ פט" },
  { id: "petmarket", name: "פט מרקט", live: true, site: "https://www.petmarket.co.il", nav: "פט מרקט" },
  { id: "petpoint", name: "פט פוינט", live: true, site: "https://www.petpoint.co.il", nav: "פט פוינט" },
  { id: "petfastgo", name: "פטפסטגו", live: true, site: "https://www.petfastgo.co.il", nav: "פטפסטגו" },
  { id: "superpet", name: "סופר פט", live: true, site: "https://www.superpet.co.il", nav: "סופר פט" },
  { id: "jungle", name: "ג'ונגל", live: false, site: "https://www.jungle-club.co.il", nav: "ג'ונגל חיות מחמד" },
];

export const PET_CATEGORY = "חיות מחמד";

export const wazeUrl = (query) => `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;

export const mapsUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

// שקי מזון גדולים — 3 ק"ג ומעלה — מה שמחפשים פעם בכמה שבועות
export const isBigSize = (name) => {
  const match = String(name || "").match(/(\d+(?:[.,]\d+)?)\s*(ק["׳'’]?ג|קילו|קג|kg)/i);
  return match ? Number(match[1].replace(",", ".")) >= 3 : false;
};