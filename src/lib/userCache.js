// זיהוי מיידי מהמכשיר: פרטי המשתמש והגדרות האפליקציה נשמרים מקומית,
// כדי שהאפליקציה תעלה מיד עם השם וההעדפות של המשתמש — בלי להמתין לשרת.
import { loadLocalName } from "@/lib/userName";

const USER_KEY = "mk_cached_user";
const SETTINGS_KEY = "mk_cached_settings";

// שומרים רק את מה שהמסכים משתמשים בו בפועל
const pickUser = (user) => ({
  id: user.id,
  email: user.email || "",
  full_name: user.full_name || "",
  role: user.role || "user",
});

export function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user?.id) return null;
    return { ...user, full_name: user.full_name || loadLocalName() };
  } catch {
    return null;
  }
}

export function writeCachedUser(user) {
  if (!user?.id) return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(pickUser(user)));
  } catch {
    /* אין הרשאה לאחסון — לא חוסם */
  }
}

export function clearCachedUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* אין הרשאה לאחסון — לא חוסם */
  }
}

export function readCachedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCachedSettings(settings) {
  if (!settings) return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* אין הרשאה לאחסון — לא חוסם */
  }
}