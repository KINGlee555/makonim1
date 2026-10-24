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