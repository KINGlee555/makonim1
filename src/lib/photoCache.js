// Remembers the photo that was matched for a product name, so the same item always
// shows the same accurate photo and no lookup has to run again on the next visit.
const KEY = "makonim_photo_cache";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
// שם שלא נמצאה לו תמונה נשמר לזמן קצר, כדי לא לחפש אותו שוב בכל פתיחה
const MISS_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const LIMIT = 600;

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function getCachedPhoto(name) {
  if (!name) return "";
  const entry = read()[name];
  if (!entry || !entry.url || Date.now() - entry.at > TTL_MS) return "";
  return entry.url;
}

export function cachePhoto(name, url) {
  if (!name || !url) return;
  try {
    const map = read();
    map[name] = { url, at: Date.now() };
    const trimmed = Object.entries(map).slice(-LIMIT);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    // Storage full or unavailable — the photo just isn't cached.
  }
}

// שם שחיפשנו לו תמונה ולא נמצאה — נזכור כדי לחסוך חיפוש חוזר
export function isPhotoMiss(name) {
  if (!name) return false;
  const entry = read()[name];
  return Boolean(entry?.miss && Date.now() - entry.at < MISS_TTL_MS);
}

export function cachePhotoMiss(name) {
  if (!name) return;
  try {
    const map = read();
    if (map[name]?.url) return;
    map[name] = { miss: true, at: Date.now() };
    const trimmed = Object.entries(map).slice(-LIMIT);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    // Storage full or unavailable — nothing to remember.
  }
}