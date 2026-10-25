import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ListHeader from "../components/minimal/ListHeader";
import QuickAddBar from "../components/QuickAddBar";
import AppFooter from "../components/AppFooter";
import MoreTools from "../components/list/MoreTools";
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
import { bigAlert } from "@/lib/bigUi";

export default function ListView() {
  const { listId } = useParams();
  const t = useT();
  const dialogs = useListDialogs();
  const { show } = dialogs;

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
  // מצב פשוט — מסתיר כל מה שאינו הכרחי לקנייה עצמה; הכל נשאר נגיש דרך "עוד כלים"
  const [simple] = useSimpleMode();

  useEffect(() => {
    loadAllProducts(1000).then(setAllProducts).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="big-page min-h-screen bg-big-canvas font-system font-semibold">
        <div className="mx-auto w-full max-w-[940px] space-y-3 px-5 py-6 sm:px-7">
          <div className="h-16 rounded-[18px] bg-big-surface shimmer" />
          <div className="h-12 rounded-[18px] bg-big-surface shimmer" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[92px] rounded-[18px] bg-big-surface shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="big-page flex min-h-screen items-center justify-center bg-big-canvas font-system">
        <p className="text-[24px] font-semibold text-big-ink">{t("list.notFound")}</p>
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
  // הרשימה מוצגת לפי סדר המחלקות בסופר — כמו שמהלכים בחנות
  const shoppingItems = sortItemsByCategory(pendingItems, categoryOrder);
  const unavailableItems = items.filter(i => i.status === "unavailable");
  const boughtCount = items.filter(i => i.status === "bought").length;
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
    <div className="big-page min-h-screen bg-big-canvas font-system font-semibold text-big-ink tabular-nums">
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
      />

      <main className="mx-auto w-full max-w-[940px] px-5 pb-[170px] sm:px-7 sm:pb-[200px]">
        {otherShoppers.length > 0 && (
          <p className={`${bigAlert} mt-5`}>{t("active.nowShopping", { name: otherShoppers.join(", ") })}</p>
        )}

        <ListItemsSection
          pendingItems={shoppingItems}
          unavailableItems={unavailableItems}
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
          onOpenSearch={() => show("search")}
          onOpenScanner={() => show("scanner")}
          onOpenShoppingMode={() => show("shopping")}
        />

        <MoreTools
          list={list}
          listId={listId}
          items={items}
          pendingItems={pendingItems}
          groupedCategories={groupedCategories}
          boughtCount={boughtCount}
          members={presence.members}
          myEmail={user?.email}
          simple={simple}
          showSuggestions={showSuggestions}
          favorites={favorites}
          refreshing={refreshing}
          isOwner={isOwner}
          onAddProduct={handleAddProduct}
          onToggleFavorite={handleToggleFavorite}
          onToggleSuggestions={() => setShowSuggestions(v => !v)}
          onRefresh={handleRefresh}
          onReload={loadData}
          show={show}
        />

        <AppFooter />
      </main>

      <QuickAddBar
        onOpenSearch={() => show("search")}
        onOpenScanner={() => show("scanner")}
        onOpenShoppingMode={() => show("shopping")}
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