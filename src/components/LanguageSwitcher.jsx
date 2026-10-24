import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage, useT } from "@/lib/i18n";
import { uiPill } from "@/lib/minimalUi";

const LANGUAGES = [
  { code: "he", label: "עברית", flag: "🇮🇱" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export default function LanguageSwitcher({ pill = false }) {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={current.label}
        className={pill ? uiPill : "h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"}
      >
        {pill ? t("header.language") : <Globe className="w-5 h-5" />}
      </button>
      {open && (
        <div className={`absolute top-full end-0 z-50 mt-1 min-w-[140px] rounded-xl border border-ui-line bg-ui-canvas py-1 shadow-lg ${pill ? "text-ui-ink" : "border-border bg-card"}`}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-ui-surface ${
                lang === l.code ? "font-semibold text-ui-accent" : ""
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              <span className="flex-1 text-start">{l.label}</span>
              {lang === l.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}