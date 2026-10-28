import { useState } from "react";
import { Languages, X } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { useLanguage } from "@/lib/i18n";
import itemMeta from "@/lib/locales/itemMeta";

const STORAGE_KEY = "mk_lang_notice";

// שורה במסך הראשי שמספרת שהאפליקציה עובדת גם ברוסית ובאנגלית,
// ומאפשרת להחליף שפה בלחיצה אחת — בלי להיכנס לתפריט.
export default function LanguageNotice() {
  const { lang, setLang } = useLanguage();
  const words = itemMeta[lang] || itemMeta.he;
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "off"; } catch { return false; }
  });

  if (hidden) return null;

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, "off"); } catch {}
    setHidden(true);
  };

  const choose = (code) => {
    setLang(code);
    close();
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 pt-2 sm:px-7 lg:px-10">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-pst-ink bg-pst-yellow px-3 py-2 text-pst-ink">
        <Languages className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 text-[13px] font-extrabold leading-tight sm:text-sm">
          {words["langNotice.text"]}
        </span>
        <div className="flex items-center gap-1.5">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => choose(language.code)}
              aria-current={lang === language.code ? "true" : undefined}
              className={`min-h-[36px] rounded-full border-2 border-pst-ink px-3 text-[13px] font-black transition-colors ${
                lang === language.code ? "bg-pst-ink text-pst-yellow" : "bg-white/70 text-pst-ink hover:bg-pst-ink hover:text-pst-yellow"
              }`}
            >
              <span aria-hidden="true" className="me-1">{language.flag}</span>
              {language.label}
            </button>
          ))}
          <button
            type="button"
            onClick={close}
            aria-label={words["langNotice.dismiss"]}
            title={words["langNotice.dismiss"]}
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-pst-ink bg-white/70 text-pst-ink hover:bg-pst-ink hover:text-pst-yellow"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}