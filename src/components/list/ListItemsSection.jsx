import { Search, ScanLine, ShoppingCart } from "lucide-react";
import ListItemRow from "@/components/minimal/ListItemRow";
import AreaDeals from "@/components/deals/AreaDeals";
import UnavailableItem from "@/components/UnavailableItem";
import SectionRunner from "@/components/poster/SectionRunner";
import { dealForItem } from "@/lib/chainDeals";
import { posterPhoto } from "@/lib/categoryPoster";
import { useT } from "@/lib/i18n";

// מקטע מחלקה בכרזת הסופר: פס צהוב עם שם המחלקה והמספר שלה, תמונת התוצרת מתחתיו,
// ושלושה כרטיסי מוצר בכל שורה במחשב.
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
      {groupedCategories.map(([category, categoryItems]) => (
        <section key={category} className="pw-sec">
          <h2 className="pw-sh">
            <SectionRunner tone="ink" />
            <span className="pw-sh-title">{category}</span>
            <span className="pw-n">{categoryItems.length}</span>
          </h2>

          {posterPhoto(category) && (
            <div className="pw-pic">
              <img src={posterPhoto(category)} alt="" loading="lazy" />
            </div>
          )}

          <div className="pw-grid">
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
        <section className="pw-sec">
          <h2 className="pw-sh">
            <SectionRunner tone="ink" />
            <span className="pw-sh-title">{t("list.unavailable")}</span>
            <span className="pw-n">{unavailableItems.length}</span>
          </h2>
          <div className="pw-panel">
            {unavailableItems.map(item => <UnavailableItem key={item.id} item={item} onRestore={onRestore} />)}
          </div>
        </section>
      )}

      {pendingItems.length === 0 && unavailableItems.length === 0 && (
        <section className="pw-sec">
          <div className="pw-empty">
            <b>{t("list.empty")}</b>
            <span>{t("list.emptyDesc")}</span>
          </div>

          <div className="pw-three">
            <button type="button" onClick={onOpenSearch} className="pw-big pw-big-y">
              <Search strokeWidth={2.4} />{t("quickAdd.search")}
            </button>
            <button type="button" onClick={onOpenScanner} className="pw-big">
              <ScanLine strokeWidth={2.4} />{t("barcode.title")}
            </button>
            <button type="button" onClick={onOpenShoppingMode} className="pw-big pw-big-k">
              <ShoppingCart strokeWidth={2.4} />{t("shoppingMode.title")}
            </button>
          </div>

          <div className="pw-panel">
            <AreaDeals listId={listId} items={pendingItems} onAddProduct={onAddProduct} onOpenAllDeals={onOpenAllDeals} />
          </div>
        </section>
      )}
    </>
  );
}