import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ListHeader from "../components/minimal/ListHeader";
import QuickAddBar from "../components/QuickAddBar";
import AppFooter from "../components/AppFooter";
import MoreTools from "../components/list/MoreTools";
import DealsShelf from "@/components/deals/DealsShelf";
import ListItemsSection from "@/components/list/ListItemsSection";
import CategoryBar from "@/components/shelf/CategoryBar";
import ListDialogs from "@/components/list/ListDialogs";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useListDialogs } from "@/hooks/useListDialogs";
import { usePriceSync } from "@/hooks/usePriceSync";
import { useWarmChainPrices } from "@/hooks/useWarmChainPrices";
import { useListPresence } from "@/hooks/useListPresence";
import { useItemReminders } from "@/hooks/useItemReminders";
import { useChainDeals } from "@/hooks/useChainDeals";
import { useListNotifications } from "@/hooks/useListNotifications";
import { useListMessages } from "@/hooks/useListMessages";
import NotificationPrompt from "@/components/NotificationPrompt";
import LiveMembersBar from "@/components/live/LiveMembersBar";
import { useSimpleMode } from "@/lib/simpleMode";
import { useT } from "@/lib/i18n";
import { loadAllProducts } from "@/lib/loadAllProducts";
import { saveLastList } from "@/lib/lastList";
import { loadCategoryOrder, sortByCategoryOrder, sortItemsByCategory } from "@/lib/categoryOrder";
import { lineCost } from "@/lib/units";

// תמונת השוק הרחבה שמתחת להתראה — חלק משפת הכרזה של המסך

export default function ListView() {
  const { listId } = useParams();
  const t = useT();
  const dialogs = useListDialogs();
  const { show } = dialogs;

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
  // התראות בזמן אמת במכשיר — כשמישהו מהמשפחה מוסיף מוצר או מסמן מוצר כנקנה
  useListNotifications(listId, !!list?.push_enabled, user?.id);
  // הודעות המשתתפים מגיעות מיד, והמונה מראה מה עוד לא ראיתי
  const { messages, sendMessage } = useListMessages(listId, user);
  const incomingMessages = messages.filter(message => message.from_email !== (user?.email || ""));
  const [seenMessages, setSeenMessages] = useState(0);
  const unreadMessages = Math.max(0, incomingMessages.length - seenMessages);

  useEffect(() => {
    setSeenMessages(Number(localStorage.getItem(`mk_messages_seen_${listId}`) || 0));
    saveLastList(listId);
  }, [listId]);

  const markMessagesSeen = () => {
    setSeenMessages(incomingMessages.length);
    localStorage.setItem(`mk_messages_seen_${listId}`, String(incomingMessages.length));
  };

  useEffect(() => {
    loadAllProducts(1000).then(setAllProducts).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="pst-page min-h-screen">
        <div className="mx-auto w-full max-w-[1200px] space-y-3 px-4 py-6 sm:px-10">
          <div className="h-[220px] rounded-[18px] bg-[#f1f1f1]" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[190px] rounded-[18px] bg-[#f1f1f1]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="pst-page flex min-h-screen items-center justify-center">
        <p className="text-[22px] font-black">{t("list.notFound")}</p>
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
    <div className="pst-page min-h-screen">
      <ListHeader
        list={list}
        userName={user?.full_name}
        itemCount={pendingItems.length}
        total={totalPrice}
        onOpenProfile={() => show("profile")}
        onOpenSettings={() => show("settings")}
        onOpenShare={() => show("share")}
        onOpenQr={() => show("qr")}
      />

      <LiveMembersBar
        list={list}
        members={presence.members}
        myEmail={user?.email}
        myName={user?.full_name}
        unread={unreadMessages}
        onOpenShare={() => show("share")}
        onOpenMessages={() => { markMessagesSeen(); show("messages"); }}
      />

      {otherShoppers.length > 0 && (
        <p className="pst-note">{t("active.nowShopping", { name: otherShoppers.join(", ") })}</p>
      )}

      <NotificationPrompt list={list} onEnabled={() => setList(prev => ({ ...prev, push_enabled: true }))} />

      <CategoryBar categories={groupedCategories.map(([category]) => category)} />

      <main>
        <ListItemsSection
          groupedCategories={groupedCategories}
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
          listId={listId}
          onOpenAllDeals={() => show("deals")}
        />

        {!simple && (shoppingItems.length > 0 || unavailableItems.length > 0) && (
          <DealsShelf
            onAddProduct={handleAddProduct}
            onOpenAllDeals={() => show("deals")}
          />
        )}

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
          favorites={favorites}
          refreshing={refreshing}
          isOwner={isOwner}
          onAddProduct={handleAddProduct}
          onToggleFavorite={handleToggleFavorite}
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
        messages={messages}
        onSendMessage={sendMessage}
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