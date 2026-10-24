// Shared visual language for the colorful "market" design direction.
export const MARKET_ASSETS = {
  hero: "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/1e79adcf5_generated_97ce980e.jpg",
  pantry: "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/c92a375f2_generated_e4f5ed7e.jpg",
  meat: "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/7fd268a01_generated_d59e6a8b.jpg",
  produce: "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/3e214d124_generated_68839a79.jpg"
};

// Cycled per category so a section, its chip and its badge always share one color.
export const CATEGORY_TONES = [
  { text: "text-market-pink", chip: "bg-market-pink text-white", badge: "bg-market-pink text-white" },
  { text: "text-market-blue", chip: "bg-market-blue text-white", badge: "bg-market-blue text-white" },
  { text: "text-market-yellow-deep", chip: "bg-market-yellow text-market-ink", badge: "bg-market-yellow text-market-ink" },
  { text: "text-market-ink", chip: "bg-market-ink text-white", badge: "bg-market-ink text-white" }
];

export const CARD_TONES = ["bg-market-pink-soft", "bg-market-yellow-soft", "bg-market-blue-soft"];

export function categoryTone(index) {
  return CATEGORY_TONES[index % CATEGORY_TONES.length];
}

export function cardTone(index) {
  return CARD_TONES[index % CARD_TONES.length];
}

export function categoryImage(category) {
  const name = String(category || "");
  if (/בשר|דג|דגים|עוף|נקניק/.test(name)) return MARKET_ASSETS.meat;
  if (/פירות|ירק|תפוח|עגבנ|מלפפון|חסה|בננה|אבוקדו/.test(name)) return MARKET_ASSETS.produce;
  return MARKET_ASSETS.pantry;
}