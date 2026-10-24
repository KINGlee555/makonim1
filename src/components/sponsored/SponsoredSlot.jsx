import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getChainLogo } from "@/lib/chainLogos";

// The paid placement a chain bought — one slot, clearly marked as sponsored.
export default function SponsoredSlot() {
  const t = useT();
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    base44.entities.SponsoredPlacement.filter({ active: true }, "-priority", 1)
      .then(rows => setSlot((Array.isArray(rows) ? rows : rows.items || [])[0] || null))
      .catch(() => {});
  }, []);

  if (!slot?.url) return null;
  const logo = getChainLogo(slot.chain_name || "");

  return (
    <a
      href={slot.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 flex items-center gap-3 rounded-[28px] border-[3px] border-market-ink bg-market-yellow-soft px-4 py-3 no-underline"
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-market-ink bg-white">
        {logo.logo
          ? <img src={logo.logo} alt={slot.chain_name} className="h-full w-full object-contain" />
          : <span className="text-[18px] font-black" style={{ color: logo.bg }}>{logo.initials}</span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-black tracking-[1px] text-market-ink/60">{t("sponsored.label")}</span>
        <span className="block truncate text-[17px] font-black text-market-ink">{slot.headline}</span>
        {slot.body && <span className="block truncate text-[13px] font-bold text-market-ink/70">{slot.body}</span>}
      </span>
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-market-ink" />
    </a>
  );
}