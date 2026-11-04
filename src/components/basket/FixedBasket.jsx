import { Plus, X, ShoppingBasket } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import SectionRunner from "@/components/poster/SectionRunner";
import { useT } from "@/lib/i18n";
import "@/styles/fixed-basket.css";

// הסל הקבוע: המוצרים שתמיד קונים, שמורים ברשימה, ובלחיצה אחת כולם נכנסים לרשימת הקניות
export default function FixedBasket({ favorites, onAdd, onAddAll, onRemove }) {
  const t = useT();
  if (favorites.length === 0) return null;

  return (
    <section className="pw-sec fb-sec">
      <h2 className="pw-sh">
        <SectionRunner tone="ink" />
        <span className="pw-sh-title">{t("basket.fixed")}</span>
        <span className="pw-n">{favorites.length}</span>
      </h2>
      <div className="pw-panel fb-panel">
        <button type="button" onClick={onAddAll} className="fb-all">
          <ShoppingBasket aria-hidden="true" className="h-5 w-5" />
          <span>{t("basket.addAll")}</span>
        </button>
        <ul className="fb-list">
          {favorites.map((favorite) => (
            <li key={favorite.id} className="fb-row">
              <ProductPhoto
                name={favorite.name}
                brand={favorite.brand}
                category={favorite.category}
                imageUrl={favorite.image_url}
                className="fb-photo"
              />
              <span className="fb-name">{favorite.name}</span>
              {favorite.price > 0 && <span className="fb-price">₪{favorite.price.toFixed(2)}</span>}
              <button type="button" onClick={() => onRemove(favorite)} aria-label={`${t("basket.remove")}: ${favorite.name}`} className="fb-x">
                <X aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onAdd(favorite)} aria-label={`${t("basket.addOne")}: ${favorite.name}`} className="fb-add">
                <Plus aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}