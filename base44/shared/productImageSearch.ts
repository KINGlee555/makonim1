// מקורות תמונה אמיתיים למוצר: קודם תמונת הרשת לפי הברקוד (המוצר עצמו, מדויק),
// ואם אין — חיפוש לפי שם המוצר במאגר הפתוח. שני המקורות מחזירים תמונה של המוצר,
// לא איור ולא ניחוש.

const HEADERS = {
  "User-Agent": "MaKonim/1.0 (+https://makonim-share-shop.base44.app)",
  Accept: "application/json"
};

// כתובת התמונה של הרשת לפי הברקוד — הדפדפן יכול לטעון אותה ישירות,
// והשרת בודק שהיא באמת קיימת לפני שהיא נשמרת בקטלוג.
export const chainPhotoUrl = (barcode: string) => {
  const code = String(barcode || "").replace(/\D/g, "");
  return code.length >= 8 ? `https://img.rami-levy.co.il/product/${code}/large.jpg` : "";
};

// בדיקה בפועל: רק תמונה אמיתית (jpeg/png/webp) נחשבת. אין תמונה = כלום, בלי לזרוק שגיאה.
export async function probeChainPhoto(barcode: string): Promise<string> {
  const url = chainPhotoUrl(barcode);
  if (!url) return "";
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": HEADERS["User-Agent"], Range: "bytes=0-1024" },
      signal: AbortSignal.timeout(6000)
    });
    const type = response.headers.get("content-type") || "";
    return response.ok && type.startsWith("image/") ? url : "";
  } catch {
    return "";
  }
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": "\"", "&#39;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };

// שמות מקובצי המחירים מגיעים מקודדים ("בן&amp;גריס") — מחזירים שם קריא שאפשר גם לחפש בו
export function cleanProductName(name: string) {
  let text = String(name || "");
  for (let i = 0; i < 3; i++) {
    text = text.replace(/&(amp|quot|#39|apos|lt|gt|nbsp);/g, (match) => ENTITIES[match] || " ");
  }
  return text.replace(/<[^>]*>/g, " ").replace(/[\u200e\u200f]/g, " ").replace(/\s+/g, " ").trim();
}

// מילים שאינן מזהות את המוצר — מידות, כמויות וסימני פיסוק
const STOP = new Set(["גרם", "גר", "ג", "קילו", "ק\"ג", "קג", "מל", "מ\"ל", "ליטר", "ל", "יח", "יחידות", "אחוז", "משקל", "ארוז", "אריזה"]);

const tokens = (text: string) =>
  cleanProductName(text)
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((word) => word.replace(/^[\d.,%]+|[\d.,%]+$/g, ""))
    .filter((word) => word.length >= 3 && !STOP.has(word));

const shareCount = (candidate: string, wanted: string[]) => {
  const words = new Set(tokens(candidate));
  return wanted.filter((word) => words.has(word)).length;
};

const realPhoto = (product: any) =>
  String(product?.image_front_url || product?.image_url || "").replace(/^http:/, "https://");

// חיפוש לפי שם: נשאלים רק שמות מזהים (בלי מידות), ונבחרת תמונה רק כשהשמות חולקים
// לפחות שתי מילים — כדי לא להצמיד תמונה של מוצר אחר למוצר הזה.
export async function photoByName(name: string, brand = ""): Promise<string> {
  const wanted = tokens(name);
  if (wanted.length < 1) return "";
  const queries = [wanted.slice(0, 5).join(" ")];
  if (brand && tokens(brand).length) queries.push(`${brand} ${wanted[0]}`);
  for (const query of queries) {
    if (!query.trim()) continue;
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: "12",
      fields: "code,product_name,product_name_he,brands,image_front_url,image_url"
    });
    try {
      const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`, {
        headers: HEADERS,
        signal: AbortSignal.timeout(12000)
      });
      if (!response.ok) continue;
      const data = await response.json();
      let best = "";
      let bestScore = 1;
      for (const product of data?.products || []) {
        const image = realPhoto(product);
        if (!image) continue;
        const candidate = `${product.product_name_he || ""} ${product.product_name || ""}`;
        const score = shareCount(candidate, wanted);
        if (score > bestScore) {
          best = image;
          bestScore = score;
        }
      }
      if (best) return best;
    } catch {
      // מאגר שלא ענה — ממשיכים הלאה, והברקוד יישאר בלי תמונה עד ההרצה הבאה
    }
  }
  return "";
}