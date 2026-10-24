// חנויות חיות מחמד — מה נטען אוטומטית ומה אפשר לפתוח ולנווט אליו.
// אניפט מפרסמת את הקטלוג שלה באופן פתוח; אתר ג'ונגל חוסם קריאה אוטומטית,
// ולכן הוא מופיע לנווט ולפתיחה באתר בלי מחירים.
export const PET_STORES = [
  { id: "anipet", name: "אניפט", live: true, site: "https://www.anipet.co.il", nav: "אניפט" },
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