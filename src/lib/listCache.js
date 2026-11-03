// הרשימה האחרונה נשמרת מקומית — כך היא נפתחת מיד עם הכניסה לאפליקציה,
// עוד לפני שהנתונים המעודכנים מגיעים מהשרת ומחליפים אותם.
const KEY = "mk_cached_list";

export function readListCache(listId) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (!cache?.list || cache.list.id !== listId) return null;
    return cache;
  } catch {
    return null;
  }
}

export function writeListCache(listId, list, items = [], favorites = []) {
  if (!listId || !list?.id) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ list, items: items.slice(0, 200), favorites: favorites.slice(0, 100) }));
  } catch {
    /* אין מקום באחסון — לא חוסם */
  }
}

export function clearListCache() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* אין הרשאה לאחסון — לא חוסם */
  }
}