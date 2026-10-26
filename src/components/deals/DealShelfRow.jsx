import { Plus } from "lucide-react";
import ChainLogo from "@/components/ChainLogo";
import { dealPriceText, multiBuyText } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";

// שורת מבצע אמיתי מהרשת: המוצר, הרשת, מחיר המבצע והמחיר הרגיל שלפניו.
export default function DealShelfRow({ deal, onAdd }) {
  const t = useT();
  const multi = multiBuyText(deal);
  const until = deal.ends_on
    ? t("shelf.until", { date: `${deal.ends_on.slice(8, 10)}/${deal.ends_on.slice(5, 7)}` })
    : "";

  return (
    <div className="pst-lrow">
      <ChainLogo name={deal.chain_name} size={20} className="flex-none" />
      <div className="pst-lrow-t">
        <span className="block truncate">{deal.name || deal.barcode}</span>
        <span className="pst-lrow-s block truncate">{[deal.chain_name, until].filter(Boolean).join(" · ")}</span>
      </div>
      <div className="flex flex-none flex-col items-end gap-0.5">
        <span className="rounded-lg bg-market-yellow px-2 py-0.5 text-[14px] font-black text-market-ink">{dealPriceText(deal)}</span>
        {!multi && deal.price > 0 && (
          <span className="text-[12px] font-bold text-ui-muted line-through">₪{Number(deal.price).toFixed(2)}</span>
        )}
      </div>
      <button type="button" onClick={() => onAdd(deal)} aria-label={t("deals.addToList")} title={t("deals.addToList")}
        className="pst-more flex flex-none items-center justify-center">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}