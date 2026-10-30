// פיצוץ קונפטי קטן כשמסמנים מוצר כנקנה — שמחה של רגע, בלי להאט את המסך.
// הספרייה נטענת רק בלחיצה הראשונה, ומי שביקש פחות תנועה פשוט לא מקבל אותה.
export async function celebrate(element) {
  if (typeof window === "undefined") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = element?.getBoundingClientRect?.();
  const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
  const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.65;

  try {
    const mod = await import("canvas-confetti");
    const confetti = mod.default || mod;
    confetti({
      particleCount: 40,
      spread: 60,
      startVelocity: 26,
      gravity: 0.9,
      decay: 0.9,
      scalar: 0.8,
      ticks: 110,
      origin: { x, y },
      colors: ["#FFD400", "#FF3B5D", "#0B3A4D", "#ffffff"]
    });
  } catch {
    // אין קונפטי — הסימון עצמו כבר קרה
  }
}