import { useState } from "react";
import SharedWithStrip from "@/components/SharedWithStrip";
import SmartTools from "@/components/SmartTools";
import ListExtras from "@/components/ListExtras";
import FeatureMenu from "@/components/FeatureMenu";
import ListReader from "@/components/ListReader";
import PriceDropNotice from "@/components/PriceDropNotice";
import MonthlySummary from "@/components/MonthlySummary";
import DeliveryNotice from "@/components/DeliveryNotice";
import SponsoredSlot from "@/components/sponsored/SponsoredSlot";
import PremiumBanner from "@/components/PremiumBanner";
import SmartSuggestions from "@/components/SmartSuggestions";
import RecentlyBought from "@/components/RecentlyBought";
import FillFromLastWeek from "@/components/FillFromLastWeek";
import ToolStrip from "@/components/shelf/ToolStrip";
import { useT } from "@/lib/i18n";
import usePremium from "@/hooks/usePremium";

// "עוד כלים": כל מה שלא צריך על מסך הקנייה יושב בכרטיסים שנגללים הצידה,
// וכל כלי נפתח בלחיצה אחת מתחת לשורה — בלי ערימה של מקטעים.
export default function MoreTools({
  list, listId, items, pendingItems, groupedCategories, boughtCount, members, myEmail,
  simple, showSuggestions, favorites, refreshing, isOwner,
  onAddProduct, onToggleFavorite, onToggleSuggestions, onRefresh, onReload, show,
}) {
  const t = useT();
  const { isPremium } = usePremium();
  const [open, setOpen] = useState("");
  const toggle = (id) => setOpen(current => (current === id ? "" : id));

  const people = members
    .filter(member => member.user_email && member.user_email !== myEmail)
    .map(member => member.user_name || member.user_email.split("@")[0]);

  const tools = [
    { id: "presence", label: t("presence.open"), note: people.slice(0, 2).join(" · ") || t("presence.alone"), tone: "shf-card-t" },
    ...(simple ? [] : [{ id: "basket", label: t("basket.title"), tone: "shf-card-b" }]),
    { id: "departments", label: t("big.departments"), note: groupedCategories.slice(0, 3).map(([category]) => category).join(" · "), tone: "shf-card-k" },
    ...(simple ? [] : [{ id: "smart", label: t("big.smartStart") }]),
    { id: "drops", label: t("drops.title"), tone: "shf-card-b" },
    { id: "monthly", label: t("monthly.title"), tone: "shf-card-t" },
    { id: "delivery", label: t("courier.open"), tone: "shf-card-k" },
    ...(simple ? [] : [
      { id: "more", label: t("list.moreFeatures") },
      { id: "sponsored", label: t("sponsored.label"), tone: "shf-card-b" },
      { id: "premium", label: t("premium.open"), tone: "shf-card-t" },
    ]),
  ];

  const panels = {
    presence: <SharedWithStrip list={list} members={members} myEmail={myEmail} onOpen={() => show("share")} />,
    basket: <SmartTools items={pendingItems} onOpenBasket={() => show("basket")} />,
    departments: (
      <div className="rounded-[12px] border-2 border-[#f1f1f1] px-4">
        {groupedCategories.map(([category, categoryItems], index) => (
          <div key={category}
            className={`flex items-center justify-between gap-3 py-2.5 text-[17px] ${index < groupedCategories.length - 1 ? "border-b-2 border-[#f1f1f1]" : ""}`}>
            <span className="min-w-0 truncate">{category}</span>
            <span className="flex-none rounded-[8px] border-2 border-[#171A1C] px-3 text-[15px]">{categoryItems.length}</span>
          </div>
        ))}
      </div>
    ),
    smart: (
      <>
        <FillFromLastWeek listId={listId} currentItems={items} onFilled={onReload} />
        {showSuggestions && <SmartSuggestions listId={listId} currentItems={items} onAddProduct={onAddProduct} delay={0.1} />}
        <RecentlyBought listId={listId} delay={0.1} />
      </>
    ),
    drops: <PriceDropNotice listId={listId} items={pendingItems} />,
    monthly: <MonthlySummary listId={listId} />,
    delivery: <DeliveryNotice listId={listId} delay={0.05} />,
    more: (
      <>
        <FeatureMenu
          bar
          onOpenBasket={() => show("basket")}
          onOpenPriceCompare={() => show("priceCompare")}
          onOpenTemplates={() => show("templates")}
          onOpenScanner={() => show("scanner")}
          onOpenRoute={() => show("route")}
          onOpenMenu={() => show("menu")}
          onOpenDeals={() => show("deals")}
          onOpenSplit={() => (isPremium ? show("split") : show("premium"))}
          onOpenLeaderboard={() => show("leaderboard")}
          onOpenVoice={() => show("voice")}
          onOpenDealCalculator={() => show("dealCalculator")}
          onOpenCategoryOrder={() => show("categoryOrder")}
          onOpenPremium={() => show("premium")}
          onOpenCourier={() => show("courier")}
          onOpenPetStore={() => show("pet")}
          onOpenQr={() => show("qr")}
          onOpenSuggestions={onToggleSuggestions}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onOpenParticipants={isOwner ? () => show("participants") : null}
          readerSlot={<ListReader items={pendingItems} />}
        />
        <ListExtras list={list} listId={listId} items={items} favorites={favorites}
          onAddProduct={onAddProduct} onToggleFavorite={onToggleFavorite} />
      </>
    ),
    sponsored: <SponsoredSlot delay={0.15} />,
    premium: <PremiumBanner onOpen={() => show("premium")} />,
  };

  return (
    <section className="shf-tools">
      <h2>{t("list.moreFeatures")}</h2>
      {boughtCount > 0 && <p className="shf-meta mb-3">{t("list.boughtSection")} · {boughtCount}</p>}
      <ToolStrip tools={tools} open={open} onToggle={toggle} />
      {open && <div className="shf-panel">{panels[open]}</div>}
    </section>
  );
}