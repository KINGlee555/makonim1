import { useState } from "react";

// User's skin preference — one place to hold the selection so all screens and buttons
// behave the same. Default is the quiet, solid skin.
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

// The user's own choice overrides what's saved on the device — so the design moves with them between devices
export function applyUserSkin(user) {
  if (!user?.skin) return;
  applySkin(user.skin === POSTER ? POSTER : QUIET);
}

export function useSkin() {
  const [poster, setPoster] = useState(isPosterSkin);

  const choose = (skin) => {
    setPoster(skin === POSTER);
    applySkin(skin);

    // TODO: Update user's skin preference in your new backend database
    // Example: newBackend.updateUserPreferences({ skin: skin === POSTER ? POSTER : QUIET })
  };

  return { poster, choose };
}