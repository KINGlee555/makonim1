import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function EasyModeToggle() {
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

  return (
    <button
      onClick={() => setEasy(e => !e)}
      aria-label={easy ? t("header.normalMode") : t("header.easyMode")}
      title={easy ? t("header.normalMode") : t("header.easyMode")}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${easy ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent/20"}`}
    >
      <Type className="w-5 h-5" />
    </button>
  );
}