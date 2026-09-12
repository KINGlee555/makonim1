import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getProductEmoji } from "@/lib/productEmoji";
import { getProductImageUrl } from "@/lib/productImages";
import { SUPERMARKETS } from "@/lib/supermarkets";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ShoppingBasket, MapPin, Tag, Loader2, CheckCircle, Sparkles } from "lucide-react";
import VoiceSearchButton from "./VoiceSearchButton";
import { useT } from "@/lib/i18n";
import { essentialProductNames } from "@/lib/essentialProducts";

// Israeli supermarket-style categories
const CATEGORIES = [
  { id: "all", label: "הכל" },
  { id: "פירות וירקות", label: "פירות וירקות" },
  { id: "מוצרי חלב", label: "חלבי" },
  { id: "בשר ודגים", label: "בשרי" },
  { id: "לחם ומאפים", label: "לחם" },
  { id: "שימורים", label: "יבשים" },
  { id: "תבלינים", label: "תבלינים" },
  { id: "חטיפים ומתוקים", label: "חטיפים" },
  { id: "משקאות", label: "משקאות" },
  { id: "קפואים", label: "קפואים" },
  { id: "ניקיון", label: "ניקיון" },
  { id: "היגיינה", label: "היגיינה" },
];

function getSimulatedStores(productName, userLocation) {
  const seed = productName.charCodeAt(0) + productName.charCodeAt(productName.length - 1);
  return SUPERMARKETS.map((s, i) => {
    const dist = ((seed + i * 37) % 30 + 2) / 10;
    return { ...s, distance: dist.toFixed(1), price: null };
  }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 3);
}

