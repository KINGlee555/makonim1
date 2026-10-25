import { useState } from "react";
import { Crown } from "lucide-react";
import PremiumDialog from "@/components/PremiumDialog";
import { useT } from "@/lib/i18n";

// כלי שכלול במסלול הפרימיום — מוצג כרטיס הצטרפות במקום הכלי עצמו
export default function PremiumLock({ hint }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full rounded-2xl border border-market-yellow-deep/30 bg-market-yellow-soft p-4 text-center">
      <Crown className="mx-auto h-6 w-6 text-market-yellow-deep" />
      <p className="mt-2 text-[17px] font-black text-market-ink">{t("premium.lockedTitle")}</p>
      <p className="mt-1 text-[14px] font-bold text-market-ink/70">{hint || t("premium.subtitle")}</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 h-11 w-full rounded-[22px] bg-market-pink text-[16px] font-black text-white"
      >
        {t("premium.lockedCta")}
      </button>
      <PremiumDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}