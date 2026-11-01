// Preserve the complete identity, including size, flavour, percentages and chain prefixes.
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
export function isUploadedPhoto(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && (parsed.hostname === "media.base44.com" || parsed.hostname === "base44.app" || parsed.hostname === "base44.com") && /\/(?:images|files)\/public\//.test(parsed.pathname);
  } catch { return false; }
}
export function exactProductPhoto(url, barcode) {
  if (!url) return false;
  if (isUploadedPhoto(url)) return true; // A photo explicitly selected by a shopper/admin.
  const wanted = normalizedPhotoCode(barcode);
  return Boolean(wanted && wanted === normalizedPhotoCode(photoBarcode(url)));
}