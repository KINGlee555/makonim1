import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function DarkModeToggle() {
  const t = useT();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      aria-label={dark ? t("header.lightMode") : t("header.darkMode")}
      title={dark ? t("header.lightMode") : t("header.darkMode")}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground hover:bg-accent/20 transition-colors"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}