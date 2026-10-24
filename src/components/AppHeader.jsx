import { useT } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import EasyModeToggle from "./EasyModeToggle";

export default function AppHeader({ rightAction, userName, listView = false }) {
  const t = useT();

  return (
    <header className="sticky top-0 z-50 border-b-4 border-market-yellow bg-market-surface animate-fade-in" role="banner">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-3 md:px-12">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className={`font-black tracking-[-1.5px] text-market-pink ${listView ? "text-2xl md:text-[30px]" : "text-xl md:text-2xl"}`}>MaKonim</span>
            <img
              src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/77de857b8_generated_image.png"
              alt="MaKonim logo"
              className="h-11 w-11 rounded-[14px] border-[3px] border-market-yellow object-cover"
            />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <EasyModeToggle />
            <DarkModeToggle />
            <LanguageSwitcher />
            {rightAction}
          </div>
        </div>
        {userName && (
          <p className={`mt-1.5 text-start font-extrabold text-market-blue ${listView ? "text-lg" : "text-sm"}`}>
            {t("header.greeting", { name: userName })}
          </p>
        )}
      </div>
    </header>
  );
}