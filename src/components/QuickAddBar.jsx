import { Search, ScanLine, Mic } from "lucide-react";
import { useT } from "@/lib/i18n";
import { uiIconRound, uiPrimary } from "@/lib/minimalUi";

export default function QuickAddBar({ onOpenSearch, onOpenScanner, onOpenVoice }) {
  const t = useT();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ui-line bg-ui-canvas">
      <div className="mx-auto flex w-full max-w-[760px] items-center gap-2.5 px-5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 sm:px-7">
        <button type="button" onClick={onOpenVoice} className={uiIconRound} title={t("voice.title")} aria-label={t("voice.title")}>
          <Mic className="h-5 w-5" strokeWidth={1.8} />
        </button>
        <button type="button" onClick={onOpenScanner} className={uiIconRound} title={t("barcode.title")} aria-label={t("barcode.title")}>
          <ScanLine className="h-5 w-5" strokeWidth={1.8} />
        </button>
        <button type="button" onClick={onOpenSearch} className={`${uiPrimary} flex items-center justify-center gap-2`}>
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">{t("quickAdd.search")}</span>
        </button>
      </div>
    </div>
  );
}