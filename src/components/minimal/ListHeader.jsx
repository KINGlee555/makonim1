import { Pencil } from "lucide-react";
import EasyModeToggle from "@/components/EasyModeToggle";
import HeaderMenu from "@/components/HeaderMenu";
import { useT } from "@/lib/i18n";
import { bigPill } from "@/lib/bigUi";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/77de857b8_generated_image.png";

// פס עליון דביק עם שם הרשימה ושני המספרים הגדולים, ומתחתיו שורת המותג והפעולות.
export default function ListHeader({ list, userName, itemCount, total, onOpenProfile, onOpenSettings, onOpenShare, onOpenQr, onRename }) {
  const t = useT();

  return (
    <>
      <div className="big-in sticky top-0 z-30 border-b-2 border-big-line bg-big-canvas shadow-[0_4px_18px_rgba(27,27,27,0.06)]">
        <div className="mx-auto flex w-full max-w-[940px] items-center justify-between gap-4 px-5 py-4 sm:px-7 sm:py-[26px]">
          <button type="button" onClick={onRename} title={t("rename.button")}
            className="flex min-w-0 items-center gap-2 text-[26px] text-big-ink sm:gap-3.5 sm:text-[34px]">
            <span className="truncate">{list.title}</span>
            <Pencil className="h-5 w-5 shrink-0 text-big-muted sm:h-[26px] sm:w-[26px]" strokeWidth={2} />
          </button>
          <div className="flex shrink-0 items-end gap-5 sm:gap-14">
            <span className="flex flex-col gap-1 text-[15px] text-big-muted sm:text-[20px]">
              {t("list.toBuy")}
              <b className="text-[34px] font-semibold leading-none tracking-[0.04em] tabular-nums text-big-ink sm:text-[60px]">{itemCount}</b>
            </span>
            <span className="flex flex-col gap-1 text-[15px] text-big-muted sm:text-[20px]">
              {t("list.total")}
              <b className="big-beat text-[34px] font-semibold leading-none tracking-[0.04em] tabular-nums text-big-accent sm:text-[60px]">₪{total.toFixed(2)}</b>
            </span>
          </div>
        </div>
      </div>

      <div className="big-in mx-auto flex w-full max-w-[940px] flex-wrap items-center justify-between gap-x-3 gap-y-2.5 px-5 pt-5 sm:px-7 sm:pt-[22px]" style={{ animationDelay: ".1s" }}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-[20px] font-semibold text-big-accent sm:text-[26px]">MaKonim</span>
          <img src={LOGO} alt="MaKonim" className="h-9 w-9 shrink-0 rounded-full border-2 border-big-line object-cover sm:h-11 sm:w-11" />
          {userName && (
            <span className="truncate text-[16px] text-big-muted sm:text-[20px]">{t("header.greeting", { name: userName })}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <EasyModeToggle pill />
          <button type="button" onClick={onOpenShare} className={bigPill}>{t("header.share")}</button>
          <button type="button" onClick={onOpenQr} className={bigPill}>{t("share.qrButton")}</button>
          <HeaderMenu onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} />
        </div>
      </div>
    </>
  );
}