// תמונת המוצר של הרשת לפי הברקוד — נטענת ישירות בדפדפן, בלי המתנה לשרת.
// אם אין תמונה לברקוד הזה התמונה לא נטענת, והרכיב עובר לתמונה של סוג המוצר.
export const chainPhotoUrl = (barcode) => {
  const code = String(barcode || "").replace(/\D/g, "");
  return code.length >= 8 ? `https://img.rami-levy.co.il/product/${code}/large.jpg` : "";
};