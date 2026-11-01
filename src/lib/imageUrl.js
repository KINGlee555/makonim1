// תמונה קלה: אותה תמונה בדיוק, בגודל שמתאים למה שבאמת מוצג על המסך.
// התמונות מהמאגרים הציבוריים מגיעות כברירת מחדל ברוחב 600 — כבד לטלפון,
// ולכן מבקשים מהשרת שלהם גרסה קטנה: פחות בתים, טעינה מהירה, אותו מוצר.
const THUMB_WIDTH = 240;

export function fastImageUrl(url, width = THUMB_WIDTH) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    if (host === "img.rami-levy.co.il") {
      parsed.pathname = parsed.pathname.replace(/\/(large|medium)\.jpg$/, "/small.jpg");
      return parsed.toString();
    }

    if (host.endsWith("images.pexels.com")) {
      parsed.searchParams.set("auto", "compress");
      parsed.searchParams.set("cs", "tinysrgb");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("h", String(width));
      parsed.searchParams.set("dpr", "1");
      return parsed.toString();
    }

    if (host.endsWith("images.unsplash.com")) {
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("h", String(width));
      parsed.searchParams.set("q", "70");
      return parsed.toString();
    }

    return url;
  } catch {
    return url;
  }
}