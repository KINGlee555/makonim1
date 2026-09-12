export const CHAINS = [
  { name: "שופרסל", color: "bg-red-100 text-red-700" },
  { name: "רמי לוי", color: "bg-green-100 text-green-700" },
  { name: "מגא בול", color: "bg-blue-100 text-blue-700" },
  { name: "יוחננוף", color: "bg-orange-100 text-orange-700" },
  { name: "ויקטורי", color: "bg-purple-100 text-purple-700" },
  { name: "קשת טעמים", color: "bg-yellow-100 text-yellow-700" },
  { name: "חצי חינם", color: "bg-pink-100 text-pink-700" },
];

// Deterministic estimated price per chain — same product always gets the same spread
export function getSimulatedPrice(productName, basePrice, chainIndex) {
  const seed = productName.charCodeAt(0) + productName.charCodeAt(productName.length - 1) + chainIndex * 13;
  const variation = ((seed % 30) - 15) / 100;
  return basePrice * (1 + variation);
}