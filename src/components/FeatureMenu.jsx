import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Store, ClipboardList, ScanLine, Route, CalendarDays, Receipt, Trophy, Tag, Mic, Calculator, ArrowUpDown, Scale } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function FeatureMenu({ onOpenBasket, onOpenPriceCompare, onOpenTemplates, onOpenScanner, onOpenRoute, onOpenMenu, onOpenDeals, onOpenSplit, onOpenLeaderboard, onOpenVoice, onOpenDealCalculator, onOpenCategoryOrder }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const features = [
    { icon: Scale, label: t("compare.open"), onClick: onOpenPriceCompare, color: "text-primary" },
    { icon: Store, label: t("basket.title"), onClick: onOpenBasket, color: "text-blue-500" },
    { icon: ClipboardList, label: t("templates.title"), onClick: onOpenTemplates, color: "text-primary" },
    { icon: ScanLine, label: t("barcode.title"), onClick: onOpenScanner, color: "text-purple-500" },
    { icon: Route, label: t("route.title"), onClick: onOpenRoute, color: "text-green-500" },
    { icon: CalendarDays, label: t("menu.title"), onClick: onOpenMenu, color: "text-orange-500" },
    { icon: Tag, label: t("deals.title"), onClick: onOpenDeals, color: "text-red-500" },
    { icon: Receipt, label: t("split.title"), onClick: onOpenSplit, color: "text-teal-500" },
    { icon: Trophy, label: t("leaderboard.title"), onClick: onOpenLeaderboard, color: "text-amber-500" },
    { icon: Mic, label: t("voice.title"), onClick: onOpenVoice, color: "text-pink-500" },
    { icon: Calculator, label: "מחשבון מבצעים", onClick: onOpenDealCalculator, color: "text-emerald-600" },
    { icon: ArrowUpDown, label: "סדר המחלקות", onClick: onOpenCategoryOrder, color: "text-indigo-500" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="h-11 w-full rounded-lg bg-primary px-2 text-primary-foreground shadow-sm flex items-center justify-center gap-1.5 text-sm font-semibold">
          <LayoutGrid className="w-4 h-4" />
          {t("list.moreFeatures")}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 pt-4">
        <SheetHeader className="text-center">
          <SheetTitle className="text-xl">{t("list.moreFeatures")}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {features.map((f, i) => (
            <button
              key={i}
              data-testid={`feature-${i}`}
              onClick={() => { setOpen(false); window.setTimeout(() => f.onClick(), 260); }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card hover:bg-accent transition-colors active:scale-95"
            >
              <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-center leading-tight">{f.label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}