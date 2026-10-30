import { useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Scale, SlidersHorizontal, Tag, Loader2, X } from "lucide-react";
import VoiceSearchButton from "@/components/VoiceSearchButton";
import { useLanguage } from "@/lib/i18n";

// שם הכפתור בשפת הממשק
const LABELS = {
  he: { filters: "סינון", close: "סגור" },
  en: { filters: "Filters", close: "Close" },
  ru: { filters: "Фильтры", close: "Закрыть" },
};

// פס החיפוש: שורת חיפוש קצרה ושורת מחלקות — התוצאות מקבלות כמעט את כל המסך.
// הסינון המפורט (מחיר/מיקום, סדר תוצאות, רשתות) נפתח בלחיצה מעל התוצאות,
// כדי שלא ייגזל מהן מקום קבוע.
export default function SearchFilterBar({
  t,
  query, onQuery, byWeight, onToggleWeight, onVoiceResult,
  completions, onPickCompletion,
  categoryPills, selectedCategory, onCategory,
  filterMode, onFilterMode, locationLoading, userLocation, locationError,
  sortMode, onSortMode, chainFilter, onChainFilter, openChainsCount,
}) {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();
  const labels = LABELS[lang] || LABELS.he;
  const detailed = filterMode === "location" || sortMode !== "match";

  return (
    <div className="relative shrink-0 border-b-2 border-border/60 bg-card">
      <div className="px-3 pb-1 pe-12 pt-1.5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <Input
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            className="h-9 rounded-xl border-2 border-primary/20 text-base focus-visible:border-primary"
            autoFocus
          />
          <button type="button" onClick={onToggleWeight} aria-pressed={byWeight} title={t("search.byWeight")}
            className={`flex h-9 flex-shrink-0 items-center gap-1 rounded-xl border-2 px-2.5 text-[13px] font-semibold transition-all active:scale-95 ${byWeight ? "border-primary bg-primary text-primary-foreground" : "border-primary/20 bg-background text-primary"}`}>
            <Scale className="h-4 w-4" />
            {t("search.weightShort")}
          </button>
          <span className="flex h-9 flex-none items-center [&>button]:h-9 [&>button]:min-h-0">
            <VoiceSearchButton onResult={onVoiceResult} />
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => setOpen(value => !value)}
            aria-expanded={open}
            className={`relative flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-0.5 text-[13px] font-bold transition-all active:scale-95 ${
              open || detailed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {labels.filters}
            {detailed && !open && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </button>
          {categoryPills.map((cat) => (
            <button
              key={cat.id}
              aria-pressed={selectedCategory === cat.id}
              onClick={() => onCategory(cat.id)}
              className={`flex-shrink-0 rounded-full px-3 py-0.5 text-[13px] font-bold transition-all active:scale-95 ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 max-h-[46dvh] space-y-3 overflow-y-auto border-b-2 border-border bg-card p-4 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-foreground">{labels.filters}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label={labels.close}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {completions.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <span className="flex-shrink-0 text-xs font-bold text-muted-foreground">{t("search.similar")}</span>
              {completions.map((name) => (
                <button key={name} type="button" onClick={() => onPickCompletion(name)}
                  className="flex-shrink-0 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
                  {name}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 rounded-2xl bg-muted p-1">
            <button onClick={() => onFilterMode("price")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition-all ${filterMode === "price" ? "bg-card font-bold text-primary shadow-sm" : "text-muted-foreground"}`}>
              <Tag className="h-4 w-4" />{t("search.byPrice")}
            </button>
            <button onClick={() => onFilterMode("location")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition-all ${filterMode === "location" ? "bg-card font-bold text-primary shadow-sm" : "text-muted-foreground"}`}>
              {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {t("search.byLocation")}
              {userLocation && <span className="inline-block h-2 w-2 rounded-full bg-primary" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide" role="group" aria-label={t("search.sortLabel")}>
            <span className="flex-shrink-0 text-xs font-bold text-muted-foreground">{t("search.sortLabel")}:</span>
            {[["match", t("search.sortMatch")], ["price", t("search.sortPrice")], ["closest", t("search.sortClosest")]].map(([id, label]) => (
              <button key={id} type="button" aria-pressed={sortMode === id} onClick={() => onSortMode(id)}
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-all active:scale-95 ${
                  sortMode === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {filterMode === "location" && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[["all", t("search.allChains")], ["openNow", t("search.openNow")], ["shabbat", t("search.shabbatOpen")]].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={chainFilter === id} onClick={() => onChainFilter(id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
                    chainFilter === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                  {label}
                </button>
              ))}
              {openChainsCount === 0 && <span className="text-xs text-destructive">{t("search.noOpenChains")}</span>}
            </div>
          )}

          {byWeight && <p className="text-xs font-semibold text-primary">{t("search.weightHint")}</p>}
          {locationError && <p className="text-center text-sm text-destructive">{locationError}</p>}
        </div>
      )}
    </div>
  );
}