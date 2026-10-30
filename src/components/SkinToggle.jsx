import { Check, Palette } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLanguage, useT } from "@/lib/i18n";
import { FRIDGE, POSTER, QUIET, useSkin } from "@/lib/skin";
import { skinLabel } from "@/lib/skinLabels";

// בחירת עיצוב לכל משתמש — פתק על המקרר (ברירת המחדל), רגוע וסולידי או כרזת שוק צבעונית
export default function SkinToggle({ className = "", label = false }) {
  const t = useT();
  const { lang } = useLanguage();
  const { skin, choose } = useSkin();

  const options = [FRIDGE, QUIET, POSTER];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t("design.title")} title={t("design.title")} className={className}>
          <Palette />
          {label && <span>{t("header.design")}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-ui-line">
        <DropdownMenuLabel className="text-[12px] font-normal text-ui-muted">{t("design.title")}</DropdownMenuLabel>
        {options.map(option => (
          <DropdownMenuItem key={option} onClick={() => choose(option)}>
            <span className="flex-1">{skinLabel(lang, option)}</span>
            {skin === option && <Check className="h-4 w-4 text-ui-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}