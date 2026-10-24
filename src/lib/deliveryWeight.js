// Weight rules for the courier delivery option.
// Items measured by weight (gram / kg) count exactly; unit items use a stated estimate.
import { weightInKg } from "./units";

export const UNIT_ESTIMATE_KG = 1;
export const COURIER_LIMIT_KG = 12;

export function itemWeightKg(item) {
  const measured = weightInKg(item);
  if (measured > 0) return measured;
  return (Number(item?.quantity) || 0) * UNIT_ESTIMATE_KG;
}

export function totalWeightKg(items = []) {
  return items.reduce((sum, item) => sum + itemWeightKg(item), 0);
}

export function isOverCourierLimit(items = []) {
  return totalWeightKg(items) > COURIER_LIMIT_KG;
}