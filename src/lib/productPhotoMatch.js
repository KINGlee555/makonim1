import { normalizeProductText } from "@/lib/productSearch";

// Israeli brands users type into the list — a match means we must show that brand's real photo
export const KNOWN_BRANDS = [
  "תנובה", "טרה", "יטבתה", "שטראוס", "אסם", "עלית", "תלמה", "יופלה", "מילקי", "דנונה",
  "מולר", "עמק", "גד", "צוריאל", "מחלבות גד", "פרימור", "ספרינג", "נביעות", "מי עדן",
  "עין גדי", "קוקה קולה", "פפסי", "שוופס", "ג׳אמפ", "טעמן", "סוגת", "אחלה", "צבר",
  "יד מרדכי", "וילי פוד", "סנפרוסט", "עוף טוב", "זוגלובק", "טירת צבי", "מעדנות",
  "בשרי", "מטרנה", "סימילאק", "נוטרילון", "סנו", "ניקול", "פיירי", "בדין", "סנטה",
  "פמפרס", "האגיס", "טיטולים", "חוגלה", "ליל", "קרליין", "נקה", "הוואי", "כרמל",
  "ויסוצקי", "יהודה", "אלית", "מקדונלדס", "בייגל בייגל", "ברמן", "אנג׳ל", "דגני",
  "שמרית", "תפוגן", "מנטה", "פלדמן", "אלטמן", "סולגאר", "ד״ר פישר", "לייף",
];

const normalizedBrands = KNOWN_BRANDS.map(brand => ({ brand, key: normalizeProductText(brand) }));

export function detectBrand(name = "") {
  const value = normalizeProductText(name);
  if (!value) return "";
  // Longest match wins so "מחלבות גד" beats "גד"
  return normalizedBrands
    .filter(({ key }) => value.includes(key))
    .sort((a, b) => b.key.length - a.key.length)[0]?.brand || "";
}

function tokens(value) {
  return normalizeProductText(value).split(" ").filter(token => token.length > 1);
}

// Picks the catalog product whose real photo best represents the requested item (brand first, then wording)
export function pickBestPhoto(products = [], name = "", excludeUrl = "") {
  const brandKey = normalizeProductText(detectBrand(name));
  const wanted = tokens(name);
  let best = null;
  let bestScore = -1;

  for (const product of products) {
    if (!product?.image_url || product.image_url === excludeUrl) continue;
    const productText = normalizeProductText(`${product.name || ""} ${product.brand || ""}`);
    if (brandKey && !productText.includes(brandKey)) continue;
    let score = brandKey ? 40 : 0;
    for (const token of wanted) if (productText.includes(token)) score += 10;
    if (normalizeProductText(product.name) === normalizeProductText(name)) score += 25;
    if (score > bestScore) { bestScore = score; best = product; }
  }

  // With a brand in the name we only accept a same-brand photo — never a look-alike from another brand
  if (!best && brandKey) return null;
  return best || products.find(product => product.image_url && product.image_url !== excludeUrl) || null;
}