import ListItemRow from "@/components/minimal/ListItemRow";
import AreaDeals from "@/components/deals/AreaDeals";
import UnavailableItem from "@/components/UnavailableItem";
import SectionRunner from "@/components/poster/SectionRunner";
import { posterPhoto } from "@/lib/categoryPoster";
import { dealForItem } from "@/lib/chainDeals";
import { useT } from "@/lib/i18n";

// מקטע מחלקה: פס כרזה עם שם המחלקה, תמונת התוצרת שלה, טריז אלכסוני ואריחי המוצרים.
// הפסים מתחלפים צהוב־ורוד, והטריז שלפני כל פס נכנס בהחלקה מהצד שממנו הפס מגיע.
export default function ListItemsSection({
  groupedCategories, pendingItems, unavailableItems, favorites, chainDeals, removingIds, viewerName,
  onToggleBought, onUpdateQuantity, onNavigate, onRemove, onEdit, onSetReminder,
  onUnavailable, onToggleFavorite, onChangePhoto, onUpdateDetails, onSuggestPhoto,
  onReportPrice, onPhotoFound, onRestore, onAddProduct, onOpenSearch, onOpenScanner, onOpenShoppingMode,
  listId, onOpenAllDeals,
}) {
  const t = useT();

  return (
    <>
      {groupedCategories.map(([category, categoryItems], sectionIndex) => {
        const pink = sectionIndex % 2 === 1;

        return (
          <section key={category} className="pst-sec">
            {sectionIndex > 0 && (
              <div className={`pst-wedge pst-wedge-up ${pink ? "" : "pst-wedge-b"}`} />
            )}

            <h2 className={`pst-sh ${pink ? "pst-sh-b" : "pst-sh-a"}`}>
              <span className="pst-sh-in">
                <SectionRunner tone={pink ? "yellow" : "ink"} />
                <span className="min-w-0 truncate">{category}</span>
                <span className="pst-n">{categoryItems.length}</span>
              </span>
            </h2>

            <div className="pst-sech">
              <img src={posterPhoto(category)} alt="" />
            </div>

            {sectionIndex === 0 && groupedCategories.length > 1 && (
              <div className="pst-wedge" />
            )}

            <div className="pst-grid">
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
        );
      })}

      {unavailableItems.length > 0 && (
        <section className="pst-sec">
          <h2 className="pst-sh pst-sh-b">
            <span className="pst-sh-in">
              <SectionRunner tone="yellow" />
              <span className="min-w-0 truncate">{t("list.unavailable")}</span>
              <span className="pst-n">{unavailableItems.length}</span>
            </span>
          </h2>
          <div className="pst-panel-slot">
            <div className="pst-panel">
              {unavailableItems.map(item => <UnavailableItem key={item.id} item={item} onRestore={onRestore} />)}
            </div>
          </div>
        </section>
      )}

      {pendingItems.length === 0 && unavailableItems.length === 0 && (
        <section className="pst-sec">
          <div className="pst-panel-slot">
            <div className="pst-panel">
              <p className="pst-nm text-[20px] sm:text-[24px]">{t("list.empty")}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={onOpenSearch} className="pst-btn">{t("quickAdd.search")}</button>
                <button type="button" onClick={onOpenScanner} className="pst-btn">{t("barcode.title")}</button>
                <button type="button" onClick={onOpenShoppingMode} className="pst-btn">{t("shoppingMode.title")}</button>
              </div>
              <AreaDeals listId={listId} items={pendingItems} onAddProduct={onAddProduct} onOpenAllDeals={onOpenAllDeals} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}