import { ShoppingCart } from "lucide-react";
import { useT } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import EasyModeToggle from "./EasyModeToggle";

export default function AppHeader({ rightAction, userName }) {
  const t = useT();

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-primary/10 shadow-sm px-4 py-2" role="banner">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">MaKonim</span>
          </div>
          <div className="flex items-center gap-1">
            <EasyModeToggle />
            <DarkModeToggle />
            <LanguageSwitcher />
            {rightAction}
          </div>
        </div>
        {userName && (
          <p className="text-sm font-medium text-primary mt-1">
            {t("header.greeting", { name: userName })}
          </p>
        )}
      </div>
    </header>
  );
}