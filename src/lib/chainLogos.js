// Visual mark for each supermarket chain — brand-like colors + short initials
const LOGOS = {
  "שופרסל": { bg: "#e2231a", initials: "ש" },
  "רמי לוי": { bg: "#0a8a3c", initials: "ר" },
  "מגא בול": { bg: "#1565c0", initials: "מ" },
  "יוחננוף": { bg: "#e07b00", initials: "י" },
  "יוחנננוף": { bg: "#e07b00", initials: "י" },
  "ויקטורי": { bg: "#7b1fa2", initials: "ו" },
  "קשת טעמים": { bg: "#c2a000", initials: "ק" },
  "חצי חינם": { bg: "#d81b60", initials: "ח" },
  "אושר עד": { bg: "#00796b", initials: "א" },
  "טיב טעם": { bg: "#5d4037", initials: "ט" },
  "יינות ביתן": { bg: "#283593", initials: "יב" },
  "קואופ": { bg: "#00838f", initials: "ק" },
  "סטוק": { bg: "#455a64", initials: "ס" },
  "מחסני אוכל": { bg: "#ef6c00", initials: "מא" },
  "דרך האוכל": { bg: "#2e7d32", initials: "ד" },
  "שוק העיר": { bg: "#8d6e63", initials: "ש" },
};

export function getChainLogo(name = "") {
  return LOGOS[name.trim()] || { bg: "#0f9b8e", initials: name.trim().charAt(0) || "?" };
}