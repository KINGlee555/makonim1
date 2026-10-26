import { Check, Palette } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useT } from "@/lib/i18n";
import { POSTER, QUIET, useSkin } from "@/lib/skin";

// בחירת עיצוב לכל משתמש — רגוע וסולידי (ברירת המחדל) או כרזת שוק צבעונית
export default function SkinToggle({ className = "", label = false }) {
  const t = useT();
  const { poster, choose } = useSkin();

  const options = [
    { skin: QUIET, text: t("design.quiet"), on: !poster },
    { skin: POSTER, text: t("design.poster"), on: poster },
  ];

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
          <DropdownMenuItem key={option.skin} onClick={() => choose(option.skin)}>
            <span className="flex-1">{option.text}</span>
            {option.on && <Check className="h-4 w-4 text-ui-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}