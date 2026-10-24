import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useT } from "@/lib/i18n";
import { uiPill } from "@/lib/minimalUi";
import { applyDarkTheme, isDarkTheme } from "@/lib/theme";

export default function DarkModeToggle({ pill = false }) {
  const t = useT();
  const [dark, setDark] = useState(isDarkTheme);

  useEffect(() => {
    applyDarkTheme(dark);
  }, [dark]);

  const label = dark ? t("header.lightMode") : t("header.darkMode");

  if (pill) {
    return (
      <button type="button" onClick={() => setDark(d => !d)} aria-label={label} title={label} className={uiPill}>
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={() => setDark(d => !d)}
      aria-label={label}
      title={label}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground hover:bg-accent/20 transition-colors"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}