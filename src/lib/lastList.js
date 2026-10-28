// הרשימה האחרונה שנפתחה במכשיר — כדי שניווט בין המסכים יחזיר תמיד לרשימה שלי
const KEY = "makonim_last_list";

export function saveLastList(listId) {
  if (!listId) return;
  try { localStorage.setItem(KEY, String(listId)); } catch {}
}

export function lastListId() {
  try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
}

// לאן לחזור: הרשימה האחרונה, ואם עוד אין — מסך הבית שפותח את הרשימה שלי
export const lastListPath = () => {
  const id = lastListId();
  return id ? `/list/${id}` : "/";
};