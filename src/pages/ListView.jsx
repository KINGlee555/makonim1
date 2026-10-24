import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ListHeader from "../components/minimal/ListHeader";
import QuickAddBar from "../components/QuickAddBar";
import ListExtras from "../components/ListExtras";
import AppFooter from "../components/AppFooter";
import SharedWithStrip from "../components/SharedWithStrip";
import SmartTools from "../components/SmartTools";
import RecentlyBought from "../components/RecentlyBought";
import FillFromLastWeek from "../components/FillFromLastWeek";
import PriceDropNotice from "../components/PriceDropNotice";
import MonthlySummary from "../components/MonthlySummary";
import DeliveryNotice from "../components/DeliveryNotice";
import FeatureMenu from "../components/FeatureMenu";
import ListReader from "../components/ListReader";
import PremiumBanner from "../components/PremiumBanner";
import SponsoredSlot from "../components/sponsored/SponsoredSlot";
import ListItemsSection from "@/components/list/ListItemsSection";
import ListDialogs from "@/components/list/ListDialogs";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useListDialogs } from "@/hooks/useListDialogs";
import { usePriceSync } from "@/hooks/usePriceSync";
import { useWarmChainPrices } from "@/hooks/useWarmChainPrices";
import { useListPresence } from "@/hooks/useListPresence";
import { useItemReminders } from "@/hooks/useItemReminders";
import { useChainDeals } from "@/hooks/useChainDeals";
import { useSimpleMode } from "@/lib/simpleMode";
import { useT } from "@/lib/i18n";
import { loadAllProducts } from "@/lib/loadAllProducts";
import { loadCategoryOrder, sortByCategoryOrder, sortItemsByCategory } from "@/lib/categoryOrder";
import { lineCost } from "@/lib/units";
import { uiEnter, uiSection, uiBanner } from "@/lib/minimalUi";

