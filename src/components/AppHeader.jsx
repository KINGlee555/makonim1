import { ShoppingCart } from "lucide-react";
import { useT } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import EasyModeToggle from "./EasyModeToggle";

export default function AppHeader({ rightAction, userName }) {
  const t = useT();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 animate-fade-in" role="banner">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">MaKonim</span>
          </div>
          <div className="flex items-center gap-0.5">
            <EasyModeToggle />
            <DarkModeToggle />
            <LanguageSwitcher />
            {rightAction}
          </div>
        </div>
        {userName && (
          <p className="text-xs font-medium text-muted-foreground mt-1">
            {t("header.greeting", { name: userName })}
          </p>
        )}
      </div>
    </header>
  );
}