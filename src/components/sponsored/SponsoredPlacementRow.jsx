import { Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getChainLogo } from "@/lib/chainLogos";

export default function SponsoredPlacementRow({ slot, onToggle, onDelete }) {
  const t = useT();
  const logo = getChainLogo(slot.chain_name || "");

  return (
    <div className="flex items-center gap-3 rounded-[26px] border-[3px] border-market-ink bg-market-surface px-4 py-3">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-market-ink bg-white">
        {logo.logo
          ? <img src={logo.logo} alt={slot.chain_name} className="h-full w-full object-contain" />
          : <span className="text-[16px] font-black" style={{ color: logo.bg }}>{logo.initials}</span>}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-black text-market-ink">{slot.headline}</p>
        <p className="truncate text-[12px] font-bold text-market-ink/60">{slot.chain_name} · {slot.url}</p>
      </div>

      <button
        onClick={() => onToggle(slot)}
        className={`flex-shrink-0 rounded-2xl px-2.5 py-1.5 text-[12px] font-black ${slot.active ? "bg-market-blue text-white" : "bg-market-track text-market-ink"}`}
      >
        {slot.active ? t("sponsored.activeOn") : t("sponsored.activeOff")}
      </button>

      <button onClick={() => onDelete(slot)} aria-label={t("sponsored.delete")} className="flex-shrink-0 rounded-2xl bg-market-pink-tint p-2 text-market-pink">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}