import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { CHAINS } from "@/lib/chainPrices";
import ChainLogo from "@/components/ChainLogo";
import { useT } from "@/lib/i18n";

// "מאיפה המחירים" — שקיפות מלאה: כל מחיר מגיע מקובץ המחירים הרשמי של הרשת.
export default function PriceSourcesDialog({ open, onOpenChange }) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto flex max-h-[85vh] max-w-md flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start text-lg text-ui-ink">
            <Info className="h-5 w-5 text-ui-accent" />{t("sources.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-1">
          <p className="text-[13px] text-ui-muted">{t("sources.desc")}</p>
          <div className="space-y-1.5">
            {CHAINS.map(chain => (
              <div key={chain.id} className="flex items-center justify-between gap-2 rounded-2xl border border-ui-line px-3 py-2">
                <span className="flex min-w-0 items-center gap-2 text-[14px] text-ui-ink">
                  <ChainLogo name={chain.name} size={24} className="flex-shrink-0 rounded-lg" />
                  <span className="truncate">{chain.name}</span>
                </span>
                <span className="flex-shrink-0 text-[12px] text-ui-muted">{t("sources.chainSource")}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-ui-muted">{t("sources.note")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}