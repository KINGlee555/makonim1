// Official chain logos (real brand logo files from Wikipedia/Wikimedia).
// Chains without a verified official logo file keep a neutral colored initial — never a made-up logo.
const LOGOS = {
  "שופרסל": { bg: "#e2231a", initials: "ש", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b7/%D7%9C%D7%95%D7%92%D7%95_%D7%A9%D7%95%D7%A4%D7%A8%D7%A1%D7%9C.svg" },
  "רמי לוי": { bg: "#0a8a3c", initials: "ר", logo: "https://upload.wikimedia.org/wikipedia/he/7/7a/RAMILEVI.png" },
  "מגא בול": { bg: "#1565c0", initials: "מ" },
  "יוחננוף": { bg: "#e07b00", initials: "י" },
  "יוחנננוף": { bg: "#e07b00", initials: "י" },
  "ויקטורי": { bg: "#7b1fa2", initials: "ו", logo: "https://upload.wikimedia.org/wikipedia/he/5/5d/%D7%A1%D7%9E%D7%9C%D7%99%D7%9C_%D7%95%D7%99%D7%A7%D7%98%D7%95%D7%A8%D7%99.svg" },
  "קשת טעמים": { bg: "#c2a000", initials: "ק", logo: "https://upload.wikimedia.org/wikipedia/he/d/d7/%D7%A7%D7%A9%D7%AA_%D7%98%D7%A2%D7%9E%D7%99%D7%9D.png" },
  "חצי חינם": { bg: "#d81b60", initials: "ח", logo: "https://upload.wikimedia.org/wikipedia/he/0/0f/Hazi-Hinam_logo.png" },
  "אושר עד": { bg: "#00796b", initials: "א", logo: "https://upload.wikimedia.org/wikipedia/he/1/19/%D7%90%D7%95%D7%A9%D7%A8_%D7%A2%D7%93.png" },
  "טיב טעם": { bg: "#5d4037", initials: "ט", logo: "https://upload.wikimedia.org/wikipedia/he/8/89/%D7%A1%D7%9E%D7%9C%D7%99%D7%9C_%D7%98%D7%99%D7%91_%D7%98%D7%A2%D7%9D_2006.svg" },
  "יינות ביתן": { bg: "#283593", initials: "יב", logo: "https://upload.wikimedia.org/wikipedia/he/b/b3/YeinotbitanLogo.png" },
  "קואופ": { bg: "#00838f", initials: "ק" },
  "סטוק": { bg: "#455a64", initials: "ס" },
  "מחסני אוכל": { bg: "#ef6c00", initials: "מא" },
  "דור אלון": { bg: "#c62828", initials: "דא" },
  "יילו": { bg: "#f9a825", initials: "י" },
  "קינג סטור": { bg: "#6a1b9a", initials: "ק" },
  "זול ובגדול": { bg: "#2e7d32", initials: "ז" },
  "סופר ספיר": { bg: "#0277bd", initials: "סס" },
  "מעיין 2000": { bg: "#00838f", initials: "מ" },
  "סיטי מרקט": { bg: "#455a64", initials: "סמ" },
  "שפע ברכת השם": { bg: "#ef6c00", initials: "ש" },
  "עוף והודו ברקת": { bg: "#795548", initials: "ב" },
  "משנת יוסף": { bg: "#33691e", initials: "מי" },
  "גוד פארם": { bg: "#00897b", initials: "ג" },
  "דרך האוכל": { bg: "#2e7d32", initials: "ד" },
  "שוק העיר": { bg: "#8d6e63", initials: "ש" },
};

export function getChainLogo(name = "") {
  return LOGOS[name.trim()] || { bg: "#0f9b8e", initials: name.trim().charAt(0) || "?" };
}