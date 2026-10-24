import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import PremiumPlanCard from "./PremiumPlanCard";

const PLANS = [
  { id: "yearly", label: "premium.yearly", price: 149, period: "premium.perYear", badge: "premium.yearlyBonus" },
  { id: "monthly", label: "premium.monthly", price: 19.9, period: "premium.perMonth", badge: null }
];

const FEATURES = ["premium.f1", "premium.f2", "premium.f3", "premium.f4"];

export default function PremiumDialog({ open, onOpenChange }) {
  const t = useT();
  const [plan, setPlan] = useState("yearly");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleJoin = async () => {
    setSending(true);
    setFailed(false);
    try {
      const me = await base44.auth.me();
      await base44.entities.PremiumInterest.create({
        plan,
        user_name: me?.full_name || "",
        email: me?.email || "",
        source: "feature_menu"
      });
      setSent(true);
    } catch {
      setFailed(true);
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-h-[88vh] max-w-md overflow-y-auto bg-market-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start text-xl text-market-ink">
            <Crown className="h-5 w-5 text-market-yellow-deep" />
            {t("premium.title")}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-6 text-center">
            <p className="text-[22px] font-black text-market-ink">{t("premium.sentTitle")}</p>
            <p className="mt-2 text-[15px] font-bold text-market-ink/70">{t("premium.sentDesc")}</p>
          </div>
        ) : (
          <>
            <p className="text-[15px] font-bold text-market-ink/70">{t("premium.subtitle")}</p>

            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((item) => (
                <PremiumPlanCard key={item.id} plan={item} selected={plan === item.id} onSelect={() => setPlan(item.id)} />
              ))}
            </div>

            <ul className="space-y-2">
              {FEATURES.map((key) => (
                <li key={key} className="flex items-center gap-2 text-[15px] font-bold text-market-ink">
                  <Check className="h-4 w-4 flex-shrink-0 text-market-blue" />
                  {t(key)}
                </li>
              ))}
            </ul>

            <p className="rounded-2xl bg-market-yellow-soft px-4 py-3 text-[13px] font-bold text-market-ink">{t("premium.note")}</p>

            {failed && <p className="text-[13px] font-bold text-destructive">{t("premium.error")}</p>}

            <Button
              onClick={handleJoin}
              disabled={sending}
              className="h-12 w-full rounded-[24px] bg-market-pink text-[17px] font-black text-white hover:bg-market-pink hover:text-white"
            >
              {sending ? t("premium.sending") : t("premium.cta")}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}