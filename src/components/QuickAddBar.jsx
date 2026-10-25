import { ScanLine } from "lucide-react";
import { useT } from "@/lib/i18n";

// שני הכפתורים הגדולים בתחתית המסך, וכפתור סריקה עגול לצידם.
export default function QuickAddBar({ onOpenSearch, onOpenScanner, onOpenShoppingMode }) {
  const t = useT();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="big-in mx-auto flex w-full max-w-[940px] items-center gap-3 border-t-2 border-big-yellow bg-big-canvas px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_20px_rgba(27,27,27,0.07)] sm:gap-[18px] sm:px-7 sm:pb-6 sm:pt-5" style={{ animationDelay: ".6s" }}>
        <button type="button" onClick={onOpenSearch} aria-label={t("big.add")}
          className="h-[60px] flex-1 rounded-[18px] border-0 bg-big-accent px-2 text-[16px] leading-tight text-big-canvas hover:shadow-[0_6px_18px_rgba(14,143,130,0.4)] sm:h-[84px] sm:rounded-[22px] sm:text-[32px]">
          {t("big.add")}
        </button>
        <button type="button" onClick={onOpenShoppingMode} aria-label={t("shoppingMode.title")}
          className="h-[60px] flex-1 rounded-[18px] border-[3px] border-big-attn bg-big-attn-soft px-2 text-[16px] leading-tight text-big-ink hover:bg-big-attn sm:h-[84px] sm:rounded-[22px] sm:text-[32px]">
          {t("big.finish")}
        </button>
        <button type="button" onClick={onOpenScanner} aria-label={t("barcode.title")}
          className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-2 border-big-turquoise bg-big-canvas text-big-accent hover:bg-big-surface sm:h-[84px] sm:w-[84px]">
          <ScanLine className="h-6 w-6 sm:h-9 sm:w-9" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}