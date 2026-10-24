import ListItemRow from "@/components/minimal/ListItemRow";
import CategoryHeader from "@/components/minimal/CategoryHeader";
import SmartSuggestions from "@/components/SmartSuggestions";
import EmptyListSuggestions from "@/components/EmptyListSuggestions";
import UnavailableItem from "@/components/UnavailableItem";
import { dealForItem } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";
import { uiEnter, uiSection } from "@/lib/minimalUi";

// הפריטים עצמם: לפי מחלקות או ברצף אחד, הצעות חכמות, מוצרים שאזלו,
// והמסך הריק עם ההצעות כשהכל כבר נקנה.
export default function ListItemsSection({
  listId, items, pendingItems, unavailableItems, groupedCategories, groupByCategory,
  showSuggestions, simple, favorites, chainDeals, removingIds, viewerName,
  onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onSetReminder,
  onUnavailable, onToggleFavorite, onChangePhoto, onUpdateDetails, onSuggestPhoto,
  onReportPrice, onPhotoFound, onRestore, onAddProduct,
}) {
  const t = useT();

  const renderRow = (item, index) => (
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
  );

  return (
    <>
      {pendingItems.length > 0 && (
        <>
          <div key={groupByCategory ? "grouped" : "ungrouped"} className="pt-1">
            {groupByCategory ? (
              groupedCategories.map(([cat, catItems]) => (
                <section key={cat} className="pb-1.5">
                  <CategoryHeader category={cat} count={catItems.length} />
                  {catItems.map((item, itemIndex) => renderRow(item, itemIndex))}
                </section>
              ))
            ) : (
              pendingItems.map((item, index) => renderRow(item, index))
            )}
          </div>

          {showSuggestions && !simple && (
            <SmartSuggestions listId={listId} currentItems={items} onAddProduct={onAddProduct} delay={0.1} />
          )}
        </>
      )}

      {unavailableItems.length > 0 && (
        <section className={`${uiSection} pt-4`}>
          <h2 className="mb-1 text-[15px] font-semibold text-ui-ink">{t("list.unavailable")}</h2>
          {unavailableItems.map(item => <UnavailableItem key={item.id} item={item} onRestore={onRestore} />)}
        </section>
      )}

      {pendingItems.length === 0 && unavailableItems.length === 0 && (
        <div className={uiEnter}>
          <EmptyListSuggestions onAddProduct={onAddProduct} />
          <div className="border-b border-ui-line-soft py-4 text-center">
            <b className="block text-[15px] font-semibold text-ui-ink">{t("list.empty")}</b>
          </div>
        </div>
      )}
    </>
  );
}