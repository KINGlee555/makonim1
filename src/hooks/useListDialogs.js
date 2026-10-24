import { useCallback, useState } from "react";

// כל חלונות העזר של הרשימה במקום אחד: פותחים לפי שם, עם ערך אם צריך
// (למשל הפריט שמעריכים), וסוגרים לפי שם.
export function useListDialogs() {
  const [open, setOpen] = useState({});

  const show = useCallback((key, value = true) => {
    setOpen(prev => ({ ...prev, [key]: value }));
  }, []);

  const hide = useCallback((key) => {
    setOpen(prev => ({ ...prev, [key]: false }));
  }, []);

  // לחלונות של ספריית הדיאלוגים — open + onOpenChange
  const bind = useCallback((key) => ({
    open: !!open[key],
    onOpenChange: (value) => (value ? show(key) : hide(key)),
  }), [open, show, hide]);

  return { open, show, hide, bind };
}