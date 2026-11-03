// הסניפים סביבך לפי מפת הרשת הפתוחה (OpenStreetMap) — שם, מרחק ושעות אמת כשיש.
// בלי מפתח ובלי עלות, ונשמר לשש שעות במכשיר כדי לא לשאול את המיקום בכל פתיחה.

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const CACHE_KEY = "makonim-nearby-branches-v1";
const CACHE_MS = 6 * 60 * 60 * 1000;

export function positionNow() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("no-geolocation"));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      reject,
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  });
}

export function distanceKm(a, b) {
  const R = 6371;
  const rad = degrees => (degrees * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return cached && Date.now() - cached.at < CACHE_MS ? cached.branches : null;
  } catch {
    return null;
  }
}

function writeCache(branches) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), branches })); } catch {}
}

// רשימת הסופרים הקרובים, מהקרוב לרחוק
export async function nearbyBranches() {
  const cached = readCache();
  if (cached) return cached;

  const here = await positionNow();
  const query = `[out:json][timeout:12];node["shop"="supermarket"](around:4000,${here.lat},${here.lon});out 40;`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let data;
  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    data = await response.json();
  } finally {
    clearTimeout(timer);
  }

  const branches = (data?.elements || [])
    .filter(element => element?.tags?.name)
    .map(element => ({
      name: element.tags.name,
      brand: element.tags.brand || element.tags.operator || "",
      hours: element.tags.opening_hours || "",
      distanceKm: distanceKm(here, { lat: element.lat, lon: element.lon }),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 12);

  writeCache(branches);
  return branches;
}