export default function ProductSearchDialog({ open, onOpenChange, onAddProduct }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState("price");
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingProducts(true);
    (async () => {
      try {
        const products = await base44.entities.Product.list("-name", 500);
        if (!cancelled) setAllProducts(products);
      } catch { if (!cancelled) setAllProducts([]); }
      finally { if (!cancelled) setLoadingProducts(false); }
    })();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, allProducts]);

  const handleVoiceResult = (text) => { setQuery(text); handleSearch(text); };

  const handleSearch = (value) => {
    const q = value !== undefined ? value : query;
    if (!q.trim()) { setResults([]); return; }
    const ql = q.trim().toLowerCase();
    let res = allProducts.filter(p => {
      const matches = p.name.toLowerCase().includes(ql) || p.category.toLowerCase().includes(ql) || (p.brand || "").toLowerCase().includes(ql);
      const catMatch = selectedCategory === "all" || p.category === selectedCategory;
      return matches && catMatch;
    }).slice(0, 20);
    if (filterMode === "price") res = [...res].sort((a, b) => a.price - b.price);
    setResults(res);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    // Re-filter results if there's a query
    if (query.trim()) {
      const ql = query.trim().toLowerCase();
      let res = allProducts.filter(p => {
        const matches = p.name.toLowerCase().includes(ql) || p.category.toLowerCase().includes(ql) || (p.brand || "").toLowerCase().includes(ql);
        const catMatch = cat === "all" || p.category === cat;
        return matches && catMatch;
      }).slice(0, 20);
      if (filterMode === "price") res = [...res].sort((a, b) => a.price - b.price);
      setResults(res);
    }
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

  const handleFilterChange = (mode) => {
    if (mode === "location" && !userLocation) { requestLocation(); } else { setFilterMode(mode); }
    if (results.length > 0) { let res = [...results]; if (mode === "price") res.sort((a, b) => a.price - b.price); setResults(res); }
  };

  const handleAdd = (product) => { onAddProduct(product); setAddedIds(prev => new Set([...prev, product.name])); };

  const handleClose = (val) => {
    onOpenChange(val);
    if (!val) { setQuery(""); setResults([]); setAddedIds(new Set()); setLocationError(""); setSelectedCategory("all"); }
  };

  const renderProductImage = (product) => {
    const emoji = getProductEmoji(product.name, product.category);
    const imgUrl = product.image_url || getProductImageUrl(product.name, product.category);
    if (imgUrl) {
      return (
        <img src={imgUrl} alt={product.name} className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-size:22px">${emoji}</span>`; }} />
      );
    }
    return <span className="text-2xl">{emoji}</span>;
  };

  // Filter suggestions by category
  const filteredSuggestions = selectedCategory === "all"
    ? suggestions
    : suggestions.filter(p => p.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl !flex">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-xl font-bold text-start">{t("search.title")}</DialogTitle>
        </DialogHeader>

        <div className="px-5 space-y-3">
          <div className="flex gap-2">
            <Input placeholder={t("search.placeholder")} value={query}
              onChange={(e) => { setQuery(e.target.value); handleSearch(e.target.value); }}
              className="h-12 rounded-2xl text-base border-2 border-primary/20 focus-visible:border-primary" autoFocus />
            <VoiceSearchButton onResult={handleVoiceResult} />
            <Button onClick={() => handleSearch()} className="h-12 w-12 rounded-2xl flex-shrink-0 bg-primary hover:bg-primary/90">
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Category filter — horizontal scrollable */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 bg-muted rounded-2xl p-1">
            <button onClick={() => handleFilterChange("price")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${filterMode === "price" ? "bg-white text-primary shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}>
              <Tag className="w-4 h-4" />{t("search.byPrice")}
            </button>
            <button onClick={() => handleFilterChange("location")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${filterMode === "location" ? "bg-white text-primary shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}>
              {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {t("search.byLocation")}
              {userLocation && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
            </button>
          </div>

          {locationError && <p className="text-sm text-destructive text-center">{locationError}</p>}

          {filterMode === "location" && userLocation && (
            <div className="flex items-center gap-2 bg-primary/10 rounded-2xl px-4 py-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{t("search.showingNearby")}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 mt-3 space-y-2 min-h-0">
          {loadingProducts && !query && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-muted-foreground text-base">{t("search.loadingProducts")}</p>
            </div>
          )}

          {!loadingProducts && results.length === 0 && !query && (
            filteredSuggestions.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">{t("search.suggestions")}</p>
                </div>
                <div className="space-y-2">
                  {filteredSuggestions.map((product, idx) => {
                    const isAdded = addedIds.has(product.name);
                    return (
                      <div key={idx} onClick={() => !isAdded && handleAdd(product)}
                        className={`rounded-2xl border transition-all flex items-center gap-3 p-3 cursor-pointer active:scale-[0.98] ${isAdded ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}>
                        <div className="w-[52px] h-[52px] rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {renderProductImage(product)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-foreground line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
                            <span className="text-sm font-bold text-primary">₪{product.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isAdded ? "bg-primary text-primary-foreground" : "border-2 border-primary/30 text-primary"}`}>
                          {isAdded ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingBasket className="w-14 h-14 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-base">{t("search.searchPrompt")}</p>
              </div>
            )
          )}

          {results.length === 0 && query && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-base">{t("search.noResults")}</p>
            </div>
          )}

          {results.map((product, idx) => {
            const isAdded = addedIds.has(product.name);
            const nearbyStores = filterMode === "location" && userLocation ? getSimulatedStores(product.name, userLocation) : null;
            return (
              <div key={idx} className={`rounded-2xl border transition-all overflow-hidden ${isAdded ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                <div onClick={() => !isAdded && handleAdd(product)}
                  className="flex items-center gap-3 p-3 cursor-pointer active:scale-[0.98] hover:bg-accent/5">
                  <div className="w-[52px] h-[52px] rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {renderProductImage(product)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground line-clamp-1">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
                      <span className="text-sm font-bold text-primary">₪{product.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{product.category}</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isAdded ? "bg-primary text-primary-foreground" : "border-2 border-primary/30 text-primary"}`}>
                    {isAdded ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </div>
                {nearbyStores && (
                  <div className="px-3 pb-3 flex gap-2 overflow-x-auto">
                    {nearbyStores.map((store) => (
                      <div key={store.chain} className="flex-shrink-0 bg-primary/8 border border-primary/20 rounded-xl px-3 py-1.5 text-xs">
                        <span className="font-semibold text-primary">{store.name}</span>
                        <span className="text-muted-foreground mr-1">· {store.distance} {t("search.km")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}