// Name lookups keep every identifying word, percentage, flavour and size.
// Punctuation in a brand (אנג'ל/אנגל) is formatting, not a different brand.
export const photoWords = value => String(value || "").normalize("NFKC").toLowerCase()
  .replace(/[׳'״"]/g, "").replace(/[^\p{L}\p{N}.]+/gu, " ").trim().split(/\s+/).filter(Boolean);
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const percentages = value => [...String(value || "").matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)].map(match => Number(match[1].replace(",", ".")));

export function photoNameQuery(item) {
  const words = photoWords(item.name);
  if (!words.length) return null;
  const boundary = "[\\s,().%/\"'׳״-]";
  const pattern = words.map(word => `(?=.*(?:^|${boundary})${escape(word)}(?:${boundary}|$))`).join("");
  return { name: { $regex: `^${pattern}` } };
}

export function matchingPhotoRows(item, products) {
  const wanted = photoWords(item.name);
  const brand = photoWords(item.brand);
  const matches = products.filter(row => {
    const name = photoWords(row.name);
    const combined = new Set([...name, ...photoWords(row.brand)]);
    return wanted.every(word => combined.has(word)) && brand.every(word => combined.has(word))
      && percentages(item.name).every(value => percentages(row.name).includes(value))
      && (wanted.length >= 2 || brand.length || name.join(" ") === wanted.join(" "));
  }).sort((a, b) => photoWords(a.name).length - photoWords(b.name).length);
  // Alternatives are photos of this one chosen product, not other sizes/brands.
  const chosen = matches[0];
  return chosen ? matches.filter(row => String(row.barcode) === String(chosen.barcode)) : [];
}