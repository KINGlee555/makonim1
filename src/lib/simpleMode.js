import { useEffect, useState } from "react";

const KEY = "simpleMode";
const EVENT = "simplemodechange";

export const isSimpleMode = () => localStorage.getItem(KEY) === "true";

export const setSimpleMode = (on) => {
  localStorage.setItem(KEY, on ? "true" : "false");
  window.dispatchEvent(new Event(EVENT));
};

// מצב פשוט — הרשימה והפעולות הראשיות בלבד; כל השאר נשאר מאחורי "עוד".
// הבחירה נשמרת במכשיר, וכל המסכים מתעדכנים יחד.
export function useSimpleMode() {
  const [simple, setSimple] = useState(isSimpleMode);

  useEffect(() => {
    const sync = () => setSimple(isSimpleMode());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  return [simple, setSimpleMode];
}