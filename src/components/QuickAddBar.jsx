import { Search, ScanLine, Mic } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function QuickAddBar({ onOpenSearch, onOpenScanner, onOpenVoice }) {
  const t = useT();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="pointer-events-auto flex items-center gap-3 rounded-[40px] border-4 border-market-ink bg-market-blue p-4 shadow-[0_8px_0_hsl(var(--market-ink))] mk-pop">
          <button
            onClick={onOpenVoice}
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-market-surface text-market-ink"
            title={t("voice.title")}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenScanner}
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-market-surface text-market-ink"
            title={t("barcode.title")}
          >
            <ScanLine className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenSearch}
            className="flex h-14 min-w-0 flex-1 items-center justify-center gap-2.5 rounded-[28px] bg-market-yellow px-3 text-[20px] font-black text-market-ink"
          >
            <Search className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{t("quickAdd.search")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}