import { useT } from "@/lib/i18n";
import { uiSectionLabel, uiBannerAction } from "@/lib/minimalUi";

// Always-visible path into the premium offer — not buried inside the tools menu.
export default function PremiumBanner({ onOpen }) {
  const t = useT();

  return (
    <div>
      <p className={uiSectionLabel}>{t("premium.open")}</p>
      <div className="flex items-center justify-between gap-3 rounded-[10px] bg-ui-surface px-3.5 py-2.5 text-[14px] text-ui-ink">
        <span className="min-w-0 truncate">{t("premium.banner")}</span>
        <button type="button" onClick={onOpen} className={uiBannerAction}>{t("premium.bannerCta")}</button>
      </div>
    </div>
  );
}