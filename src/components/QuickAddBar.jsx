import { Search, ScanLine, Mic } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function QuickAddBar({ onOpenSearch, onOpenScanner, onOpenVoice }) {
  const t = useT();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="pointer-events-auto flex gap-2 p-2 rounded-xl bg-primary shadow-lg border border-primary animate-slide-up">
          <button
            onClick={onOpenVoice}
            className="h-12 w-14 rounded-lg bg-card text-foreground flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
            title={t("voice.title")}
          >
            <Mic className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={onOpenScanner}
            className="h-12 w-14 rounded-lg bg-card text-foreground flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
            title={t("barcode.title")}
          >
            <ScanLine className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={onOpenSearch}
            className="flex-1 h-12 rounded-lg bg-primary-foreground/15 text-primary-foreground text-base font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]"
          >
            <Search className="w-5 h-5" />
            {t("quickAdd.search")}
          </button>
        </div>
      </div>
    </div>
  );
}