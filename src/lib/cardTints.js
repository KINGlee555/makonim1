// גוון הכרטיס נגזר מהמחלקה של המוצר — חלב בתכלת, לחם ומאפים בצהוב חיוור, בשר וירקות בירוק רך
const TINTS = [
  { className: "mkc-tint-dairy", words: ["חלב", "גבינ", "יוגורט", "קוטג", "שמנת", "ביצים", "מעדנ"] },
  { className: "mkc-tint-bread", words: ["לחם", "מאפי", "עוג", "דגנ", "חטיפ", "קרקר", "פסטה", "אורז", "קמח", "ביסקוויט"] },
  { className: "mkc-tint-fresh", words: ["בשר", "דג", "עוף", "ירק", "פרי", "סלט", "טרי"] },
];

export function cardTint(category) {
  const value = String(category || "");
  const match = TINTS.find(tint => tint.words.some(word => value.includes(word)));
  return match ? match.className : "mkc-tint-fresh";
}