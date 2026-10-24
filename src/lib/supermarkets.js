// Israeli supermarket chains — shared across the app
// רשתות שפתוחות גם בשבת מסומנות בשעות הפתיחה שלהן בשבת (רוב הסניפים) — כדי שאפשר למצוא אותן מהר
export const SUPERMARKETS = [
  { name: "שופרסל", chain: "shufersal" },
  { name: "רמי לוי", chain: "rami_levy" },
  { name: "מגא בול", chain: "mega" },
  { name: "יוחננוף", chain: "yohananof", shabbat: [8, 20] },
  { name: "ויקטורי", chain: "victory" },
  { name: "קשת טעמים", chain: "keshet" },
  { name: "חצי חינם", chain: "hatzi_hinam" },
  { name: "אושר עד", chain: "osher_ad" },
  { name: "טיב טעם", chain: "tiv_taam", shabbat: [8, 21] },
  { name: "AM:PM", chain: "am_pm", shabbat: [8, 22] },
  { name: "סיטי מרקט", chain: "city_market", shabbat: [8, 20] },
  { name: "סטופ מרקט", chain: "stop_market", shabbat: [8, 21] },
  { name: "פרש מרקט", chain: "fresh_market", shabbat: [8, 19] },
  { name: "זול ובגדול", chain: "zol_ve_gadol", shabbat: [8, 20] },
  { name: "סאלח דבאח", chain: "salach_dabach", shabbat: [8, 21] },
  { name: "סופר ספיר", chain: "super_sapir", shabbat: [8, 20] },
  { name: "שוק העיר", chain: "shuk_ha_ir", shabbat: [9, 20] },
  { name: "יינות ביתן", chain: "yenot_bitan" },
  { name: "קואופ", chain: "coop" },
  { name: "סטוק", chain: "stock" },
  { name: "מחסני אוכל", chain: "machsanei_ochel" },
  { name: "דרך האוכל", chain: "derech_ha_ochel" },
];

export const SUPERMARKET_NAMES = SUPERMARKETS.map(s => s.name);

// הרשתות שפתוחות בשבת — למי שמתכנן קנייה בסוף השבוע
export const SHABBAT_STORES = SUPERMARKETS.filter(store => store.shabbat);

// Get preferred supermarket from localStorage
export function getPreferredSupermarket() {
  try { return localStorage.getItem("preferred_supermarket") || ""; } catch { return ""; }
}

export function setPreferredSupermarket(name) {
  try { localStorage.setItem("preferred_supermarket", name); } catch {}
}