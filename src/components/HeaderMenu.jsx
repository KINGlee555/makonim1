import { useState } from "react";
import { Check, Moon, MoreHorizontal, Sun } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage, useT } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import { applyDarkTheme, isDarkTheme } from "@/lib/theme";
import { uiPill } from "@/lib/minimalUi";

// כל ההגדרות הקטנות של המסך במקום אחד — במקום שורה עמוסה של כפתורים בראש
export default function HeaderMenu({ onOpenProfile, onOpenSettings }) {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const [dark, setDark] = useState(isDarkTheme);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    applyDarkTheme(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t("header.more")} title={t("header.more")} className={`${uiPill} w-[34px] px-0`}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl border-ui-line">
        <DropdownMenuItem onClick={toggleDark}>
          {dark ? <Sun className="me-2 h-4 w-4" /> : <Moon className="me-2 h-4 w-4" />}
          {dark ? t("header.lightMode") : t("header.darkMode")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenProfile}>{t("header.changeName")}</DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenSettings}>{t("header.settings")}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[12px] font-normal text-ui-muted">{t("header.language")}</DropdownMenuLabel>
        {LANGUAGES.map(language => (
          <DropdownMenuItem key={language.code} onClick={() => setLang(language.code)}>
            <span className="me-2 text-[16px]">{language.flag}</span>
            <span className="flex-1">{language.label}</span>
            {lang === language.code && <Check className="h-4 w-4 text-ui-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}