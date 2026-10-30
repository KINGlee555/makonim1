import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import ProductPhoto from "@/components/ProductPhoto";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ShoppingBasket, MapPin, Loader2, CheckCircle, Sparkles, Star } from "lucide-react";
import SearchFilterBar from "@/components/search/SearchFilterBar";
import { useT } from "@/lib/i18n";
import { essentialProductNames } from "@/lib/essentialProducts";
import { loadAllProducts } from "@/lib/loadAllProducts";
import { searchCatalog, closestCatalog, sortCatalogResults, normalizeProductText } from "@/lib/productSearch";
import { browseRemoteCategory, searchRemoteCatalog } from "@/lib/remoteProductCatalog";
import { searchStoredCatalog, prefetchStoredCatalog } from "@/lib/catalogProducts";
import { staplesForCategory } from "@/lib/categoryStaples";
import { groupByCategoryOrder, loadCategoryOrder } from "@/lib/categoryOrder";
import { isWeightSold } from "@/lib/weightProducts";

// שם קצר לכל מחלקה — הסדר עצמו הוא סדר המחלקות האמיתי במסלול הסופר
const CATEGORY_LABELS = {
  "פירות וירקות": "פירות וירקות",
  "לחם ומאפים": "לחם",
  "מוצרי חלב": "חלבי",
  "בשר ודגים": "בשרי",
  "קפואים": "קפואים",
  "שימורים": "יבשים",
  "תבלינים": "תבלינים",
  "חטיפים ומתוקים": "חטיפים",
  "משקאות": "משקאות",
  "ניקיון": "ניקיון",
  "היגיינה": "היגיינה",
  "חיות מחמד": "חיות מחמד",
};

// מוצר מוצג כשיש לו תמונה אמיתית, מותג, או ברקוד אמיתי מהקטלוג — כך כל המוצרים שנאספו
// מהרשתות מופיעים בחיפוש, עם תמונת המוצר או עם האייקון שלו עד שנמצא הצילום האמיתי
const usableProduct = (product) => Boolean((product.image_verified && product.image_url) || product.brand || product.barcode);

function getSimulatedStores(productName, stores) {
  const seed = productName.charCodeAt(0) + productName.charCodeAt(productName.length - 1);
  return stores.map((s, i) => {
    const dist = ((seed + i * 37) % 30 + 2) / 10;
    return { ...s, distance: dist.toFixed(1), price: null };
  }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 3);
}

