import { base44 } from "@/api/base44Client";

// תמונה אמיתית של המוצר לפי הברקוד שלו. הברקוד הוא המזהה המדויק, ולכן מה שחוזר
// מהשרת הוא הצילום של המוצר עצמו — או כלום, ואז נשאר האייקון של המוצר.
// ברקוד שכבר שאלנו עליו לא נשלח שוב באותה פתיחה.
const sessionPhotos = new Map();

export async function photoByBarcode(barcode) {
  const code = String(barcode || "").trim();
  if (!code) return "";
  if (sessionPhotos.has(code)) return sessionPhotos.get(code);
  try {
    const response = await base44.functions.invoke("productPhotos", { barcodes: [code] });
    const url = response?.data?.photos?.[code] || "";
    sessionPhotos.set(code, url);
    return url;
  } catch {
    return "";
  }
}