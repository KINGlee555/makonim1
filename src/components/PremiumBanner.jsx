import { Crown } from "lucide-react";
import { useT } from "@/lib/i18n";

// Always-visible path into the premium offer — not buried inside the tools menu.
export default function PremiumBanner({ onOpen }) {
  const t = useT();

  return (
    <button
      onClick={onOpen}
      className="mt-5 flex w-full items-center gap-3 rounded-[28px] border-[3px] border-market-ink bg-market-pink-tint px-4 py-3 text-start"
    >
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-market-ink bg-market-yellow">
        <Crown className="h-5 w-5 text-market-ink" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-black tracking-[1px] text-market-pink">{t("premium.open")}</span>
        <span className="block text-[16px] font-black leading-tight text-market-ink">{t("premium.banner")}</span>
      </span>
      <span className="flex-shrink-0 rounded-2xl bg-market-pink px-3.5 py-2 text-[14px] font-black text-white">
        {t("premium.bannerCta")}
      </span>
    </button>
  );
}