import { Button } from "@/components/ui/button";
import { Search, ScanLine, Mic } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function QuickAddBar({ onOpenSearch, onOpenScanner, onOpenVoice }) {
  const t = useT();
  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
      <div className="max-w-lg mx-auto flex gap-2">
        <Button
          className="flex-1 h-14 rounded-2xl text-lg gap-3"
          onClick={onOpenSearch}
        >
          <Search className="w-6 h-6" />
          {t("quickAdd.search")}
        </Button>
        <Button
          variant="outline"
          className="h-14 w-14 rounded-2xl flex-shrink-0 p-0"
          onClick={onOpenScanner}
          title={t("barcode.title")}
        >
          <ScanLine className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          className="h-14 w-14 rounded-2xl flex-shrink-0 p-0"
          onClick={onOpenVoice}
          title={t("voice.title")}
        >
          <Mic className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}