import ShareDialog from "@/components/ShareDialog";
import ParticipantsDialog from "@/components/ParticipantsDialog";
import ProductSearchDialog from "@/components/ProductSearchDialog";
import ProfileDialog from "@/components/ProfileDialog";
import SettingsDialog from "@/components/SettingsDialog";
import RenameListDialog from "@/components/RenameListDialog";
import NavigateToStoreDialog from "@/components/NavigateToStoreDialog";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import ChangePhotoDialog from "@/components/ChangePhotoDialog";
import SuggestPhotoDialog from "@/components/SuggestPhotoDialog";
import ItemReminderDialog from "@/components/ItemReminderDialog";
import ReportPriceDialog from "@/components/ReportPriceDialog";
import PriceSourcesDialog from "@/components/PriceSourcesDialog";
import PetStoreDialog from "@/components/PetStoreDialog";
import ShoppingMode from "@/components/ShoppingMode";
import BasketComparison from "@/components/BasketComparison";
import PriceCompareTable from "@/components/PriceCompareTable";
import ListTemplates from "@/components/ListTemplates";
import BarcodeScanner from "@/components/BarcodeScanner";
import ShoppingRoute from "@/components/ShoppingRoute";
import WeeklyMenu from "@/components/WeeklyMenu";
import CostSplitter from "@/components/CostSplitter";
import Leaderboard from "@/components/Leaderboard";
import CouponsDeals from "@/components/CouponsDeals";
import DealCalculator from "@/components/DealCalculator";
import CategoryOrderDialog from "@/components/CategoryOrderDialog";
import VoiceQuickAdd from "@/components/VoiceQuickAdd";
import PremiumDialog from "@/components/PremiumDialog";
import CourierDeliveryDialog from "@/components/CourierDeliveryDialog";

// כל חלונות העזר של הרשימה מרוכזים כאן — המסך עצמו רק אומר איזה חלון לפתוח
export default function ListDialogs({
  dialogs, listId, list, pendingItems, shoppingItems, favorites, user, allProducts, actions,
}) {
  const { open, show, hide, bind } = dialogs;

  return (
    <>
      <ShareDialog {...bind("share")} list={list} currentUser={user} itemCount={pendingItems.length} />
      <ParticipantsDialog {...bind("participants")} list={list} currentUser={user}
        onUpdated={actions.onListUpdated} />
      <ProductSearchDialog {...bind("search")} onAddProduct={actions.onAddProduct}
        favorites={favorites} onToggleFavorite={actions.onToggleFavorite} />
      <ProfileDialog {...bind("profile")} currentUser={user} onNameUpdated={actions.onNameUpdated}
        forceName={!user?.full_name} />
      <SettingsDialog {...bind("settings")} list={list} />
      <RenameListDialog {...bind("rename")} list={list}
        onRenamed={(title) => actions.onListUpdated({ title })} />
      <NavigateToStoreDialog {...bind("navigate")} product={open.navigate} />

      <ItemDetailsDialog item={open.edit} onClose={() => hide("edit")} onSave={actions.onUpdateDetails} />
      <ChangePhotoDialog item={open.photo} onClose={() => hide("photo")} onSaved={actions.onPhotoSaved} />
      <SuggestPhotoDialog item={open.suggest} listId={listId} userName={actions.userName}
        onClose={() => hide("suggest")} />
      <ItemReminderDialog item={open.reminder} onClose={() => hide("reminder")} onSaved={actions.onSetReminder} />
      <ReportPriceDialog item={open.report} listId={listId} userName={actions.userName}
        onClose={() => hide("report")} />
      <PriceSourcesDialog {...bind("sources")} />
      <PetStoreDialog {...bind("pet")} onAddProduct={actions.onAddProduct} />

      {open.shopping && (
        <ShoppingMode items={shoppingItems} onBought={actions.onToggleBought} onExit={() => hide("shopping")}
          userName={actions.userName} listId={listId} />
      )}
      <BasketComparison {...bind("basket")} items={pendingItems} onOpenSources={() => show("sources")} />
      <PriceCompareTable {...bind("priceCompare")} items={pendingItems} />
      <ListTemplates {...bind("templates")} listId={listId} allProducts={allProducts} onAdded={actions.onReload} />
      <BarcodeScanner {...bind("scanner")}
        onDetected={() => { hide("scanner"); show("search"); }} />
      <ShoppingRoute {...bind("route")} items={pendingItems} />
      <WeeklyMenu {...bind("menu")} onGenerate={actions.onAddMultiple} />
      <CostSplitter {...bind("split")} listId={listId} list={list} />
      <Leaderboard {...bind("leaderboard")} listId={listId} />
      <CouponsDeals {...bind("deals")} items={pendingItems} onAddProduct={actions.onAddProduct} />
      <DealCalculator {...bind("dealCalculator")} />
      <CategoryOrderDialog {...bind("categoryOrder")} onSaved={actions.onCategoryOrderSaved} />
      <VoiceQuickAdd {...bind("voice")} onAddProduct={actions.onAddProduct} allProducts={allProducts} />
      <PremiumDialog {...bind("premium")} />
      <CourierDeliveryDialog {...bind("courier")} listId={listId} items={pendingItems} userName={actions.userName} />
    </>
  );
}