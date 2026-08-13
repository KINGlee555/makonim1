// Local persistence for the user's display name, so it survives across
// sessions even if the server-side updateMe call fails or the user clears
// their session. The name is always restored to the server on next login.

const STORAGE_KEY = "makonim_user_name";

export function saveLocalName(name) {
  if (name) {
    try { localStorage.setItem(STORAGE_KEY, name); } catch {}
  }
}

export function loadLocalName() {
  try { return localStorage.getItem(STORAGE_KEY) || ""; } catch { return ""; }
}