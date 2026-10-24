import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScanLine, ClipboardList, Route, CalendarDays, Receipt, Trophy, Tag, Mic, Calculator, ArrowUpDown, Scale, Layers, Sparkles, Crown, Truck, RefreshCw, Users, MoreHorizontal } from "lucide-react";
import { useT } from "@/lib/i18n";
import { uiIconRound, uiOutline, uiPill, uiPillRow } from "@/lib/minimalUi";

export default function FeatureMenu({ onOpenBasket, onOpenPriceCompare, onOpenTemplates, onOpenScanner, onOpenRoute, onOpenMenu, onOpenDeals, onOpenSplit, onOpenLeaderboard, onOpenVoice, onOpenDealCalculator, onOpenCategoryOrder, onOpenPremium, onOpenCourier, onOpenGroupBy, grouped, onOpenSuggestions, onRefresh, refreshing, onOpenParticipants, readerSlot, bar }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const pick = (handler) => { setOpen(false); window.setTimeout(() => handler(), 260); };

  // אלה הכלים שמובילים לקנייה חכמה — בחזית התפריט
  const mainTools = [
    { icon: ScanLine, label: t("barcode.title"), onClick: onOpenScanner },
    { icon: Mic, label: t("voice.title"), onClick: onOpenVoice },
    { icon: ClipboardList, label: t("templates.title"), onClick: onOpenTemplates },
    { icon: Tag, label: t("deals.title"), onClick: onOpenDeals },
    { icon: CalendarDays, label: t("menu.title"), onClick: onOpenMenu },
    { icon: Truck, label: t("courier.open"), onClick: onOpenCourier },
  ];

  // והשאר בקיצור, בלי להעמיס על המסך
  const extraTools = [
    { icon: RefreshCw, label: t("list.refresh"), onClick: onRefresh, spinning: refreshing },
    ...(onOpenParticipants ? [{ icon: Users, label: t("participants.button"), onClick: onOpenParticipants }] : []),
    { icon: Scale, label: t("compare.open"), onClick: onOpenPriceCompare },
    { icon: Receipt, label: t("split.title"), onClick: onOpenSplit },
    { icon: Trophy, label: t("leaderboard.title"), onClick: onOpenLeaderboard },
    { icon: Calculator, label: "מחשבון מבצעים", onClick: onOpenDealCalculator },
    { icon: ArrowUpDown, label: "סדר המחלקות", onClick: onOpenCategoryOrder },
    { icon: Layers, label: grouped ? t("list.ungroup") : t("list.groupByCategory"), onClick: onOpenGroupBy },
    { icon: Sparkles, label: t("smart.title"), onClick: onOpenSuggestions },
    { icon: Route, label: t("route.title"), onClick: onOpenRoute },
    { icon: Crown, label: t("premium.open"), onClick: onOpenPremium },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {bar ? (
          <button type="button" className={uiIconRound} title={t("list.moreFeatures")} aria-label={t("list.moreFeatures")}>
            <MoreHorizontal className="h-5 w-5" strokeWidth={1.8} />
          </button>
        ) : (
          <button type="button" className={uiOutline}>{t("list.moreFeatures")}</button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl border-t border-ui-line bg-ui-canvas px-5 pb-8 pt-4 font-system text-ui-ink">
        <SheetHeader className="text-center">
          <SheetTitle className="text-[15px] font-semibold text-ui-ink">{t("list.moreFeatures")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {mainTools.map((tool, index) => (
            <button
              key={tool.label}
              data-testid={`feature-${index}`}
              type="button"
              onClick={() => pick(tool.onClick)}
              className="flex flex-col items-center gap-2 rounded-[10px] border border-ui-line bg-ui-canvas p-3 text-ui-ink transition-[background-color,color,box-shadow,opacity] duration-200 hover:bg-ui-surface active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent"
            >
              <tool.icon className="h-5 w-5 text-ui-accent" strokeWidth={1.8} />
              <span className="text-center text-[13px] leading-tight">{tool.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-[12px] text-ui-muted">עוד כלים</p>
        <div className={uiPillRow}>
          {extraTools.map(tool => (
            <button key={tool.label} type="button" onClick={() => pick(tool.onClick)}
              className={`${uiPill} inline-flex items-center gap-1.5`}>
              <tool.icon className={`h-3.5 w-3.5 text-ui-muted ${tool.spinning ? "animate-refresh" : ""}`} strokeWidth={1.8} />{tool.label}
            </button>
          ))}
          {readerSlot}
        </div>
      </SheetContent>
    </Sheet>
  );
}