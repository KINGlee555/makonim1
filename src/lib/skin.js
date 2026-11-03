// עיצוב אחד לכל האפליקציה — לא בוחרים ערכה, כולם רואים את אותו מסך רגוע.
// הפונקציות נשארו כדי שטעינת האפליקציה תמיד תנקה ערכות ישנות שנשמרו במכשיר.
export function getStoredSkin() {
  return "quiet";
}

export function isPosterSkin() {
  return false;
}

export function applySkin() {
  const root = document.documentElement;
  root.classList.remove("skin-poster", "skin-fridge");
  try { localStorage.removeItem("app_skin"); } catch { /* אין הרשאה לאחסון — לא חוסם */ }
}

export function applyUserSkin() {
  applySkin();
}