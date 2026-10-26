import { useState } from "react";
import { base44 } from "@/api/base44Client";

// ערכת העיצוב של המשתמש — מקום אחד שמחזיק את הבחירה, כדי שכל המסכים והכפתורים
// יתנהגו אותו דבר. ברירת המחדל היא הערכה הרגועה והסולידית.
const KEY = "app_skin";
export const QUIET = "quiet";
export const POSTER = "poster";

export function isPosterSkin() {
  try {
    return localStorage.getItem(KEY) === POSTER;
  } catch {
    return false;
  }
}

export function applySkin(skin) {
  const poster = skin === POSTER;
  document.documentElement.classList.toggle("skin-poster", poster);
  try { localStorage.setItem(KEY, poster ? POSTER : QUIET); } catch {}
}

// הבחירה של המשתמש עצמו גוברת על מה שנשמר במכשיר — כך העיצוב עובר איתו בין מכשירים
export function applyUserSkin(user) {
  if (!user?.skin) return;
  applySkin(user.skin === POSTER ? POSTER : QUIET);
}

export function useSkin() {
  const [poster, setPoster] = useState(isPosterSkin);

  const choose = (skin) => {
    setPoster(skin === POSTER);
    applySkin(skin);
    base44.auth.updateMe({ skin: skin === POSTER ? POSTER : QUIET }).catch(() => {});
  };

  return { poster, choose };
}