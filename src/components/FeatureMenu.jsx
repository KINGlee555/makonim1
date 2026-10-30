import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScanLine, ClipboardList, Route, CalendarDays, Receipt, Trophy, Tag, Mic, Calculator, ArrowUpDown, Scale, Layers, Crown, Truck, RefreshCw, Users, ChevronDown, PawPrint, QrCode } from "lucide-react";
import { useT } from "@/lib/i18n";
import { uiBarPill, uiOutline, uiPill, uiPillRow } from "@/lib/minimalUi";

export default function FeatureMenu({ onOpenBasket, onOpenPriceCompare, onOpenTemplates, onOpenScanner, onOpenRoute, onOpenMenu, onOpenDeals, onOpenSplit, onOpenLeaderboard, onOpenVoice, onOpenDealCalculator, onOpenCategoryOrder, onOpenPremium, onOpenCourier, onOpenPetStore, onOpenQr, onOpenGroupBy, grouped, onRefresh, refreshing, onOpenParticipants, readerSlot, bar }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  // הכלים מסתדרים לפי מה שבאמת משתמשים בו — הנפוצים ביותר קופצים למעלה
  const [usage, setUsage] = useState(() => {
    try { return JSON.parse(localStorage.getItem("featureUsage") || "{}"); } catch { return {}; }
  });

  const pick = (handler, label) => {
    setOpen(false);
    setUsage(prev => {
      const next = { ...prev, [label]: (prev[label] || 0) + 1 };
      localStorage.setItem("featureUsage", JSON.stringify(next));
      return next;
    });
    window.setTimeout(() => handler(), 260);
  };

  const byUsage = (tools) => [...tools].sort((a, b) => (usage[b.label] || 0) - (usage[a.label] || 0));

  // אלה הכלים שמובילים לקנייה חכמה — בחזית התפריט
  const mainTools = [
    { icon: ScanLine, label: t("barcode.title"), onClick: onOpenScanner },
    { icon: Mic, label: t("voice.title"), onClick: onOpenVoice },
    { icon: ClipboardList, label: t("templates.title"), onClick: onOpenTemplates },
    { icon: Tag, label: t("deals.title"), onClick: onOpenDeals },
    { icon: PawPrint, label: t("pet.title"), onClick: onOpenPetStore },
    ...(onOpenQr ? [{ icon: QrCode, label: t("share.qrButton"), onClick: onOpenQr }] : []),
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
    ...(onOpenGroupBy ? [{ icon: Layers, label: grouped ? t("list.ungroup") : t("list.groupByCategory"), onClick: onOpenGroupBy }] : []),
    { icon: Route, label: t("route.title"), onClick: onOpenRoute },
    { icon: Crown, label: t("premium.open"), onClick: onOpenPremium },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {bar ? (
          <button type="button" className={`${uiBarPill} inline-flex items-center gap-1`} title={t("list.moreFeatures")} aria-label={t("list.moreFeatures")}>
            {t("common.more")}
            <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          </button>
        ) : (
          <button type="button" className={uiOutline}>{t("list.moreFeatures")}</button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-ui-line bg-ui-canvas px-5 pb-8 pt-4 font-system text-ui-ink">
        <SheetHeader className="text-center">
          <SheetTitle className="text-[15px] font-semibold text-ui-ink">{t("list.moreFeatures")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {byUsage(mainTools).map((tool, index) => (
            <button
              key={tool.label}
              data-testid={`feature-${index}`}
              type="button"
              onClick={() => pick(tool.onClick, tool.label)}
              className="flex flex-col items-center gap-2 rounded-[10px] border border-ui-line bg-ui-canvas p-3 text-ui-ink transition-[background-color,color,box-shadow,opacity] duration-200 hover:bg-ui-surface active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent"
            >
              <tool.icon className="h-5 w-5 text-ui-accent" strokeWidth={1.8} />
              <span className="text-center text-[13px] leading-tight">{tool.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-[12px] text-ui-muted">עוד כלים</p>
        <div className={uiPillRow}>
          {byUsage(extraTools).map(tool => (
            <button key={tool.label} type="button" onClick={() => pick(tool.onClick, tool.label)}
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