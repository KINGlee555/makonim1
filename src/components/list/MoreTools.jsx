import { ChevronUp } from "lucide-react";
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
import { useT } from "@/lib/i18n";
import { bigAlert, bigCard, bigSection, bigTitle } from "@/lib/bigUi";

// "עוד כלים" — כל מה שלא צריך על המסך הראשי: מי איתך, הסל, המחלקות, ההצעות והכלים.
export default function MoreTools({
  list, listId, items, pendingItems, groupedCategories, boughtCount, members, myEmail,
  simple, showSuggestions, favorites, refreshing, isOwner,
  onAddProduct, onToggleFavorite, onToggleSuggestions, onRefresh, onReload, show,
}) {
  const t = useT();

  return (
    <details open className="big-more big-in mt-8 sm:mt-[34px]" style={{ animationDelay: ".5s" }}>
      <summary className="flex cursor-pointer items-center justify-between rounded-[20px] border-2 border-big-blue bg-big-surface px-5 py-4 text-[22px] font-semibold text-big-blue hover:bg-big-turquoise/15 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-big-attn sm:px-[30px] sm:py-[26px] sm:text-[30px]">
        {t("list.moreFeatures")}
        <ChevronUp className="h-6 w-6 shrink-0 sm:h-[30px] sm:w-[30px]" strokeWidth={2.4} />
      </summary>

      <div className="pt-1">
        <SharedWithStrip list={list} members={members} myEmail={myEmail} onOpen={() => show("share")} />

        {!simple && (
          <section className={bigSection}>
            <SmartTools items={pendingItems} onOpenBasket={() => show("basket")} />
          </section>
        )}

        {boughtCount > 0 && (
          <section className={bigSection}>
            <p className={bigAlert}>{t("list.boughtSection")} · {boughtCount}</p>
          </section>
        )}

        {groupedCategories.length > 0 && (
          <section className={bigSection}>
            <h3 className={bigTitle}>{t("big.departments")}</h3>
            <div className={`${bigCard} py-1 sm:py-2`}>
              {groupedCategories.map(([category, categoryItems], index) => (
                <div key={category}
                  className={`flex items-center gap-3.5 py-3.5 text-[18px] text-big-ink sm:text-[26px] ${index < groupedCategories.length - 1 ? "border-b-2 border-big-line-soft" : ""}`}>
                  <span className="min-w-0 flex-1 truncate">{category}</span>
                  <span className="shrink-0 rounded-[12px] border-2 border-big-pink px-3 text-[15px] leading-8 text-big-pink sm:text-[20px]">{categoryItems.length}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={bigSection}>
          <h3 className={bigTitle}>{t("big.smartStart")}</h3>
          <div className={bigCard}>
            <FillFromLastWeek listId={listId} currentItems={items} onFilled={onReload} />
            {showSuggestions && !simple && (
              <SmartSuggestions listId={listId} currentItems={items} onAddProduct={onAddProduct} delay={0.1} />
            )}
            {!simple && <RecentlyBought listId={listId} delay={0.1} />}
          </div>
        </section>

        <section className={bigSection}><div className={bigCard}><PriceDropNotice listId={listId} items={pendingItems} /></div></section>
        <section className={bigSection}><div className={bigCard}><MonthlySummary listId={listId} /></div></section>
        <section className={bigSection}><div className={bigCard}><DeliveryNotice listId={listId} delay={0.05} /></div></section>

        {!simple && (
          <section className={bigSection}>
            <div className={bigCard}>
              <ListExtras list={list} listId={listId} items={items} favorites={favorites}
                onAddProduct={onAddProduct} onToggleFavorite={onToggleFavorite} />
            </div>
          </section>
        )}

        <section className={bigSection}>
          <div className={bigCard}>
          <FeatureMenu
            bar
            onOpenBasket={() => show("basket")}
            onOpenPriceCompare={() => show("priceCompare")}
            onOpenTemplates={() => show("templates")}
            onOpenScanner={() => show("scanner")}
            onOpenRoute={() => show("route")}
            onOpenMenu={() => show("menu")}
            onOpenDeals={() => show("deals")}
            onOpenSplit={() => show("split")}
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
          </div>
        </section>

        {!simple && (
          <section className={bigSection}>
            <div className={bigCard}><SponsoredSlot delay={0.15} /></div>
          </section>
        )}

        {!simple && (
          <section className={bigSection}>
            <div className={bigCard}><PremiumBanner onOpen={() => show("premium")} /></div>
          </section>
        )}
      </div>
    </details>
  );
}