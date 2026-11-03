// טעינה מוקדמת של התמונות שיופיעו מיד בתוצאות — הבתים נכנסים למטמון הדפדפן
// עוד לפני שהכרטיסים נבנים, כך התמונות מופיעות ברגע שהתוצאות מוצגות.
const seen = new Set();

export default function preloadImages(urls = [], limit = 18) {
  if (!urls.length) return;
  urls.slice(0, limit).forEach((url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    const image = new Image();
    image.decoding = "async";
    image.src = url;
  });
}