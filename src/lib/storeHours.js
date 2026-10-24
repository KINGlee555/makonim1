// שעות פתיחה משוערות של רשתות המזון בישראל — מתאים לרוב הסניפים.
// המטרה: לדעת מהר מה פתוח עכשיו, ותמיד כדאי לוודא מול הסניף הקרוב.

// 0 = ראשון ... 5 = שישי, 6 = שבת
const WEEK = [
  [8, 21], // ראשון
  [8, 21],
  [8, 21],
  [8, 21],
  [8, 21], // חמישי
  [7.5, 15], // שישי — נסגר מוקדם
  null, // שבת
];

const clock = (hour) => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function storeStatus(now = new Date()) {
  const hours = WEEK[now.getDay()];
  if (!hours) return { open: false, label: "closedToday", time: "" };
  const [from, to] = hours;
  const current = now.getHours() + now.getMinutes() / 60;
  if (current < from) return { open: false, label: "opensAt", time: clock(from) };
  if (current >= to) return { open: false, label: "closed", time: "" };
  return { open: true, label: "openUntil", time: clock(to) };
}