import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Globe, History, Info, Moon, Palette, SlidersHorizontal, Sun } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage, useT } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import languageHint from "@/lib/locales/languageHint";
import { applyDarkTheme, isDarkTheme } from "@/lib/theme";
import { FRIDGE, POSTER, QUIET, useSkin } from "@/lib/skin";
import { skinLabel } from "@/lib/skinLabels";
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
  const { skin: currentSkin, choose } = useSkin();

  const currentLanguage = LANGUAGES.find(language => language.code === lang) || LANGUAGES[0];

  const skinOptions = [FRIDGE, QUIET, POSTER].map(skin => ({
    skin, text: skinLabel(lang, skin), on: currentSkin === skin,
  }));

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
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-[17.5rem] max-w-[calc(100vw-1.5rem)] max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overscroll-contain rounded-2xl border-ui-line p-1.5 shadow-xl [&_[role=menuitem]]:min-h-[42px] [&_[role=menuitem]]:px-2.5"
      >
        {/* השפה ראשונה בתפריט — ברור מיד שאפשר להחליף */}
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[12px] font-normal text-ui-muted">
          <Globe className="h-3.5 w-3.5" />
          {t("header.language")}
        </DropdownMenuLabel>
        {LANGUAGES.map(language => (
          <DropdownMenuItem key={language.code} onClick={() => setLang(language.code)}>
            <span className="me-2 text-[16px]">{language.flag}</span>
            <span className="flex-1">{language.label}</span>
            {lang === language.code && <Check className="h-4 w-4 text-ui-accent" />}
          </DropdownMenuItem>
        ))}
        <p className="px-2.5 pb-1 text-[11px] leading-tight text-ui-muted">
          {languageHint[lang] || languageHint.he}
        </p>
        <DropdownMenuSeparator />
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