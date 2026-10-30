// תמונות מוצר אמיתיות לציוד ולמזון לחיות — תמונה אחת נכונה לכל סוג מוצר,
// כדי שכל פריט יראה את המוצר עצמו ולא תמונה של בעל חיים או של מוצר אחר.
const P = (id) => `https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/${id}_generated_image.png`;

const IMAGES = {
  dogFood: P("ff2518c30"),
  petCans: P("0d9f45949"),
  petTreats: P("706a84d57"),
  dogLeash: P("775ef497a"),
  dogCollar: P("adc838c34"),
  dogHarness: P("323e9f682"),
  poopBags: P("a0e2a04d2"),
  dogBed: P("b12ad2af1"),
  dogToys: P("a3db5d549"),
  grooming: P("99a9b128b"),
  puppyPads: P("02f55a37a"),
  catFood: P("6c3ebf7c4"),
  catLitter: P("ea34429f9"),
  litterBox: P("028a5a6ee"),
  scratchingPost: P("ea71bd5e5"),
  catToy: P("46c20cfb1"),
  catGrass: P("535db6a15"),
  birdSeed: P("ed8beb6da"),
  cuttlebone: P("7f65d36e8"),
  birdCage: P("c68d1343c"),
  fishFood: P("5fd6e7651"),
  aquariumFilter: P("a14aaac31"),
  aquariumDecor: P("9b6c7622d"),
  aquariumCare: P("bd5f55936"),
  smallPetFood: P("6477cf319"),
  bedding: P("05ba0b61f"),
  hay: P("4bb8c274a"),
  hamsterWheel: P("a5accbe22"),
  heatLamp: P("630512ee5"),
  petBowl: P("dc16a6c15"),
  petWaterer: P("402def2cd"),
  petCarrier: P("9c69335d3"),
  petWipes: P("63253748f"),
  petCare: P("d3e3ca71b"),
};

// התאמה מדויקת לפי שם המוצר — כל פריט ברשימת ציוד החיות
const BY_NAME = {
  "מזון יבש לכלבים": IMAGES.dogFood,
  "מזון יבש לגורים": IMAGES.dogFood,
  "שימורים לכלבים": IMAGES.petCans,
  "חטיף עצם לכלב": IMAGES.petTreats,
  "חטיפי אימון לכלבים": IMAGES.petTreats,
  "רצועה לכלב": IMAGES.dogLeash,
  "קולר לכלב": IMAGES.dogCollar,
  "רתמה לכלב": IMAGES.dogHarness,
  "שקיות איסוף צרכים": IMAGES.poopBags,
  "מיטה לכלב": IMAGES.dogBed,
  "צעצוע לעיסה לכלב": IMAGES.dogToys,
  "כדור לכלב": IMAGES.dogToys,
  "שמפו לכלבים": IMAGES.grooming,
  "מברשת לכלבים": IMAGES.grooming,
  "אמפולה נגד פרעושים לכלב": IMAGES.petCare,
  "מזרן ספיגה לגורים": IMAGES.puppyPads,
  "מזון יבש לחתולים": IMAGES.catFood,
  "מזון יבש לחתולים מסורסים": IMAGES.catFood,
  "שימורים לחתולים": IMAGES.petCans,
  "פאוץ׳ מזון לחתולים": IMAGES.petCans,
  "חטיף לחתולים": IMAGES.petTreats,
  "חול לחתולים": IMAGES.catLitter,
  "חול מתגבש לחתולים": IMAGES.catLitter,
  "ארגז חול לחתולים": IMAGES.litterBox,
  "כף לחול חתולים": IMAGES.litterBox,
  "עמוד גירוד לחתול": IMAGES.scratchingPost,
  "צעצוע נוצה לחתול": IMAGES.catToy,
  "דשא חתולים": IMAGES.catGrass,
  "שמפו לחתולים": IMAGES.grooming,
  "אמפולה נגד פרעושים לחתול": IMAGES.petCare,
  "מזון לתוכים": IMAGES.birdSeed,
  "מזון לכנריות": IMAGES.birdSeed,
  "גרעיני חמניות לציפורים": IMAGES.birdSeed,
  "אבן סיד לציפורים": IMAGES.cuttlebone,
  "חול לכלוב ציפורים": IMAGES.birdCage,
  "מתקן מים לכלוב": IMAGES.birdCage,
  "נדנדה לכלוב ציפורים": IMAGES.birdCage,
  "מזון לדגי אקווריום": IMAGES.fishFood,
  "מזון לדגי זהב": IMAGES.fishFood,
  "מתנע מים לאקווריום": IMAGES.aquariumCare,
  "מסנן לאקווריום": IMAGES.aquariumFilter,
  "חצץ לאקווריום": IMAGES.aquariumDecor,
  "צמח נוי לאקווריום": IMAGES.aquariumDecor,
  "מזון לאוגרים": IMAGES.smallPetFood,
  "מזון לארנבות": IMAGES.smallPetFood,
  "מזון לשרקנים": IMAGES.smallPetFood,
  "שבבי עץ לכלוב מכרסמים": IMAGES.bedding,
  "חציר לארנבות": IMAGES.hay,
  "גלגל ריצה לאוגר": IMAGES.hamsterWheel,
  "מזון לצבים": IMAGES.smallPetFood,
  "מנורת חום לזוחלים": IMAGES.heatLamp,
  "קערת אוכל לחיות מחמד": IMAGES.petBowl,
  "מתקן מים אוטומטי": IMAGES.petWaterer,
  "כלוב הובלה לחיות": IMAGES.petCarrier,
  "מגבונים לחיות מחמד": IMAGES.petWipes,
  "מסיר ריחות לחיות מחמד": IMAGES.petCare,
  "ויטמינים לחיות מחמד": IMAGES.petCare,
};

