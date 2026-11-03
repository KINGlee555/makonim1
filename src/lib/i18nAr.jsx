// שכבת ערבית מעל מנגנון התרגום הקיים.
// קובץ התרגומים הראשי (i18n.jsx) גדול מכדי לערוך, ולכן הוא נשאר כמו שהוא:
// הקובץ הזה עוטף אותו, מוסיף ערבית (RTL) ומחזיר את אותה התנהגות לכל שאר השפות.
import { createContext, useContext, useMemo, useEffect } from "react";
import { LanguageProvider as BaseProvider, useLanguage as useBaseLanguage } from "./i18n.jsx";
import arExtra from "@/lib/locales/ar";

const LanguageContext = createContext(null);

const RTL_LANGS = ["he", "ar"];

function ArabicLayer({ children }) {
  const { lang, setLang, t } = useBaseLanguage();

  const value = useMemo(() => ({
    lang,
    setLang,
    dir: RTL_LANGS.includes(lang) ? "rtl" : "ltr",
    t: (key, vars) => {
      let str = lang === "ar" ? arExtra[key] : null;
      if (!str) return t(key, vars);
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        });
      }
      return str;
    },
  }), [lang, setLang, t]);

  // השפה הבסיסית קובעת ltr לכל שפה שאינה עברית — כאן מחזירים את הכיוון לערבית
  useEffect(() => {
    if (!RTL_LANGS.includes(lang)) return undefined;
    const id = setTimeout(() => {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = lang;
    }, 0);
    return () => clearTimeout(id);
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function LanguageProvider({ children }) {
  return (
    <BaseProvider>
      <ArabicLayer>{children}</ArabicLayer>
    </BaseProvider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  const { t } = useLanguage();
  return t;
}