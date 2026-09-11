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
          <div className="bg-white rounded-2xl p-1.5 flex items-center justify-center shadow-sm">
            <img
              src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/2d1599b0e_IMG_0820.jpeg"
              alt={t("app.name")}
              className="h-14 w-auto object-contain brightness-110"
            />
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