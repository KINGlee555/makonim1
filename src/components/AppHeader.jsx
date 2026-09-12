import { useT } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import EasyModeToggle from "./EasyModeToggle";

export default function AppHeader({ rightAction, userName, listView = false }) {
  const t = useT();

  return (
    <header className={`sticky top-0 z-50 border-b animate-fade-in ${listView ? "bg-background/95 backdrop-blur-xl border-primary/10" : "bg-background/80 backdrop-blur-xl border-border/30"}`} role="banner">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`${listView ? "text-xl" : "text-base"} font-bold text-foreground tracking-tight`}>MaKonim</span>
            <img
              src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/77de857b8_generated_image.png"
              alt="MaKonim logo"
              className="w-9 h-9 rounded-xl object-cover"
            />
          </div>
          <div className="flex items-center gap-0.5 min-w-0">
            <EasyModeToggle />
            <DarkModeToggle />
            <LanguageSwitcher />
            {rightAction}
          </div>
        </div>
        {userName && (
          <p className={`text-sm font-medium text-foreground mt-1 ${listView ? "text-start" : "text-xs text-muted-foreground"}`}>
            {t("header.greeting", { name: userName })}
          </p>
        )}
      </div>
    </header>
  );
}