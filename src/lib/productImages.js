const pexels = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

const exactPhotos = [
  [/עגבני/, pexels(1391489)],
  [/מלפפון/, pexels(2329440)],
  [/תפוח אדמה|תפוחי אדמה/, pexels(2286776)],
  [/תפוח/, pexels(209439)],
  [/בננ/, "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80"],
  [/גזר/, pexels(143133)],
  [/בצל/, pexels(4197447)],
  [/שום/, pexels(1392585)],
  [/פלפל/, pexels(2893635)],
  [/חציל/, pexels(321551)],
  [/קישוא|זוקיני/, pexels(128420)],
  [/ברוקולי/, pexels(1359326)],
  [/כרובית/, pexels(6316515)],
  [/חסה/, pexels(1199562)],
  [/פטרי/, pexels(36438)],
  [/אבוקדו/, pexels(557659)],
  [/לימון|ליים/, pexels(1414110)],
  [/תפוז|מנדרינה|אשכולית/, pexels(161559)],
  [/תות/, pexels(46174)],
  [/ענב/, pexels(708777)],
  [/אבטיח/, pexels(1313267)],
  [/אננס/, pexels(947879)],
  [/מנגו/, pexels(2294471)],
  [/קיווי/, pexels(51312)],
  [/רימון/, pexels(65256)],
  [/אגס/, pexels(568471)],
  [/אפרסק/, pexels(1268122)],
  [/דובדב/, pexels(162689)],
  [/נענע|פטרוזיליה|כוסברה|שמיר|בזיליקום|רוזמרין|תימין/, pexels(606540)],
  [/לחם|חלה|פיתה|בגט/, pexels(1775043)],
  [/ביצ/, pexels(162712)],
  [/חלב(?!ון)|יוגורט/, pexels(248412)]
];

export function getProductImageUrl(name = "") {
  const value = name.toLowerCase();
  return exactPhotos.find(([pattern]) => pattern.test(value))?.[1] || "";
}