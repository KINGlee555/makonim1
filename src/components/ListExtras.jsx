import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import ConnectedUsers from "./ConnectedUsers";
import FavoritesSection from "./FavoritesSection";
import NearbyDeals from "./NearbyDeals";
import RecurringItems from "./RecurringItems";
import RegisteredUsersCount from "./RegisteredUsersCount";

// Secondary sections folded into one collapsible block so the list itself stays front and center
export default function ListExtras({ list, listId, items, favorites, onAddProduct, onToggleFavorite }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-4">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="flex w-full items-center justify-between rounded-3xl border-[3px] border-market-yellow bg-market-surface px-5 py-3.5 text-start shadow-[0_5px_0_hsl(var(--market-yellow))]">
        <span className="flex items-center gap-2 text-[19px] font-black text-market-ink">
          <Sparkles className="h-5 w-5 text-market-pink" />
          מועדפים, מבצעים ומשתמשים
        </span>
        <ChevronDown className={`h-5 w-5 text-market-ink transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 animate-fade-in">
          <ConnectedUsers list={list} />
          <FavoritesSection favorites={favorites} onAdd={onAddProduct} onRemove={onToggleFavorite} />
          <NearbyDeals onAddProduct={onAddProduct} />
          <RecurringItems listId={listId} currentItems={items} onAddProduct={onAddProduct} />
          <RegisteredUsersCount />
        </div>
      )}
    </section>
  );
}