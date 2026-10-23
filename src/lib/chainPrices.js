import { base44 } from "@/api/base44Client";

// Every chain that publishes an official price-transparency feed, in display order.
export const CHAINS = [
  { id: "shufersal", name: "שופרסל" },
  { id: "rami_levy", name: "רמי לוי" },
  { id: "yohananof", name: "יוחננוף" },
  { id: "osher_ad", name: "אושר עד" },
  { id: "tiv_taam", name: "טיב טעם" },
  { id: "keshet", name: "קשת טעמים" },
  { id: "fresh_market", name: "פרש מרקט" },
  { id: "stop_market", name: "סטופ מרקט" },
  { id: "politzer", name: "פוליצר" },
  { id: "salach_dabach", name: "סאלח דבאח" }
];

// The chains most products are sold at are asked for first, so the comparison shows
// real prices within seconds; the rest fill in right after.
export const FAST_CHAINS = ["shufersal", "rami_levy", "yohananof", "osher_ad"];
export const OTHER_CHAINS = CHAINS.map(chain => chain.id).filter(id => !FAST_CHAINS.includes(id));

// Real shelf prices for a basket: items with a barcode are matched exactly,
// the rest are matched by name against the chains' price files.
export async function fetchChainPrices(items, chains) {
  const response = await base44.functions.invoke("chainPrices", {
    items: items.map(item => ({ name: item.name, barcode: item.barcode || "" })),
    chains
  });
  return response.data || {};
}