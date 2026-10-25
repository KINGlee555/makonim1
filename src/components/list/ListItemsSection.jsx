import ListItemRow from "@/components/minimal/ListItemRow";
import EmptyListSuggestions from "@/components/EmptyListSuggestions";
import UnavailableItem from "@/components/UnavailableItem";
import { dealForItem } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";
import { bigCard, bigPill, bigSection, bigTitle } from "@/lib/bigUi";

// המוצרים עצמם: שורה גדולה לכל מוצר לפי סדר הקנייה, ואחריה מה שאזל או מסך ריק ידידותי.
export default function ListItemsSection({
  pendingItems, unavailableItems, favorites, chainDeals, removingIds, viewerName,
  onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onSetReminder,
  onUnavailable, onToggleFavorite, onChangePhoto, onUpdateDetails, onSuggestPhoto,
  onReportPrice, onPhotoFound, onRestore, onAddProduct, onOpenSearch, onOpenScanner, onOpenShoppingMode,
}) {
  const t = useT();

  return (
    <>
      {pendingItems.length > 0 && (
        <div className="mkc-list mt-6 sm:mt-8">
          {pendingItems.map((item, index) => (
            <ListItemRow
              key={item.id}
              item={item}
              index={index}
              onToggleBought={onToggleBought}
              onUpdateQuantity={onUpdateQuantity}
              onNavigate={onNavigate}
              onRemove={onRemove}
              onEdit={onEdit}
              onSetReminder={onSetReminder}
              onUnavailable={onUnavailable}
              onToggleFavorite={onToggleFavorite}
              onChangePhoto={onChangePhoto}
              onUpdateDetails={onUpdateDetails}
              onSuggestPhoto={onSuggestPhoto}
              onReportPrice={onReportPrice}
              deal={dealForItem(chainDeals, item)}
              onPhotoFound={onPhotoFound}
              isFavorite={favorites.some(favorite => favorite.name === item.name)}
              viewerName={viewerName}
              className={removingIds.has(item.id) ? "animate-slide-out" : ""}
            />
          ))}
        </div>
      )}

      {unavailableItems.length > 0 && (
        <section className={bigSection}>
          <h3 className={bigTitle}>{t("list.unavailable")}</h3>
          <div className="border-t-2 border-big-line-soft">
            {unavailableItems.map(item => <UnavailableItem key={item.id} item={item} onRestore={onRestore} />)}
          </div>
        </section>
      )}

      {pendingItems.length === 0 && unavailableItems.length === 0 && (
        <section className={`${bigSection} ${bigCard}`}>
          <p className="text-[20px] text-big-ink sm:text-[24px]">{t("list.empty")}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={onOpenSearch} className={bigPill}>{t("quickAdd.search")}</button>
            <button type="button" onClick={onOpenScanner} className={bigPill}>{t("barcode.title")}</button>
            <button type="button" onClick={onOpenShoppingMode} className={bigPill}>{t("shoppingMode.title")}</button>
          </div>
          <EmptyListSuggestions onAddProduct={onAddProduct} />
        </section>
      )}
    </>
  );
}