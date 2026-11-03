import { useEffect, useState } from "react";

// התקנת האפליקציה על מסך הבית: הדפדפן מציע זאת בעצמו (אנדרואיד ומחשב),
// ובאייפון אפשר רק דרך תפריט השיתוף — ולכן יש הסבר צעד אחר צעד.
const DISMISS_KEY = "mk_install_hidden";

const standaloneNow = () => {
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.navigator.standalone === true
    );
  } catch {
    return false;
  }
};

export const isIosDevice = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export default function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(standaloneNow);
  const [hidden, setHidden] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // מציגים את ההזמנה רק למי שעוד לא התקין — ולא למי שכבר בחר "לא עכשיו"
  const visible = !installed && !hidden;

  const install = async () => {
    if (!prompt) return false;
    prompt.prompt();
    const choice = await prompt.userChoice;
    setPrompt(null);
    if (choice?.outcome === "accepted") setInstalled(true);
    return choice?.outcome === "accepted";
  };

  const hide = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  };

  return { visible, canInstall: Boolean(prompt), isIos: isIosDevice(), install, hide };
}