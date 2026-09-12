import { ShoppingCart } from "lucide-react";
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
            <div className={`${listView ? "w-8 h-8 bg-transparent" : "w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-sm"} flex items-center justify-center`}>
              <ShoppingCart className={`${listView ? "w-5 h-5 text-primary" : "w-4 h-4 text-white"}`} />
            </div>
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