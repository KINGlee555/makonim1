import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import ProductPhoto from "@/components/ProductPhoto";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Plus, ShoppingBasket, MapPin, Tag, Loader2, CheckCircle, Sparkles, Star, Scale } from "lucide-react";
import VoiceSearchButton from "./VoiceSearchButton";
import { useT } from "@/lib/i18n";
import { essentialProductNames } from "@/lib/essentialProducts";
import { loadAllProducts } from "@/lib/loadAllProducts";
import { searchCatalog, normalizeProductText } from "@/lib/productSearch";
import { browseRemoteCategory, searchRemoteCatalog } from "@/lib/remoteProductCatalog";
import { searchStoredCatalog } from "@/lib/catalogProducts";
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
  const allResults = useMemo(() => {
    if (normalizeProductText(deferredQuery)) {
      return searchCatalog(searchableProducts, deferredQuery, "all", filterMode === "price").filter(usableProduct);
    }
    if (selectedCategory === "חטיפים ומתוקים") {
      return remoteCategoryProducts.filter(usableProduct);
    }
    if (selectedCategory !== "all") {
      return searchableProducts.filter(product => product.category === selectedCategory && usableProduct(product));
    }
    return [];
  }, [searchableProducts, remoteCategoryProducts, deferredQuery, selectedCategory, filterMode]);
  const results = useMemo(() => normalizeProductText(deferredQuery) ? allResults : allResults.slice(0, visibleLimit), [allResults, deferredQuery, visibleLimit]);
  // בחיפוש התוצאות מתחלקות לפי מחלקות — בסדר שבו עוברים עליהן בסופר
  const departmentGroups = useMemo(
    () => (normalizeProductText(deferredQuery) ? groupByCategoryOrder(results, aisleOrder) : []),
    [results, deferredQuery, aisleOrder]
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
    if (!term && selectedCategory === "all") { setStoredProducts([]); return; }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      // מאות הראשונה כבר נשלפת מהקטלוג השמור, וכל אות נוספת מצמצמת את ההצעות
      searchStoredCatalog({ query: deferredQuery, category: term ? "" : selectedCategory, limit: 150 })
        .then(products => { if (!cancelled) setStoredProducts(products); })
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
    if (!val) { setQuery(""); setRemoteProducts([]); setRemoteCategoryProducts([]); setStoredProducts([]); setAddedIds(new Set()); setLocationError(""); setSelectedCategory("all"); setVisibleLimit(48); setChainFilter("all"); }
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
        <div className="relative h-36 bg-white p-2 flex items-center justify-center">
          <ProductPhoto name={product.name} brand={product.brand} category={product.category} imageUrl={product.image_url} className="h-full w-full rounded-2xl" />
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
      <DialogContent className="w-[calc(100%-1rem)] max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl !flex animate-scale-in">
        <DialogHeader className="px-5 pt-5 pb-3 flex-row items-center space-y-0">
          <DialogTitle className="text-xl font-bold">{t("search.title")}</DialogTitle>
        </DialogHeader>

        <div className="px-5 space-y-3">
          <div className="flex gap-2">
            <Input placeholder={t("search.placeholder")} value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-2xl text-base border-2 border-primary/20 focus-visible:border-primary" autoFocus />
            <button type="button" onClick={() => setByWeight(v => !v)} aria-pressed={byWeight} title={t("search.byWeight")}
              className={`flex h-12 flex-shrink-0 items-center gap-1.5 rounded-2xl border-2 px-3 text-sm font-semibold transition-all active:scale-95 ${byWeight ? "border-primary bg-primary text-primary-foreground" : "border-primary/20 bg-background text-primary"}`}>
              <Scale className="h-4 w-4" />
              {t("search.weightShort")}
            </button>
            <VoiceSearchButton onResult={handleVoiceResult} />
          </div>
          {byWeight && <p className="text-xs font-semibold text-primary">{t("search.weightHint")}</p>}

          {/* כל המחלקות גלויות על המסך — בלי גלילה לצדדים */}
          <div className="flex flex-wrap gap-1.5">
            {categoryPills.map((cat) => (
              <button
                key={cat.id}
                aria-pressed={selectedCategory === cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Filter mode toggle */}
          <div className="flex gap-2 bg-muted rounded-2xl p-1">
            <button onClick={() => handleFilterChange("price")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${filterMode === "price" ? "bg-card text-primary shadow-sm font-bold" : "text-muted-foreground"}`}>
              <Tag className="w-4 h-4" />{t("search.byPrice")}
            </button>
            <button onClick={() => handleFilterChange("location")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${filterMode === "location" ? "bg-card text-primary shadow-sm font-bold" : "text-muted-foreground"}`}>
              {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {t("search.byLocation")}
              {userLocation && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
            </button>
          </div>

          {filterMode === "location" && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[["all", t("search.allChains")], ["openNow", t("search.openNow")], ["shabbat", t("search.shabbatOpen")]].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={chainFilter === id} onClick={() => setChainFilter(id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
                    chainFilter === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                  {label}
                </button>
              ))}
              {storesForFilter.length === 0 && <span className="text-xs text-destructive">{t("search.noOpenChains")}</span>}
            </div>
          )}

          {locationError && <p className="text-sm text-destructive text-center">{locationError}</p>}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 mt-3 min-h-0">
          {/* Loading skeleton grid */}
          {(loadingProducts || categoryLoading) && !query && (
            <div className="grid grid-cols-2 gap-3">
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
              <div className="grid grid-cols-2 gap-3">
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
              <div className="grid grid-cols-2 gap-3">
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
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    {categoryProducts.map((product, idx) => renderProductCard(product, idx))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* תוצאות מהקטלוג */}
          {!normalizeProductText(deferredQuery) && catalogResults.length > 0 && (
            <section className={staples.length > 0 ? "mt-5" : ""}>
              {staples.length > 0 && (
                <p className="mb-3 px-1 text-sm font-bold text-muted-foreground">{t("search.moreProducts")}</p>
              )}
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                {catalogResults.map((product, idx) => renderProductCard(product, idx))}
              </div>
            </section>
          )}

          {!query && allResults.length > results.length && (
            <button onClick={() => setVisibleLimit(limit => limit + 48)} className="mt-4 w-full rounded-2xl bg-secondary py-3 font-semibold text-secondary-foreground">
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