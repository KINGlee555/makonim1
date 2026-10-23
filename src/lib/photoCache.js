// Remembers the photo that was matched for a product name, so the same item always
// shows the same accurate photo and no lookup has to run again on the next visit.
const KEY = "makonim_photo_cache";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LIMIT = 400;

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