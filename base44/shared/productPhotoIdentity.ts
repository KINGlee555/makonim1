// An existing URL is not evidence of a match. Compare its product code, never brand/category words.
export const photoIdentity = ({ barcode, name, brand }) => barcode
  ? `barcode:${String(barcode).trim()}`
  : `name:${String(name || "").normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ")}|${String(brand || "").trim()}`;
export const normalizedPhotoCode = value => /^\d{8,14}$/.test(String(value || "").trim())
  ? String(value).trim().padStart(14, "0") : "";
export function photoBarcode(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    if (parsed.hostname === "img.rami-levy.co.il") return parsed.pathname.match(/^\/product\/(\d+)\//)?.[1] || "";
    if (/^images\.open(food|beauty|petfood|products)facts\.org$/.test(parsed.hostname)) {
      return (parsed.pathname.match(/\/images\/products\/((?:\d+\/)+)/)?.[1] || "").replace(/\//g, "");
    }
    return "";
  } catch { return ""; }
}
export function exactProductPhoto(url, barcode, allowUpload = true) {
  try {
    const parsed = new URL(url);
    if (allowUpload && parsed.protocol === "https:" && ["media.base44.com", "base44.app", "base44.com"].includes(parsed.hostname) && /\/(?:images|files)\/public\//.test(parsed.pathname)) return true;
  } catch { return false; }
  const wanted = normalizedPhotoCode(barcode);
  return Boolean(wanted && wanted === normalizedPhotoCode(photoBarcode(url)));
}
export function barcodeAliases(barcode) {
  const value = String(barcode || "").trim();
  if (!normalizedPhotoCode(value)) return value ? [value] : [];
  const short = value.replace(/^0+/, "") || "0";
  return [...new Set([value, short, ...[12, 13, 14].filter(length => length >= short.length).map(length => short.padStart(length, "0"))])];
}