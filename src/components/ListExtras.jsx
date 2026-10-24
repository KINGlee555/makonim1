import { useState } from "react";
import { ChevronDown } from "lucide-react";
import FavoritesSection from "./FavoritesSection";
import NearbyDeals from "./NearbyDeals";
import RecurringItems from "./RecurringItems";
import RegisteredUsersCount from "./RegisteredUsersCount";
import { useT } from "@/lib/i18n";
import { uiPill, uiPillRow } from "@/lib/minimalUi";

// Secondary sections folded into one collapsible block so the list itself stays front and center
export default function ListExtras({ list, listId, items, favorites, onAddProduct, onToggleFavorite }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className={`${uiPillRow} w-full text-start`}>
        <span className={uiPill}>{t("favorites.title")}</span>
        <span className={uiPill}>מבצעים קרובים אליך</span>
        <span className={uiPill}>{t("recurring.title")}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ui-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-4">
          <FavoritesSection favorites={favorites} onAdd={onAddProduct} onRemove={onToggleFavorite} />
          <NearbyDeals onAddProduct={onAddProduct} />
          <RecurringItems listId={listId} currentItems={items} onAddProduct={onAddProduct} />
          <RegisteredUsersCount />
        </div>
      )}
    </section>
  );
}