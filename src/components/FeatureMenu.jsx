import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Store, ClipboardList, ScanLine, Route, CalendarDays, Receipt, Trophy, Tag, Mic } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function FeatureMenu({ onOpenBasket, onOpenTemplates, onOpenScanner, onOpenRoute, onOpenMenu, onOpenDeals, onOpenSplit, onOpenLeaderboard, onOpenVoice }) {
  const t = useT();

  const features = [
    { icon: Store, label: t("basket.title"), onClick: onOpenBasket, color: "text-blue-500" },
    { icon: ClipboardList, label: t("templates.title"), onClick: onOpenTemplates, color: "text-primary" },
    { icon: ScanLine, label: t("barcode.title"), onClick: onOpenScanner, color: "text-purple-500" },
    { icon: Route, label: t("route.title"), onClick: onOpenRoute, color: "text-green-500" },
    { icon: CalendarDays, label: t("menu.title"), onClick: onOpenMenu, color: "text-orange-500" },
    { icon: Tag, label: t("deals.title"), onClick: onOpenDeals, color: "text-red-500" },
    { icon: Receipt, label: t("split.title"), onClick: onOpenSplit, color: "text-teal-500" },
    { icon: Trophy, label: t("leaderboard.title"), onClick: onOpenLeaderboard, color: "text-amber-500" },
    { icon: Mic, label: t("voice.title"), onClick: onOpenVoice, color: "text-pink-500" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-xl px-3 flex items-center gap-1.5 flex-shrink-0">
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
              onClick={() => f.onClick()}
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