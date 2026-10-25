import { base44 } from "@/api/base44Client";

// כל מסכי הרשימה מבקשים את אותה היסטוריית קניות. כאן היא נטענת פעם אחת בלבד לכל רשימה,
// וכל השאר מקבלים את אותה תשובה — במקום עשר בקשות במקביל בפתיחת הרשימה.
const MAX_ROWS = 500;
const FRESH_MS = 15000;

const cache = new Map();
const watched = new Set();

// כל שינוי בהיסטוריה (מישהו סימן "קניתי") מבטל את הזיכרון — הבקשה הבאה מביאה נתונים טריים
function watch(listId) {
  if (watched.has(listId)) return;
  watched.add(listId);
  base44.entities.PurchaseHistory.subscribe((event) => {
    if (event.type === "delete" || event.data?.list_id === listId) cache.delete(listId);
  });
}

export function loadPurchaseHistory(listId, limit = MAX_ROWS) {
  if (!listId) return Promise.resolve([]);
  const rows = Math.min(Math.max(Number(limit) || MAX_ROWS, 1), MAX_ROWS);
  const entry = cache.get(listId);

  if (entry?.records && Date.now() - entry.at < FRESH_MS) return Promise.resolve(entry.records.slice(0, rows));
  if (entry?.pending) return entry.pending.then((records) => records.slice(0, rows));

  const pending = base44.entities.PurchaseHistory.filter({ list_id: listId }, "-created_date", MAX_ROWS)
    .then((records) => {
      cache.set(listId, { records, at: Date.now() });
      return records;
    })
    .catch(() => {
      cache.delete(listId);
      return [];
    });

  cache.set(listId, { pending });
  watch(listId);
  return pending.then((records) => records.slice(0, rows));
}