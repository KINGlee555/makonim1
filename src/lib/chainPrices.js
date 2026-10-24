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
  { id: "salach_dabach", name: "סאלח דבאח" },
  { id: "dor_alon", name: "דור אלון" },
  { id: "yilo", name: "יילו" },
  { id: "king_store", name: "קינג סטור" },
  { id: "zol_ve_gadol", name: "זול ובגדול" },
  { id: "super_sapir", name: "סופר ספיר" },
  { id: "maayan_2000", name: "מעיין 2000" },
  { id: "city_market", name: "סיטי מרקט" },
  { id: "shuk_hair", name: "שוק העיר" },
  { id: "shefa_berkat_hashem", name: "שפע ברכת השם" },
  { id: "of_ve_hodu_bareket", name: "עוף והודו ברקת" },
  { id: "mishnat_yosef", name: "משנת יוסף" },
  { id: "good_pharm", name: "גוד פארם" }
];

// The chains most products are sold at are asked for first, so the comparison shows
// real prices within seconds; the nationwide chains fill in right after, and the smaller
// chains — they all share one price portal — come last.
export const FAST_CHAINS = ["shufersal", "rami_levy", "yohananof", "osher_ad"];
export const MORE_CHAINS = ["king_store", "zol_ve_gadol", "super_sapir", "maayan_2000", "city_market", "shuk_hair", "shefa_berkat_hashem", "of_ve_hodu_bareket", "mishnat_yosef", "good_pharm"];
export const OTHER_CHAINS = CHAINS.map(chain => chain.id).filter(id => !FAST_CHAINS.includes(id) && !MORE_CHAINS.includes(id));

// Real shelf prices for a basket: items with a barcode are matched exactly,
// the rest are matched by name against the chains' price files.
export async function fetchChainPrices(items, chains) {
  const response = await base44.functions.invoke("chainPrices", {
    items: items.map(item => ({ name: item.name, barcode: item.barcode || "" })),
    chains
  });
  return response.data || {};
}