import { israeliProducts } from "@/lib/israeliProducts";
import { getSpecificProductImage } from "@/lib/productImages";

const products = new Map(israeliProducts.map(product => [product.name, product]));
// Only these exact, unpackaged products use their own subject photo. Never
// match a word inside a packaged product (e.g. tomato sauce or banana yogurt).
const looseProducts = new Set([
  "עגבניות", "מלפפון", "בננה", "בצל", "גזר", "שום", "חציל", "קישוא",
  "ברוקולי", "חסה", "אבוקדו", "לימון", "תפוז", "תות שדה", "ענבים",
  "אננס", "מנגו", "קיווי", "רימון", "אגס", "תפוח אדמה", "תפוח אדום",
  "ביצים גדולות", "ביצים בינוניות", "ביצים חופש"
]);

export function photoBrand(name, brand, barcode) {
  return brand || (!barcode ? products.get(name)?.brand : "") || "";
}

export function basicProductPhoto(name, brand, barcode) {
  return !barcode && !brand && looseProducts.has(name) ? getSpecificProductImage(name) : "";
}