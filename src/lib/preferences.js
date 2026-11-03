import { applyDarkTheme, isDarkTheme } from "@/lib/theme";
import { applySkin, getStoredSkin } from "@/lib/skin";

const RTL_LANGUAGES = ["he", "ar"];

// כל מה שהמשתמש בחר במכשיר מוחל מיד עם עליית האפליקציה —
// מצב כהה/בהיר, מצב גדול ונוח, שפה וכיוון — לפני שהמסך הראשון מצויר.
export function applyStoredPreferences() {
  applyDarkTheme(isDarkTheme());
  applySkin(getStoredSkin());
  try {
    document.documentElement.classList.toggle("easy-mode", localStorage.getItem("easyMode") === "true");
    const lang = localStorage.getItem("app_language") || "he";
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
  } catch {
    /* אין הרשאה לאחסון — לא חוסם */
  }
}