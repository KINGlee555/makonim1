import { useT } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppHeader({ rightAction, userName }) {
  const t = useT();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-primary/10 shadow-sm px-4 py-2">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/d32242af8_IMG_0035.png"
            alt={t("app.name")}
            className="h-12 w-auto object-contain"
          />
          <div className="flex items-center gap-1">
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