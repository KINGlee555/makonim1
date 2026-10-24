import { Tag } from "lucide-react";
import ChainLogo from "@/components/ChainLogo";
import { dealPriceText } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";

// תג "במבצע" למוצר שיש עליו הוזלה אמיתית ברשת — עם מחיר המבצע והרשת.
export default function DealBadge({ deal, className = "" }) {
  const t = useT();
  if (!deal) return null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-market-ink bg-market-pink-soft px-2.5 py-1 ${className}`}>
      <span className="flex items-center gap-1 rounded-lg bg-market-pink px-1.5 py-0.5 text-[12px] font-black text-white">
        <Tag className="h-3 w-3" />{t("deals.badge")}
      </span>
      <span className="text-[15px] font-black text-market-ink">{dealPriceText(deal)}</span>
      {deal.discount > 0 && <span className="text-[13px] font-black text-market-ink/70">-{deal.discount}%</span>}
      {deal.chain_name && <span className="flex items-center gap-1 text-[12px] font-bold text-market-ink/70"><ChainLogo name={deal.chain_name} size={13} />{deal.chain_name}</span>}
    </div>
  );
}