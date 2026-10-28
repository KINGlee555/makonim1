import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, History, Info, Moon, Palette, SlidersHorizontal, Sun } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage, useT } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import { applyDarkTheme, isDarkTheme } from "@/lib/theme";
import { POSTER, QUIET, useSkin } from "@/lib/skin";
import { useSimpleMode } from "@/lib/simpleMode";
import { toast } from "@/components/ui/use-toast";
import { uiPill } from "@/lib/minimalUi";
import { lastListId } from "@/lib/lastList";

// כל ההגדרות הקטנות של המסך במקום אחד — במקום שורה עמוסה של כפתורים בראש
export default function HeaderMenu({ onOpenProfile, onOpenSettings, className = "" }) {
  const t = useT();
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [dark, setDark] = useState(isDarkTheme);
  const [simple, setSimpleMode] = useSimpleMode();
  const { poster, choose } = useSkin();

  const skinOptions = [
    { skin: QUIET, text: t("design.quiet"), on: !poster },
    { skin: POSTER, text: t("design.poster"), on: poster },
  ];

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    applyDarkTheme(next);
  };

  // מצב פשוט — מסך ממוקד עם הרשימה והפעולות הראשיות בלבד; הבחירה נשמרת במכשיר
  const toggleSimple = () => {
    const next = !simple;
    setSimpleMode(next);
    toast({ title: next ? t("simpleMode.onToast") : t("simpleMode.offToast"), duration: 2500 });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t("header.more")} title={t("header.more")} className={`${className || uiPill} inline-flex items-center gap-1`}>
          {t("header.more")}
          <ChevronDown className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl border-ui-line">
        <DropdownMenuItem onClick={toggleDark}>
          {dark ? <Sun className="me-2 h-4 w-4" /> : <Moon className="me-2 h-4 w-4" />}
          {dark ? t("header.lightMode") : t("header.darkMode")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleSimple}>
          <SlidersHorizontal className="me-2 h-4 w-4" />
          <span className="flex-1">{simple ? t("simpleMode.off") : t("simpleMode.on")}</span>
          {simple && <Check className="h-4 w-4 text-ui-accent" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenProfile}>{t("header.changeName")}</DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenSettings}>{t("header.settings")}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[12px] font-normal text-ui-muted">{t("design.title")}</DropdownMenuLabel>
        {skinOptions.map(option => (
          <DropdownMenuItem key={option.skin} onClick={() => choose(option.skin)}>
            <Palette className="me-2 h-4 w-4" />
            <span className="flex-1">{option.text}</span>
            {option.on && <Check className="h-4 w-4 text-ui-accent" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[12px] font-normal text-ui-muted">{t("header.language")}</DropdownMenuLabel>
        {LANGUAGES.map(language => (
          <DropdownMenuItem key={language.code} onClick={() => setLang(language.code)}>
            <span className="me-2 text-[16px]">{language.flag}</span>
            <span className="flex-1">{language.label}</span>
            {lang === language.code && <Check className="h-4 w-4 text-ui-accent" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[12px] font-normal text-ui-muted">{t("header.nav")}</DropdownMenuLabel>
        {lastListId() && (
          <DropdownMenuItem onClick={() => navigate(`/history/${lastListId()}`)}>
            <History className="me-2 h-4 w-4" />
            {t("header.history")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate("/about")}>
          <Info className="me-2 h-4 w-4" />
          אודות
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/contact")}>
          <Info className="me-2 h-4 w-4" />
          יצירת קשר
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}