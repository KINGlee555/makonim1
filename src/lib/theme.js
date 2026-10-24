// מצב כהה/בהיר — מקום אחד שמחזיק את ההגדרה, כדי שכל הכפתורים יתנהגו אותו דבר
export function isDarkTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function applyDarkTheme(dark) {
  document.documentElement.classList.toggle("dark", dark);
  try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
}