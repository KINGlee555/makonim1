// Israeli supermarket chains — shared across the app
export const SUPERMARKETS = [
  { name: "שופרסל", chain: "shufersal" },
  { name: "רמי לוי", chain: "rami_levy" },
  { name: "מגא בול", chain: "mega" },
  { name: "יוחנננוף", chain: "yochananof" },
  { name: "ויקטורי", chain: "victory" },
  { name: "קשת טעמים", chain: "keshet" },
  { name: "חצי חינם", chain: "hatzi_hinam" },
  { name: "אושר עד", chain: "osher_ad" },
  { name: "טיב טעם", chain: "tiv_taam" },
  { name: "יינות ביתן", chain: "yenot_bitan" },
  { name: "קואופ", chain: "coop" },
  { name: "סטוק", chain: "stock" },
  { name: "מחסני אוכל", chain: "machsanei_ochel" },
  { name: "דרך האוכל", chain: "derech_ha_ochel" },
  { name: "שוק העיר", chain: "shuk_ha_ir" },
];

export const SUPERMARKET_NAMES = SUPERMARKETS.map(s => s.name);

// Get preferred supermarket from localStorage
export function getPreferredSupermarket() {
  try { return localStorage.getItem("preferred_supermarket") || ""; } catch { return ""; }
}

export function setPreferredSupermarket(name) {
  try { localStorage.setItem("preferred_supermarket", name); } catch {}
}