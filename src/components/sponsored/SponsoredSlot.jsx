import { ExternalLink } from "lucide-react";
import { useT } from "@/lib/i18n";
import useSponsoredSlot from "@/hooks/useSponsoredSlot";
import { getChainLogo } from "@/lib/chainLogos";
import { uiSection, uiSectionLabel, uiEnter } from "@/lib/minimalUi";

// The paid placement a chain bought — one slot, clearly marked as sponsored.
export default function SponsoredSlot({ delay = 0 }) {
  const t = useT();
  const slot = useSponsoredSlot();

  if (!slot?.url) return null;
  const logo = getChainLogo(slot.chain_name || "");

  return (
    <section className={`${uiSection} ${uiEnter}`} style={{ animationDelay: `${delay}s` }}>
      <p className={uiSectionLabel}>{t("sponsored.label")}</p>
      <a href={slot.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-[10px] bg-ui-surface px-3.5 py-2.5 no-underline">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-ui-line bg-ui-canvas">
          {logo.logo
            ? <img src={logo.logo} alt={slot.chain_name} className="h-full w-full object-contain" />
            : <span className="text-[14px] font-semibold" style={{ color: logo.bg }}>{logo.initials}</span>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] text-ui-ink">{slot.headline}</span>
          {slot.body && <span className="block truncate text-[12px] text-ui-muted">{slot.body}</span>}
        </span>
        <ExternalLink className="h-4 w-4 flex-shrink-0 text-ui-accent" />
      </a>
    </section>
  );
}