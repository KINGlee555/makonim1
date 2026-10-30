import { Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { useLanguage } from "@/lib/i18n";

// בחירת שפה מראש — שלושה כדורים קטנים שמופיעים כבר במסך הכניסה,
// בלי חלון קופץ ובלי הפרעה: מי שרוצה, לוחץ ומחליף.
export default function LanguageChoice({ className = "" }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`lang-choice ${className}`} role="group" aria-label="שפה · Language · Язык">
      <Globe className="lang-choice-icon" aria-hidden="true" />
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          onClick={() => setLang(language.code)}
          aria-pressed={lang === language.code}
          className={`lang-choice-btn ${lang === language.code ? "lang-choice-on" : ""}`}
        >
          <span aria-hidden="true">{language.flag}</span>
          {language.label}
        </button>
      ))}
    </div>
  );
}