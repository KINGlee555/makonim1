// Quantity, unit and cost rules for shopping-list items.
// Weight items are priced per kilogram: "gram" keeps the amount in grams, "kg" in kilograms.
export const isGram = (unit) => unit === "gram";
export const isWeight = (unit) => unit === "gram" || unit === "kg";

// The amount of an item in kilograms — chain prices are always quoted per kg.
export function weightInKg(item) {
  if (item?.unit === "gram") return (Number(item.quantity) || 0) / 1000;
  if (item?.unit === "kg") return Number(item.quantity) || 0;
  return 0;
}

// What the line really costs: grams are priced per kg, every other unit per item.
export function lineCost(item) {
  const price = Number(item?.price) || 0;
  const quantity = Number(item?.quantity) || 0;
  if (item?.unit === "gram") return (price * quantity) / 1000;
  return price * quantity;
}

// How much one tap on + / - changes.
export function quantityStep(unit) {
  return unit === "gram" ? 100 : 1;
}

// עד 10 ק״ג למוצר — טווח נוח לקנייה במשקל, בלי כמויות מוגזמות
export const MAX_WEIGHT_KG = 10;

// הכמות המקסימלית לפי היחידה: 10 ק״ג, 10000 גרם, או 99 ליחידות
export function maxQuantity(item) {
  if (item?.unit === "kg") return MAX_WEIGHT_KG;
  if (item?.unit === "gram") return MAX_WEIGHT_KG * 1000;
  return 99;
}

// הכמות נשמרת תמיד בתוך הטווח המותר
export function clampQuantity(item, quantity) {
  const value = Number(quantity);
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value, 0), maxQuantity(item));
}