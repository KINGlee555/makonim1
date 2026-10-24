import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Store, ClipboardList, ScanLine, Route, CalendarDays, Receipt, Trophy, Tag, Mic, Calculator, ArrowUpDown, Scale, Layers, Sparkles, Crown, Truck } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function FeatureMenu({ onOpenBasket, onOpenPriceCompare, onOpenTemplates, onOpenScanner, onOpenRoute, onOpenMenu, onOpenDeals, onOpenSplit, onOpenLeaderboard, onOpenVoice, onOpenDealCalculator, onOpenCategoryOrder, onOpenPremium, onOpenCourier, onOpenGroupBy, grouped, onOpenSuggestions }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const pick = (handler) => { setOpen(false); window.setTimeout(() => handler(), 260); };

  // אלה הכלים שמובילים לקנייה חכמה — בחזית התפריט
  const mainTools = [
    { icon: ScanLine, label: t("barcode.title"), onClick: onOpenScanner, color: "text-purple-500" },
    { icon: Mic, label: t("voice.title"), onClick: onOpenVoice, color: "text-pink-500" },
    { icon: ClipboardList, label: t("templates.title"), onClick: onOpenTemplates, color: "text-primary" },
    { icon: Tag, label: t("deals.title"), onClick: onOpenDeals, color: "text-red-500" },
    { icon: CalendarDays, label: t("menu.title"), onClick: onOpenMenu, color: "text-orange-500" },
    { icon: Truck, label: t("courier.open"), onClick: onOpenCourier, color: "text-sky-600" },
  ];

  // והשאר בקיצור, בלי להעמיס על המסך
  const extraTools = [
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
        <Button className="h-14 w-full rounded-[28px] bg-market-yellow px-2 text-[17px] font-black text-market-ink flex items-center justify-center gap-1.5 hover:bg-market-yellow hover:text-market-ink">
          <LayoutGrid className="w-4 h-4" />
          {t("list.moreFeatures")}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 pt-4">
        <SheetHeader className="text-center">
          <SheetTitle className="text-xl">{t("list.moreFeatures")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {mainTools.map((tool, index) => (
            <button
              key={tool.label}
              data-testid={`feature-${index}`}
              onClick={() => pick(tool.onClick)}
              className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 transition-colors hover:bg-accent active:scale-95"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${tool.color}`}>
                <tool.icon className="h-6 w-6" />
              </div>
              <span className="text-center text-sm font-medium leading-tight">{tool.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 mt-6 text-sm font-bold text-muted-foreground">עוד כלים</p>
        <div className="flex flex-wrap gap-2">
          {extraTools.map(tool => (
            <button
              key={tool.label}
              onClick={() => pick(tool.onClick)}
              className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
            >
              <tool.icon className="h-4 w-4 text-muted-foreground" />{tool.label}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}