// מוצר חיה שנוסף ביד — לפי סוג המוצר שבשם, מהספציפי לכללי
const BY_KEYWORD = [
  [/שקיות איסוף|איסוף צרכים|צרכים/, IMAGES.poopBags],
  [/מזרן ספיגה|פיפי|הרגלה/, IMAGES.puppyPads],
  [/אמפולה|פרעוש|קרצי/, IMAGES.petCare],
  [/ויטמין|תוסף תזונה/, IMAGES.petCare],
  [/מסיר ריח|מנטרל ריח|מבשם/, IMAGES.petCare],
  [/מגבון/, IMAGES.petWipes],
  [/רתמה/, IMAGES.dogHarness],
  [/קולר/, IMAGES.dogCollar],
  [/רצועה/, IMAGES.dogLeash],
  [/מיטה|מזרן/, IMAGES.dogBed],
  [/שמפו|מברשת|מסרק|טיפוח/, IMAGES.grooming],
  [/נוצה|צעצוע לחתול|עכבר/, IMAGES.catToy],
  [/כדור|לעיסה|חבל|צעצוע/, IMAGES.dogToys],
  [/עצם|חטיף|פינוק|ביסקוויט/, IMAGES.petTreats],
  [/שימורים|פאוץ/, IMAGES.petCans],
  [/ארגז חול|כף/, IMAGES.litterBox],
  [/חול/, IMAGES.catLitter],
  [/גירוד/, IMAGES.scratchingPost],
  [/דשא/, IMAGES.catGrass],
  [/אבן סיד|סיד/, IMAGES.cuttlebone],
  [/נדנדה|כלוב ציפור|מתקן מים לכלוב/, IMAGES.birdCage],
  [/גרעינ|זרעים/, IMAGES.birdSeed],
  [/מסנן|פילטר/, IMAGES.aquariumFilter],
  [/חצץ|צמח/, IMAGES.aquariumDecor],
  [/מתנע|אנטי כלור|מטהר/, IMAGES.aquariumCare],
  [/שבבי עץ|נסורת/, IMAGES.bedding],
  [/חציר/, IMAGES.hay],
  [/גלגל/, IMAGES.hamsterWheel],
  [/מנורת חום|מנורה|זוחל|טרריום/, IMAGES.heatLamp],
  [/הובלה|נשיאה|carrier/, IMAGES.petCarrier],
  [/אוטומטי|מתקן מים/, IMAGES.petWaterer],
  [/קער/, IMAGES.petBowl],
  [/מזון.*חתול|חתול.*מזון|יבש לחתול/, IMAGES.catFood],
  [/מזון.*דג|דגים/, IMAGES.fishFood],
  [/מזון.*ציפור|תוכי|כנרי/, IMAGES.birdSeed],
  [/מזון.*אוגר|ארנב|שרקן|מכרסם|צב/, IMAGES.smallPetFood],
  [/מזון.*כלב|גור|כלב/, IMAGES.dogFood],
];

const normalize = (name) => String(name || "")
  .replace(/[\u200e\u200f]/g, " ")
  .replace(/[״"'`׳]/g, "")
  .replace(/\s+/g, " ")
  .trim();

// רק מוצרי חיות מקבלים את התמונות האלה — כדי שמוצר מזון או טואלטיקה רגילים
// לא יקבלו בטעות תמונה של ציוד לחיות
const PET_CONTEXT = /לכלב|לכלבים|לגור|לגורים|לחתול|לחתולים|חתול|כלב|חיות|לציפור|לציפורים|ציפור|לתוכי|לכנרי|לאקווריום|אקווריום|לדג|לדגים|לאוגר|לארנב|לשרקן|לצב|לזוחל|מכרסם|חציר|שבבי עץ/;

const NAMED = Object.fromEntries(Object.entries(BY_NAME).map(([key, value]) => [normalize(key), value]));

// התמונה של המוצר עצמו — תחילה לפי השם המדויק, ואם אין, לפי סוג המוצר
export function petPhotoFor(name) {
  const value = normalize(name);
  if (!value) return "";
  const exact = NAMED[value];
  if (exact) return exact;
  if (!PET_CONTEXT.test(value)) return "";
  const rule = BY_KEYWORD.find(([pattern]) => pattern.test(value));
  return rule ? rule[1] : "";
}

export { IMAGES as PET_IMAGES };