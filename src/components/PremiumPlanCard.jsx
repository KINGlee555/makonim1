import { useT } from "@/lib/i18n";

export default function PremiumPlanCard({ plan, selected, onSelect }) {
  const t = useT();

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative rounded-3xl border-[3px] px-3 py-4 text-center transition-colors ${
        selected ? "border-market-ink bg-market-blue-soft" : "border-market-track bg-market-surface"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-2 right-2 rounded-lg bg-market-yellow px-2 py-0.5 text-[11px] font-black text-market-ink">
          {t(plan.badge)}
        </span>
      )}
      <p className="text-[15px] font-black text-market-ink">{t(plan.label)}</p>
      <p className="mt-1 text-[26px] font-black leading-none tracking-[-1px] text-market-pink">₪{plan.price}</p>
      <p className="mt-1 text-[12px] font-bold text-market-ink/60">{t(plan.period)}</p>
    </button>
  );
}