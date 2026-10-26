import ListItemRow from "@/components/minimal/ListItemRow";
import EmptyListSuggestions from "@/components/EmptyListSuggestions";
import UnavailableItem from "@/components/UnavailableItem";
import { dealForItem } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";

// הפס של כל מחלקה מתחלף בין שלושת הצבעים, כדי שהגלילה תיקרא כמקטעי מדף.
const BANDS = ["shf-sh-1", "shf-sh-2", "shf-sh-3"];

// המוצרים עצמם: מקטע לכל מחלקה, ובתוכו אריחים — ואחר כך מה שאזל או מסך ריק ידידותי.
export default function ListItemsSection({
  groupedCategories, pendingItems, unavailableItems, favorites, chainDeals, removingIds, viewerName,
  onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onSetReminder,
  onUnavailable, onToggleFavorite, onChangePhoto, onUpdateDetails, onSuggestPhoto,
  onReportPrice, onPhotoFound, onRestore, onAddProduct, onOpenSearch, onOpenScanner, onOpenShoppingMode,
}) {
  const t = useT();

  return (
    <>
      {groupedCategories.map(([category, categoryItems], sectionIndex) => (
        <section key={category} className="shf-sec">
          <h2 className={`shf-sh ${BANDS[sectionIndex % BANDS.length]}`}>
            <span className="min-w-0 truncate">{category}</span>
            <span className="shf-n">{categoryItems.length}</span>
          </h2>
          <div className="shf-grid">
            {categoryItems.map((item, index) => (
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
        </section>
      ))}

      {unavailableItems.length > 0 && (
        <section className="shf-sec">
          <h2 className="shf-sh shf-sh-3">
            <span className="min-w-0 truncate">{t("list.unavailable")}</span>
            <span className="shf-n">{unavailableItems.length}</span>
          </h2>
          <div className="shf-panel">
            {unavailableItems.map(item => <UnavailableItem key={item.id} item={item} onRestore={onRestore} />)}
          </div>
        </section>
      )}

      {pendingItems.length === 0 && unavailableItems.length === 0 && (
        <section className="shf-sec">
          <div className="shf-panel">
            <p className="shf-nm text-[20px] sm:text-[24px]">{t("list.empty")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={onOpenSearch} className="shf-push-btn">{t("quickAdd.search")}</button>
              <button type="button" onClick={onOpenScanner} className="shf-push-btn">{t("barcode.title")}</button>
              <button type="button" onClick={onOpenShoppingMode} className="shf-push-btn">{t("shoppingMode.title")}</button>
            </div>
            <EmptyListSuggestions onAddProduct={onAddProduct} />
          </div>
        </section>
      )}
    </>
  );
}