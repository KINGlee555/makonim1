import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { useT } from "@/lib/i18n";
import { uiPill } from "@/lib/minimalUi";

export default function EasyModeToggle({ pill = false }) {
  const t = useT();
  const [easy, setEasy] = useState(() => localStorage.getItem("easyMode") === "true");

  useEffect(() => {
    if (easy) {
      document.documentElement.classList.add("easy-mode");
      localStorage.setItem("easyMode", "true");
    } else {
      document.documentElement.classList.remove("easy-mode");
      localStorage.setItem("easyMode", "false");
    }
  }, [easy]);

  const label = easy ? t("header.normalMode") : t("header.easyMode");

  if (pill) {
    return (
      <button type="button" onClick={() => setEasy(e => !e)} aria-label={label} title={label} className={uiPill}>
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={() => setEasy(e => !e)}
      aria-label={label}
      title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${easy ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent/20"}`}
    >
      <Type className="w-5 h-5" />
    </button>
  );
}