export default function ProductSearchDialog({ open, onOpenChange, onAddProduct, favorites = [], onToggleFavorite }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [byWeight, setByWeight] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState("price");
  const [sortMode, setSortMode] = useState("match");
  const [chainFilter, setChainFilter] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [remoteCategoryProducts, setRemoteCategoryProducts] = useState([]);
  const [storedProducts, setStoredProducts] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(48);
  // דף התוצאות הבא מהקטלוג השמור — טעינה מדורגת ומהירה של "טען עוד"
  const [catalogCursor, setCatalogCursor] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const remainingPages = useRef([]);
  const storePage = (items, nextCursor) => {
    if (!items.length) return;
    setStoredProducts(prev => {
      const seen = new Set(prev.map(product => normalizeProductText(product.name)));
      return [...prev, ...items.filter(product => !seen.has(normalizeProductText(product.name)))];
    });
    setCatalogCursor(nextCursor || "");
  };
  // הדף הבא נטען ברקע מיד עם הגעת התוצאות, כדי שהלחיצה על "טען עוד" תרגיש מיידית
  const warmNextPage = (term, category, nextCursor) => {
    const params = { query: term ? deferredQuery : "", category: term ? "" : category, limit: 60, cursor: nextCursor };
    remainingPages.current = [params];
    prefetchStoredCatalog(params);
  };
  const loadMoreResults = () => {
    // קודם כל מציגים מיד את מה שכבר במכשיר, ורק אחר כך מושכים עוד מהשרת
    setVisibleLimit(limit => limit + 48);
    const next = remainingPages.current.shift();
    if (!next?.cursor) return;
    setLoadingMore(true);
    searchStoredCatalog(next)
      .then(page => {
        storePage(page.items, page.nextCursor);
        warmNextPage(Boolean(normalizeProductText(next.query)), next.category, page.nextCursor);
      })
      .finally(() => setLoadingMore(false));
  };
  const deferredQuery = useDeferredValue(query);
  const searchableProducts = useMemo(() => {
    const unique = new Map();
    [...storedProducts, ...remoteProducts, ...remoteCategoryProducts, ...allProducts].forEach(product => {
      const key = normalizeProductText(product.name);
      if (!unique.has(key)) unique.set(key, product);
    });
    return [...unique.values()];
  }, [allProducts, storedProducts, remoteProducts, remoteCategoryProducts]);
  // סדר המחלקות האמיתי במסלול הסופר — הפירות בכניסה, הניקיון בסוף
  const aisleOrder = useMemo(() => loadCategoryOrder(), [open]);
  // לפי אילו רשתות להראות מרחק בכל מוצר: כולן, פתוחות עכשיו, או פתוחות בשבת
  const storesForFilter = useMemo(() => {
    if (chainFilter === "openNow") return SUPERMARKETS.filter(store => storeStatus(new Date(), store.shabbat).open);
    if (chainFilter === "shabbat") return SUPERMARKETS.filter(store => store.shabbat);
    return SUPERMARKETS;
  }, [chainFilter]);
  const categoryPills = useMemo(() => [
    { id: "all", label: "הכל" },
    ...aisleOrder
      .filter(category => CATEGORY_LABELS[category])
      .map(category => ({ id: category, label: CATEGORY_LABELS[category] })),
  ], [aisleOrder]);
  // האם החיפוש המדויק מצא משהו — כדי להסביר כשמוצגות התאמות קרובות בלבד
  const hasExactMatch = useMemo(
    () => !normalizeProductText(deferredQuery) || searchCatalog(searchableProducts, deferredQuery, "all", filterMode === "price", 240).some(usableProduct),
    [searchableProducts, deferredQuery, filterMode]
  );
  const allResults = useMemo(() => {
    if (normalizeProductText(deferredQuery)) {
      const strict = searchCatalog(searchableProducts, deferredQuery, "all", filterMode === "price", 240).filter(usableProduct);
      // תמיד מחזירים תוצאות: כשההתאמה המדויקת דלה, מוסיפים את המוצרים הקרובים ביותר לחיפוש
      if (strict.length >= 8) return strict;
      const known = new Set(strict.map(product => normalizeProductText(product.name)));
      const close = closestCatalog(searchableProducts, deferredQuery, "all")
        .filter(product => usableProduct(product) && !known.has(normalizeProductText(product.name)));
      return [...strict, ...close];
    }
    if (selectedCategory === "חטיפים ומתוקים") {
      return remoteCategoryProducts.filter(usableProduct);
    }
    if (selectedCategory !== "all") {
      return searchableProducts.filter(product => product.category === selectedCategory && usableProduct(product));
    }
    return [];
  }, [searchableProducts, remoteCategoryProducts, deferredQuery, selectedCategory, filterMode]);
  const results = useMemo(() => {
    const base = allResults.slice(0, visibleLimit);
    return sortCatalogResults(base, deferredQuery, sortMode);
  }, [allResults, deferredQuery, visibleLimit, sortMode]);
  // השלמה אוטומטית: שמות מוצרים שמכילים את מה שהוקלד — הקלקה משלימה את החיפוש
  const completions = useMemo(() => {
    const normalizedQuery = normalizeProductText(deferredQuery);
    if (normalizedQuery.length < 2) return [];
    // משלימים לפי סוג המוצר שהוקלד (המילה הראשונה), כדי שגם "פסטה 8 אסם" יקבל הצעות
    const token = normalizedQuery.split(" ")[0] || normalizedQuery;
    const out = [];
    const seen = new Set();
    for (const product of searchableProducts) {
      const name = normalizeProductText(product.name || "");
      if (name === normalizedQuery || !name.includes(token) || !name.includes(normalizedQuery.slice(0, 3))) continue;
      const key = name.slice(0, 28);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(product.name);
      if (out.length >= 5) break;
    }
    return out;
  }, [searchableProducts, deferredQuery]);
  // בחיפוש התוצאות מתחלקות לפי מחלקות — בסדר שבו עוברים עליהן בסופר
  // קיבוץ לפי מחלקות רק בהצגת "התאמה" — כשממיינים לפי מחיר או התאמה קרובה מוצגים ברשימה אחת ממוינת
  const departmentGroups = useMemo(
    () => (normalizeProductText(deferredQuery) && sortMode === "match" ? groupByCategoryOrder(results, aisleOrder) : []),
    [results, deferredQuery, aisleOrder, sortMode]
  );
  // מה שקונים בדרך כלל בישראל במחלקה הזו — מוצג מיד עם בחירת המחלקה, לפני הקטלוג
  const staples = useMemo(
    () => (normalizeProductText(deferredQuery) || selectedCategory === "all" ? [] : staplesForCategory(selectedCategory)),
    [deferredQuery, selectedCategory]
  );
  const stapleKeys = useMemo(() => new Set(staples.map(product => normalizeProductText(product.name))), [staples]);
  const catalogResults = results.filter(product => !stapleKeys.has(normalizeProductText(product.name)));

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingProducts(true);
    (async () => {
      try {
        const products = await loadAllProducts();
        if (!cancelled) setAllProducts(products);
      } catch { if (!cancelled) setAllProducts([]); }
      finally { if (!cancelled) setLoadingProducts(false); }
    })();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    const normalized = normalizeProductText(deferredQuery);
    if (!open || normalized.length < 2) { setRemoteProducts([]); setRemoteLoading(false); return; }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setRemoteLoading(true);
      searchRemoteCatalog(normalized).then(products => {
        if (!cancelled) setRemoteProducts(products);
      }).finally(() => {
        if (!cancelled) setRemoteLoading(false);
      });
    }, 120);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [open, deferredQuery]);

  // קטלוג המוצרים השמור — אלפי מוצרים אמיתיים מכל הרשתות, עם תמונה אמיתית לכל אחד.
  useEffect(() => {
    if (!open) return;
    const term = normalizeProductText(deferredQuery);
    if (!term && selectedCategory === "all") { setStoredProducts([]); setCatalogCursor(""); remainingPages.current = []; return; }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      // הדף הראשון של התוצאות מהקטלוג השמור, והדף הבא נטען ברקע מיד אחריו
      searchStoredCatalog({ query: deferredQuery, category: term ? "" : selectedCategory, limit: 60 })
        .then(page => {
          if (cancelled) return;
          setStoredProducts(page.items);
          setCatalogCursor(page.nextCursor || "");
          remainingPages.current = page.nextCursor
            ? [{ query: deferredQuery, category: term ? "" : selectedCategory, limit: 60, cursor: page.nextCursor }]
            : [];
          if (page.nextCursor) prefetchStoredCatalog(remainingPages.current[0]);
        })
        .catch(() => {});
    }, 150);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [open, deferredQuery, selectedCategory]);

  useEffect(() => {
    if (!open || normalizeProductText(deferredQuery) || selectedCategory !== "חטיפים ומתוקים") {
      setCategoryLoading(false);
      return;
    }
    let cancelled = false;
    setCategoryLoading(true);
    browseRemoteCategory(selectedCategory).then(products => {
      if (!cancelled) setRemoteCategoryProducts(products);
    }).finally(() => {
      if (!cancelled) setCategoryLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, deferredQuery, selectedCategory]);

  useEffect(() => {
    if (!open || loadingProducts || allProducts.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const essentials = essentialProductNames
          .map(name => allProducts.find(p => p.name === name))
          .filter(Boolean);
        const history = await base44.entities.PurchaseHistory.list("-created_date", 100);
        if (cancelled) return;
        const freq = {};
        history.forEach(h => { freq[h.item_name] = (freq[h.item_name] || 0) + 1; });
        const historyItems = Object.entries(freq).sort((a, b) => b[1] - a[1])
          .map(([name]) => allProducts.find(p => p.name === name))
          .filter(Boolean)
          .filter(p => !essentials.some(e => e.name === p.name));
        const merged = [...essentials, ...historyItems].slice(0, 8);
        if (!cancelled) setSuggestions(merged);
      } catch {
        const essentials = essentialProductNames
          .map(name => allProducts.find(p => p.name === name))
          .filter(Boolean).slice(0, 8);
        if (!cancelled) setSuggestions(essentials);
      }
    })();
    return () => { cancelled = true; };
  }, [open, allProducts, loadingProducts]);

  const handleVoiceResult = (text) => setQuery(text);
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setVisibleLimit(48);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationError(t("search.locationUnsupported")); return; }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationLoading(false); setFilterMode("location"); },
      () => { setLocationError(t("search.locationError")); setLocationLoading(false); }
    );
  };

  // מעבר מיידי למצב מיקום — הבקשה להרשאה יוצאת במקביל, והסינון לפי רשתות גלוי מיד
  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    if (mode === "location" && !userLocation) requestLocation();
  };

  // לפי משקל: מוצר שנשקל נכנס בקילו, ולחיצה על "משקל" מסמנת כל מוצר ככזה
  const handleAdd = (product) => {
    onAddProduct(byWeight || isWeightSold(product) ? { ...product, weighted: true } : product);
    setAddedIds(prev => new Set([...prev, product.name]));
  };

  const handleClose = (val) => {
    onOpenChange(val);
    if (!val) { setQuery(""); setRemoteProducts([]); setRemoteCategoryProducts([]); setStoredProducts([]); setCatalogCursor(""); remainingPages.current = []; setAddedIds(new Set()); setLocationError(""); setSelectedCategory("all"); setVisibleLimit(48); setChainFilter("all"); setSortMode("match"); }
  };

  const filteredSuggestions = selectedCategory === "all"
    ? suggestions
    : suggestions.filter(p => p.category === selectedCategory);

  const renderProductCard = (product, idx) => {
    const isAdded = addedIds.has(product.name);
    const isFavorite = favorites.some(favorite => favorite.name === product.name);
    const nearbyStores = filterMode === "location" && userLocation ? getSimulatedStores(product.name, storesForFilter) : null;
    const nearest = nearbyStores?.[0];
    return (
      <div key={product.name + idx} onClick={() => !isAdded && handleAdd(product)}
        className={`flex flex-col rounded-3xl border-2 bg-card overflow-hidden cursor-pointer transition-all active:scale-95 animate-slide-up ${
          isAdded ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 shadow-sm hover:border-primary/40 hover:shadow-md"
        }`}
        style={{ animationDelay: `${(idx % 6) * 0.05}s`, animationFillMode: "both" }}>
        <div className="relative h-28 bg-white p-2 flex items-center justify-center">
          <ProductPhoto name={product.name} brand={product.brand} category={product.category} imageUrl={product.image_url} className="h-full w-full rounded-2xl" lookup={false} />
          <button onClick={(event) => { event.stopPropagation(); onToggleFavorite(product); }} aria-label={`${isFavorite ? t("favorites.remove") : t("favorites.save")}: ${product.name}`} className="absolute start-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-primary shadow-sm">
            <Star className={`h-5 w-5 ${isFavorite ? "fill-primary" : ""}`} />
          </button>
          {nearest && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium text-pst-ink shadow-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {nearest.distance} {t("search.km")}
            </div>
          )}
          <div className={`absolute bottom-2 right-2 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all active:scale-90 ${
            isAdded ? "bg-pst-ink text-white" : "bg-white text-pst-ink"
          }`}>
            {isAdded ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-2.5 py-3 text-center">
          <p className="w-full text-sm font-bold leading-tight text-foreground line-clamp-2">{product.name}</p>
          {product.brand && <span className="w-full truncate text-xs text-muted-foreground">{product.brand}</span>}
          <span className="mt-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">
            {product.price > 0 ? `₪${product.price.toFixed(2)}` : "מחיר לא זמין"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="pst-search-dialog w-full max-w-md sm:max-w-2xl flex flex-col p-0 overflow-hidden !flex animate-scale-in">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("search.title")}</DialogTitle>
        </DialogHeader>
        <SearchFilterBar
          t={t}
          query={query}
          onQuery={(value) => { setQuery(value); setVisibleLimit(48); }}
          byWeight={byWeight}
          onToggleWeight={() => setByWeight(value => !value)}
          onVoiceResult={handleVoiceResult}
          completions={completions}
          onPickCompletion={setQuery}
          categoryPills={categoryPills}
          selectedCategory={selectedCategory}
          onCategory={handleCategoryChange}
          filterMode={filterMode}
          onFilterMode={handleFilterChange}
          locationLoading={locationLoading}
          userLocation={userLocation}
          locationError={locationError}
          sortMode={sortMode}
          onSortMode={setSortMode}
          chainFilter={chainFilter}
          onChainFilter={setChainFilter}
          openChainsCount={storesForFilter.length}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
          {query && results.length > 0 && !hasExactMatch && (
            <p className="mb-2 rounded-xl bg-muted px-3 py-2 text-xs font-bold text-muted-foreground">{t("search.closestHint")}</p>
          )}
          {/* Loading skeleton grid */}
          {(loadingProducts || categoryLoading) && !query && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                  <div className="h-32 bg-muted shimmer" />
                  <div className="p-2.5">
                    <div className="h-3 rounded bg-muted shimmer mb-1.5" />
                    <div className="h-3 w-12 rounded bg-muted shimmer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions grid */}
          {!loadingProducts && !categoryLoading && results.length === 0 && !query && selectedCategory === "all" && filteredSuggestions.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">{t("search.suggestions")}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredSuggestions.map((product, idx) => renderProductCard(product, idx))}
              </div>
            </div>
          )}

          {/* מה שקונים בדרך כלל במחלקה הזו */}
          {!query && staples.length > 0 && (
            <section className="animate-fade-in">
              <div className="mb-3 flex items-center gap-2 px-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">{t("search.staples")}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {staples.map((product, idx) => renderProductCard(product, idx))}
              </div>
            </section>
          )}

          {/* חיפוש — מחולק לפי סדר המחלקות האמיתי במסלול הסופר */}
          {departmentGroups.length > 0 && (
            <div className="space-y-5">
              {departmentGroups.map(({ category, items: categoryProducts }) => (
                <section key={category}>
                  <p className="mb-3 px-1 text-sm font-bold text-muted-foreground">{category}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                    {categoryProducts.map((product, idx) => renderProductCard(product, idx))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* מיון לפי מחיר או התאמה קרובה — רשימה אחת ממוינת, בלי קיבוץ מחלקות */}
          {normalizeProductText(deferredQuery) && sortMode !== "match" && results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
              {results.map((product, idx) => renderProductCard(product, idx))}
            </div>
          )}

          {/* תוצאות מהקטלוג */}
          {!normalizeProductText(deferredQuery) && catalogResults.length > 0 && (
            <section className={staples.length > 0 ? "mt-5" : ""}>
              {staples.length > 0 && (
                <p className="mb-3 px-1 text-sm font-bold text-muted-foreground">{t("search.moreProducts")}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                {catalogResults.map((product, idx) => renderProductCard(product, idx))}
              </div>
            </section>
          )}

          {(allResults.length > results.length || catalogCursor) && (
            <button onClick={loadMoreResults} disabled={loadingMore} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 font-semibold text-secondary-foreground disabled:opacity-70">
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("search.loadMore")}
            </button>
          )}

          {remoteLoading && query && results.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground" role="status">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {/* No results */}
          {results.length === 0 && query && !loadingProducts && !remoteLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBasket className="w-14 h-14 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-base">{t("search.noResults")}</p>
            </div>
          )}

          {/* Empty state */}
          {!loadingProducts && !categoryLoading && results.length === 0 && !query && staples.length === 0 && filteredSuggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBasket className="w-14 h-14 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-base">{t("search.searchPrompt")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}