// תמונת התוצרת של כל מחלקה בראש המקטע — לחם, חלב ובשר; כל מחלקה אחרת מקבלת את תמונת השוק.
const BREAD = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/302bf9214_generated_37acb22e.jpg";
const DAIRY = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/7cdd7525f_generated_f627f6d7.jpg";
const MEAT = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/6ce2fb40c_generated_4a46c5ac.jpg";
const MARKET = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/41f073a97_generated_b58619a5.jpg";

export function posterPhoto(category = "") {
  const name = String(category);
  if (/לחם|מאפי|מאפה|בגט|פית/.test(name)) return BREAD;
  if (/חלב|גבינ|יוגורט|ביצ|שמנת/.test(name)) return DAIRY;
  if (/בשר|עוף|דגים|נקניק|הודו/.test(name)) return MEAT;
  return MARKET;
}