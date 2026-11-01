// Never strip a chain prefix into an unrelated national product code.
export const chainPhotoUrl = (barcode) => {
  const code = String(barcode || "").trim();
  if (!/^\d{8,14}$/.test(code)) return "";
  return `https://img.rami-levy.co.il/product/${code}/small.jpg`;
};