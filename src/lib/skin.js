import { useState } from "react";
import { base44 } from "@/api/base44Client";

// ערכת העיצוב של המשתמש — מקום אחד שמחזיק את הבחירה, כדי שכל המסכים והכפתורים
// יתנהגו אותו דבר. ברירת המחדל היא "פתק על המקרר": הרשימה נראית כמו דף כתוב ביד
// שתלוי בדלת המקרר. אפשר לבחור גם ערכה רגועה או כרזת שוק.
const KEY = "app_skin";
export const FRIDGE = "fridge";
export const QUIET = "quiet";
export const POSTER = "poster";
const SKINS = [FRIDGE, QUIET, POSTER];

export function getStoredSkin() {
  try {
    const stored = localStorage.getItem(KEY);
    return SKINS.includes(stored) ? stored : FRIDGE;
  } catch {
    return FRIDGE;
  }
}

export function isPosterSkin() {
  return getStoredSkin() === POSTER;
}

export function applySkin(skin) {
  const chosen = SKINS.includes(skin) ? skin : FRIDGE;
  const root = document.documentElement;
  root.classList.toggle("skin-poster", chosen === POSTER);
  root.classList.toggle("skin-fridge", chosen === FRIDGE);
  try { localStorage.setItem(KEY, chosen); } catch {}
}

// הבחירה של המשתמש עצמו גוברת על מה שנשמר במכשיר — כך העיצוב עובר איתו בין מכשירים
export function applyUserSkin(user) {
  applySkin(user?.skin && SKINS.includes(user.skin) ? user.skin : getStoredSkin());
}

export function useSkin() {
  const [skin, setSkin] = useState(getStoredSkin);

  const choose = (next) => {
    setSkin(next);
    applySkin(next);
    base44.auth.updateMe({ skin: next }).catch(() => {});
  };

  return { skin, poster: skin === POSTER, choose };
}