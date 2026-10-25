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
  if (!entry || !entry.url || isBrokenPhoto(entry.url) || Date.now() - entry.at > TTL_MS) return "";
  return entry.url;
}

// כתובות תמונה שלא נטענו — לא מציגים אותן שוב, ומחפשים תמונה אחרת לאותו מוצר
const BROKEN_KEY = "makonim_broken_photos";
const BROKEN_LIMIT = 200;

export function isBrokenPhoto(url) {
  if (!url) return false;
  try {
    return Boolean(JSON.parse(localStorage.getItem(BROKEN_KEY) || "{}")[url]);
  } catch {
    return false;
  }
}

export function markPhotoBroken(url, name) {
  if (!url) return;
  try {
    const broken = JSON.parse(localStorage.getItem(BROKEN_KEY) || "{}");
    broken[url] = Date.now();
    localStorage.setItem(BROKEN_KEY, JSON.stringify(Object.fromEntries(Object.entries(broken).slice(-BROKEN_LIMIT))));
  } catch {
    // אין מקום לשמור — פשוט ננסה שוב בפעם הבאה
  }
  try {
    const map = read();
    if (name && map[name]?.url === url) {
      delete map[name];
      localStorage.setItem(KEY, JSON.stringify(map));
    }
  } catch {
    // מטמון השמות לא זמין — אין מה לנקות
  }
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