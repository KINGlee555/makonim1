import { Search, ScanLine, Mic } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function QuickAddBar({ onOpenSearch, onOpenScanner, onOpenVoice }) {
  const t = useT();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 pb-4 pt-2">
        <div className="pointer-events-auto flex gap-2 p-2 rounded-3xl bg-card/95 backdrop-blur-xl shadow-lg border border-border/50 animate-slide-up">
          <button
            onClick={onOpenSearch}
            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-primary/85 text-white text-base font-semibold flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.97] hover:shadow-lg"
          >
            <Search className="w-5 h-5" />
            {t("quickAdd.search")}
          </button>
          <button
            onClick={onOpenScanner}
            className="h-14 w-14 rounded-2xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-all active:scale-90"
            title={t("barcode.title")}
          >
            <ScanLine className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={onOpenVoice}
            className="h-14 w-14 rounded-2xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-all active:scale-90"
            title={t("voice.title")}
          >
            <Mic className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}