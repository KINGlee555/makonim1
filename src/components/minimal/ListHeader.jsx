import { useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import EasyModeToggle from "@/components/EasyModeToggle";
import DarkModeToggle from "@/components/DarkModeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useT } from "@/lib/i18n";
import { uiPill, uiEnter } from "@/lib/minimalUi";

// פס עליון אחד דביק: הזהות, הפעולות הקטנות, ואחריו שם הרשימה עם כמה נשאר והסה״כ.
export default function ListHeader({ list, userName, itemCount, total, onOpenProfile, onOpenSettings, onOpenShare, onRename, onAdd }) {
  const t = useT();
  const ref = useRef(null);

  // כותרות המחלקות נדבקות בדיוק מתחת לפס הזה, בכל גודל מסך
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const apply = () => document.documentElement.style.setProperty("--ui-head-h", `${Math.round(element.getBoundingClientRect().height)}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={ref} className={`${uiEnter} sticky top-0 z-30 border-b border-ui-line bg-ui-canvas`}>
      <div className="mx-auto w-full max-w-[760px] px-5 sm:px-7">
        <div className="flex items-center justify-between gap-3 border-b border-ui-line-soft py-2.5">
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="text-[18px] font-semibold text-ui-accent">MaKonim</span>
            <img
              src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/77de857b8_generated_image.png"
              alt="MaKonim"
              className="h-8 w-8 rounded-full border border-ui-line object-cover"
            />
          </div>
          {userName && (
            <p className="hidden min-w-0 truncate text-[14px] text-ui-muted sm:block">{t("header.greeting", { name: userName })}</p>
          )}
          <div className="scrollbar-hide flex min-w-0 items-center gap-1.5 overflow-x-auto">
            <EasyModeToggle pill />
            <DarkModeToggle pill />
            <LanguageSwitcher pill />
            <button type="button" onClick={onOpenProfile} className={uiPill}>{t("header.changeName")}</button>
            <button type="button" onClick={onOpenSettings} className={uiPill}>{t("header.settings")}</button>
            <button type="button" onClick={onOpenShare} className={uiPill}>{t("header.share")}</button>
          </div>
        </div>

        {userName && (
          <p className="truncate pb-1 text-[13px] text-ui-muted sm:hidden">{t("header.greeting", { name: userName })}</p>
        )}

        <div className="flex items-center justify-between gap-3 py-3">
          <button type="button" onClick={onRename} title={t("rename.button")} className="flex min-w-0 items-center gap-2 text-[20px] font-semibold text-ui-ink">
            <span className="truncate">{list.title}</span>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-ui-muted" />
          </button>
          <div className="flex shrink-0 items-center gap-4 sm:gap-6">
            <span className="flex flex-col text-[12px] text-ui-muted">
              {t("list.toBuy")}
              <b className="text-[20px] font-semibold tabular-nums text-ui-ink">{itemCount}</b>
            </span>
            <span className="flex flex-col text-[12px] text-ui-muted">
              {t("list.total")}
              <b className="text-[20px] font-semibold tabular-nums text-ui-accent">₪{total.toFixed(2)}</b>
            </span>
            <button
              type="button"
              onClick={onAdd}
              aria-label={t("quickAdd.search")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ui-accent bg-ui-accent text-[24px] leading-none text-white transition-[background-color,color,box-shadow,opacity] duration-200 hover:shadow-[0_2px_8px_rgba(14,159,143,0.35)] active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}