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
import AreaDeals from "@/components/deals/AreaDeals";
import RecentlyBought from "@/components/RecentlyBought";
import FillFromLastWeek from "@/components/FillFromLastWeek";
import ToolStrip from "@/components/shelf/ToolStrip";
import { useT } from "@/lib/i18n";
import usePremium from "@/hooks/usePremium";

// "עוד כלים": כל מה שלא צריך על מסך הקנייה יושב בכרטיסים שנגללים הצידה,
// וכל כלי נפתח בלחיצה אחת מתחת לשורה — בלי ערימה של מקטעים.
export default function MoreTools({
  list, listId, items, pendingItems, groupedCategories, boughtCount, members, myEmail,
  simple, favorites, refreshing, isOwner,
  onAddProduct, onToggleFavorite, onRefresh, onReload, show,
}) {
  const t = useT();
  const { isPremium } = usePremium();
  const [open, setOpen] = useState("");
  const toggle = (id) => setOpen(current => (current === id ? "" : id));

  const people = members
    .filter(member => member.user_email && member.user_email !== myEmail)
    .map(member => member.user_name || member.user_email.split("@")[0]);

  const tools = [
    { id: "presence", label: t("presence.open"), note: people.slice(0, 2).join(" · ") || t("presence.alone") },
    ...(simple ? [] : [{ id: "basket", label: t("basket.title") }]),
    { id: "departments", label: t("big.departments"), note: groupedCategories.slice(0, 3).map(([category]) => category).join(" · ") },
    ...(simple ? [] : [{ id: "area", label: t("area.title") }]),
    { id: "drops", label: t("drops.title") },
    { id: "monthly", label: t("monthly.title") },
    { id: "delivery", label: t("courier.open") },
    ...(simple ? [] : [
      { id: "more", label: t("list.moreFeatures") },
      { id: "sponsored", label: t("sponsored.label") },
      { id: "premium", label: t("premium.open") },
    ]),
  ];

  // שתי שורות כרטיסים כמו בכרזה — כל שורה נגללת הצידה כשהמסך צר
  const rows = [tools.slice(0, 6), tools.slice(6)].filter(row => row.length);

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
    area: (
      <>
        <AreaDeals listId={listId} items={pendingItems} onAddProduct={onAddProduct} onOpenAllDeals={() => show("deals")} />
        <FillFromLastWeek listId={listId} currentItems={items} onFilled={onReload} />
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
    <section className="pst-tools">
      <h2>{t("list.moreFeatures")}</h2>
      {boughtCount > 0 && <p className="pst-tools-note">{t("list.boughtSection")} · {boughtCount}</p>}
      {rows.map((row, index) => (
        <ToolStrip key={index} tools={row} open={open} onToggle={toggle} className={index === 1 ? "pst-strip-2" : ""} />
      ))}
      {open && <div className="pst-panel">{panels[open]}</div>}
    </section>
  );
}