export default function ListView() {
  const { listId } = useParams();
  const t = useT();
  const dialogs = useListDialogs();
  const { open, show } = dialogs;

  const [groupByCategory, setGroupByCategory] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [categoryOrder, setCategoryOrder] = useState(loadCategoryOrder);
  const [allProducts, setAllProducts] = useState([]);

  const {
    list, setList, items, setItems, favorites, user, userNameRef,
    loading, refreshing, removingIds, loadData, handleRefresh, handleNameUpdated,
    handleToggleBought, handleUpdateQuantity, handleUpdateDetails, handlePhotoFound,
    handleSetReminder, handleUnavailable, handleRestore, handleToggleFavorite,
    handleAddProduct, handleAddMultiple, handleRemoveItem,
  } = useShoppingList(listId, { t, onNeedProfile: () => show("profile") });

  // מרוויחים מחירים אמיתיים מהרשתות ברקע, כדי שהשוואה תיפתח מיד
  usePriceSync();
  useWarmChainPrices(items);
  // תזכורות לפריטים שהגיע זמנן
  useItemReminders(items);
  // מבצעים אמיתיים מהרשתות עבור המוצרים ברשימה
  const chainDeals = useChainDeals(items);
  // מי נמצא איתך ברשימה — נוכחות חיה, מתעדכנת כל חצי דקה
  const presence = useListPresence(listId, user);
  // מצב פשוט — מסתיר כל מה שאינו הכרחי לקנייה עצמה; הכל נשאר נגיש דרך "עוד"
  const [simple] = useSimpleMode();

  useEffect(() => {
    loadAllProducts(1000).then(setAllProducts).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ui-canvas font-system font-medium">
        <div className="mx-auto w-full max-w-[760px] space-y-2 px-5 py-4 sm:px-7">
          <div className="h-11 rounded-[22px] bg-ui-surface shimmer" />
          <div className="h-12 rounded-[22px] bg-ui-surface shimmer" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[44px] rounded-lg bg-ui-surface shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-canvas font-system">
        <p className="text-[20px] font-semibold text-ui-ink">{t("list.notFound")}</p>
      </div>
    );
  }

  // רק המזמין — בעל הרשימה — מנהל את רשימת המשתתפים
  // רשימות ותיקות נשמרו בלי בעל מזוהה (anonymous) — כמו בשכבת המשתמשים, הן נחשבות של המשתמש
  const isOwner = !!user && (
    list.created_by_id === user.id ||
    list.created_by === user.email ||
    !list.created_by ||
    list.created_by === "anonymous"
  );

  const pendingItems = items.filter(i => !i.status || i.status === "pending");
  // מצב קנייה עובר על המוצרים לפי סדר המחלקות בסופר — כל מחלקה ברצף אחד
  const shoppingItems = sortItemsByCategory(pendingItems, categoryOrder);
  const unavailableItems = items.filter(i => i.status === "unavailable");
  const totalPrice = pendingItems.reduce((sum, i) => sum + lineCost(i), 0);
  const otherShoppers = (list.active_shoppers || []).filter(s => s !== userNameRef.current);
  const groupedCategories = Object.entries(
    pendingItems.reduce((groups, item) => {
      const cat = item.category || t("summary.other");
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
      return groups;
    }, {})
  ).sort(([a], [b]) => {
    const sorted = sortByCategoryOrder([a, b], categoryOrder);
    return sorted[0] === a ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-ui-canvas font-system font-medium text-ui-ink tabular-nums">
      <ListHeader
        list={list}
        userName={user?.full_name}
        itemCount={pendingItems.length}
        total={totalPrice}
        onOpenProfile={() => show("profile")}
        onOpenSettings={() => show("settings")}
        onOpenShare={() => show("share")}
        onOpenQr={() => show("qr")}
        onRename={() => show("rename")}
        onAdd={() => show("search")}
      />

      <main className="mx-auto w-full max-w-[760px] px-5 pb-[110px] sm:px-7">
        <SharedWithStrip list={list} members={presence.members} myEmail={user?.email} onOpen={() => show("share")} />

        {!simple && (
          <div className={uiEnter}>
            <SmartTools items={pendingItems} onOpenBasket={() => show("basket")} />
          </div>
        )}

        <PriceDropNotice listId={listId} items={pendingItems} />

        <MonthlySummary listId={listId} />

        <DeliveryNotice listId={listId} delay={0.05} />

        {otherShoppers.length > 0 && (
          <div className={`${uiSection} ${uiEnter}`}>
            <div className={uiBanner}>
              {t("active.nowShopping", { name: otherShoppers.join(", ") })}
            </div>
          </div>
        )}

        <ListItemsSection
          listId={listId}
          items={items}
          pendingItems={pendingItems}
          unavailableItems={unavailableItems}
          groupedCategories={groupedCategories}
          groupByCategory={groupByCategory}
          showSuggestions={showSuggestions}
          simple={simple}
          favorites={favorites}
          chainDeals={chainDeals}
          removingIds={removingIds}
          viewerName={user?.full_name}
          onAddProduct={handleAddProduct}
          onToggleBought={handleToggleBought}
          onUpdateQuantity={handleUpdateQuantity}
          onNavigate={(item) => show("navigate", item)}
          onRemove={handleRemoveItem}
          onEdit={(item) => show("edit", item)}
          onSetReminder={(item) => show("reminder", item)}
          onUnavailable={handleUnavailable}
          onToggleFavorite={handleToggleFavorite}
          onChangePhoto={(item) => show("photo", item)}
          onUpdateDetails={handleUpdateDetails}
          onSuggestPhoto={(item) => show("suggest", item)}
          onReportPrice={(item) => show("report", item)}
          onPhotoFound={handlePhotoFound}
          onRestore={handleRestore}
        />

        <FillFromLastWeek listId={listId} currentItems={items} onFilled={loadData} />

        {!simple && <RecentlyBought listId={listId} delay={0.1} />}

        {!simple && (
          <div className={`${uiSection} ${uiEnter}`}>
            <ListExtras list={list} listId={listId} items={items} favorites={favorites}
              onAddProduct={handleAddProduct} onToggleFavorite={handleToggleFavorite} />
          </div>
        )}

        {!simple && <SponsoredSlot delay={0.15} />}

        {!simple && (
          <div className={`${uiSection} ${uiEnter}`}>
            <PremiumBanner onOpen={() => show("premium")} />
          </div>
        )}

        <AppFooter />
      </main>

      <QuickAddBar
        onOpenSearch={() => show("search")}
        onOpenScanner={() => show("scanner")}
        onOpenShoppingMode={() => show("shopping")}
        hasItems={pendingItems.length > 0}
        tools={
          <FeatureMenu
            bar
            grouped={groupByCategory}
            onOpenGroupBy={() => setGroupByCategory(g => !g)}
            onOpenSuggestions={() => setShowSuggestions(v => !v)}
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
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onOpenParticipants={isOwner ? () => show("participants") : null}
            readerSlot={<ListReader items={pendingItems} />}
          />
        }
      />

      <ListDialogs
        dialogs={dialogs}
        listId={listId}
        list={list}
        pendingItems={pendingItems}
        shoppingItems={shoppingItems}
        favorites={favorites}
        user={user}
        allProducts={allProducts}
        actions={{
          userName: userNameRef.current,
          onListUpdated: (patch) => setList(prev => ({ ...prev, ...patch })),
          onNameUpdated: handleNameUpdated,
          onAddProduct: handleAddProduct,
          onAddMultiple: handleAddMultiple,
          onToggleFavorite: handleToggleFavorite,
          onToggleBought: handleToggleBought,
          onUpdateDetails: handleUpdateDetails,
          onSetReminder: handleSetReminder,
          onPhotoSaved: (id, url) => setItems(prev => prev.map(i => (i.id === id ? { ...i, image_url: url } : i))),
          onCategoryOrderSaved: setCategoryOrder,
          onReload: loadData,
        }}
      />
    </div>
  );
}