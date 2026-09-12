import { Plus, Star, X } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useT } from "@/lib/i18n";

export default function FavoritesSection({ favorites, onAdd, onRemove }) {
  const t = useT();
  if (favorites.length === 0) return null;

  return (
    <section className="mb-5 rounded-2xl border border-primary/10 bg-card p-3 shadow-sm animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Star className="h-5 w-5 fill-primary text-primary" />{t("favorites.title")}
        </h2>
        <span className="text-xs font-medium text-muted-foreground">{t("favorites.family")}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {favorites.map((favorite) => (
          <article key={favorite.id} className="relative w-36 flex-shrink-0 overflow-hidden rounded-xl bg-secondary/60">
            <button onClick={() => onRemove(favorite)} aria-label={`${t("favorites.remove")}: ${favorite.name}`} className="absolute end-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-card/95 text-muted-foreground shadow-sm">
              <X className="h-3.5 w-3.5" />
            </button>
            <ProductPhoto name={favorite.name} category={favorite.category} imageUrl={favorite.image_url} className="h-20 w-full" />
            <div className="p-2">
              <p className="truncate text-sm font-bold text-foreground">{favorite.name}</p>
              <button onClick={() => onAdd(favorite)} aria-label={`${t("favorites.add")}: ${favorite.name}`} className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" />{t("favorites.add")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}