// מוצרים שאסור למכור לקטינים — אלכוהול, טבק וסיגריות.
// הזיהוי לפי שם המוצר וגם לפי המחלקה שלו, כי חלק מהמוצרים נקראים בשמות מותג בלבד.
const TOBACCO = /סיגר|טבק|נרגיל|מקטרת|ריזלה|אי[-\s]?סיג|iqos|glo(?![א-ת])|הסקה/;
const ALCOHOL = /וודקה|וויסקי|ויסקי|ברנדי|קוניאק|ערק|שמפניה|פרוסקו|ליקר|טקילה|מסקל|אפרול|מרטיני|אלכוהול|יין|יינות|בירה|בירות|סיידר|(?<![א-ת])רום(?![א-ת])|(?<![א-ת])ג'ין(?![א-ת])|(?<![א-ת])ג׳ין(?![א-ת])|משקה\s*חריף/;

export const AGE_CATEGORIES = ["אלכוהול", "סיגריות וטבק"];

export function restrictedKind(product = {}) {
  const text = `${product.name || ""} ${product.category || ""}`;
  if (TOBACCO.test(text)) return "tobacco";
  if (ALCOHOL.test(text)) return "alcohol";
  return null;
}

const AGE_OK_KEY = "mk_age_verified";

export function hasAgeConsent() {
  try {
    return localStorage.getItem(AGE_OK_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveAgeConsent() {
  try {
    localStorage.setItem(AGE_OK_KEY, "1");
  } catch {
    /* אין אחסון — נשאל שוב בפעם הבאה */
  }
}