import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getProductEmoji } from "@/lib/productEmoji";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ShoppingBasket, MapPin, Tag, Loader2, CheckCircle, Sparkles } from "lucide-react";
import VoiceSearchButton from "./VoiceSearchButton";

const SUPERMARKETS = [
  { name: "שופרסל", chain: "shufersal" },
  { name: "רמי לוי", chain: "rami_levy" },
  { name: "מגא בול", chain: "mega" },
  { name: "יוחננוף", chain: "yochananof" },
  { name: "ויקטורי", chain: "victory" },
  { name: "קשת טעמים", chain: "keshet" },
  { name: "חצי חינם", chain: "hatzi_hinam" },
];

function getSimulatedStores(productName, userLocation) {
  const seed = productName.charCodeAt(0) + productName.charCodeAt(productName.length - 1);
  return SUPERMARKETS.map((s, i) => {
    const dist = ((seed + i * 37) % 30 + 2) / 10;
    const priceMod = 1 + ((seed + i * 13) % 20 - 10) / 100;
    return { ...s, distance: dist.toFixed(1), price: null, priceMod };
  }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 3);
}

export default function ProductSearchDialog({ open, onOpenChange, onAddProduct }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState("price"); // "price" | "location"
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load products from database
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingProducts(true);
    (async () => {
      try {
        const products = await base44.entities.Product.list("-name", 500);
        if (!cancelled) setAllProducts(products);
      } catch {
        if (!cancelled) setAllProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Load smart suggestions from purchase history when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingSuggestions(true);
    (async () => {
      try {
        const history = await base44.entities.PurchaseHistory.list("-created_date", 100);
        if (cancelled) return;
        // Count frequency of each product name
        const freq = {};
        history.forEach(h => {
          const name = h.item_name;
          freq[name] = (freq[name] || 0) + 1;
        });
        // Get top 5 most bought products that exist in our catalog
        const sorted = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name]) => allProducts.find(p => p.name === name))
          .filter(Boolean)
          .slice(0, 5);
        if (!cancelled) setSuggestions(sorted);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, allProducts]);

  const handleVoiceResult = (text) => {
    setQuery(text);
    handleSearch(text);
  };

  // Live search — updates results as you type, no need to press Enter
  const handleSearch = (value) => {
    const q = value !== undefined ? value : query;
    if (!q.trim()) { setResults([]); return; }
    const ql = q.trim().toLowerCase();
    let res = allProducts
      .filter(p =>
        p.name.toLowerCase().includes(ql) ||
        p.category.toLowerCase().includes(ql) ||
        (p.brand || "").toLowerCase().includes(ql)
      )
      .slice(0, 20);
    if (filterMode === "price") {
      res = [...res].sort((a, b) => a.price - b.price);
    }
    setResults(res);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("הדפדפן לא תומך במיקום");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
        setFilterMode("location");
      },
      () => {
        setLocationError("לא ניתן לגשת למיקום, אנא אפשר הרשאה");
        setLocationLoading(false);
      }
    );
  };

  const handleFilterChange = (mode) => {
    if (mode === "location" && !userLocation) {
      requestLocation();
    } else {
      setFilterMode(mode);
    }
    if (results.length > 0) {
      let res = [...results];
      if (mode === "price") res.sort((a, b) => a.price - b.price);
      setResults(res);
    }
  };

  const handleAdd = (product) => {
    onAddProduct(product);
    setAddedIds(prev => new Set([...prev, product.name]));
  };

  const handleClose = (val) => {
    onOpenChange(val);
    if (!val) { setQuery(""); setResults([]); setAddedIds(new Set()); setLocationError(""); }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl" dir="rtl">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-xl font-bold text-right">חיפוש מוצרים</DialogTitle>
        </DialogHeader>

        <div className="px-5 space-y-3">
          {/* Search input */}
          <div className="flex gap-2">
            <Input
              placeholder="חפש מוצר... (חלב, נענע, לחם...)"
              value={query}
              onChange={(e) => { setQuery(e.target.value); handleSearch(e.target.value); }}
              className="h-12 rounded-2xl text-base border-2 border-primary/20 focus-visible:border-primary"
              autoFocus
            />
            <VoiceSearchButton onResult={handleVoiceResult} />
            <Button onClick={() => handleSearch()} className="h-12 w-12 rounded-2xl flex-shrink-0 bg-primary hover:bg-primary/90">
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Filter bar */}
          <div className="flex gap-2 bg-muted rounded-2xl p-1">
            <button
              onClick={() => handleFilterChange("price")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                filterMode === "price"
                  ? "bg-white text-primary shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tag className="w-4 h-4" />
              לפי מחיר
            </button>
            <button
              onClick={() => handleFilterChange("location")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                filterMode === "location"
                  ? "bg-white text-primary shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              לפי מיקום
              {userLocation && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
            </button>
          </div>

          {locationError && (
            <p className="text-sm text-destructive text-center">{locationError}</p>
          )}

          {filterMode === "location" && userLocation && (
            <div className="flex items-center gap-2 bg-primary/10 rounded-2xl px-4 py-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">מציג סופרים קרובים אליך</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 mt-3 space-y-2 min-h-0">
          {loadingProducts && !query && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-muted-foreground text-base">טוען מוצרים...</p>
            </div>
          )}

          {!loadingProducts && results.length === 0 && !query && (
            suggestions.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">המלצות בשבילך</p>
                </div>
                <div className="space-y-2">
                  {suggestions.map((product, idx) => {
                    const isAdded = addedIds.has(product.name);
                    const emoji = getProductEmoji(product.name, product.category);
                    return (
                      <div key={idx} className={`rounded-2xl border transition-all flex items-center gap-3 p-3 ${
                        isAdded ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                      }`}>
                        <div className="w-[52px] h-[52px] rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl"
                              onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-size:22px">${emoji}</span>`; }} />
                          ) : (
                            <span className="text-2xl">{emoji}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-foreground line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
                            <span className="text-sm font-bold text-primary">₪{product.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => !isAdded && handleAdd(product)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isAdded ? "bg-primary text-primary-foreground" : "border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                          }`}>
                          {isAdded ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingBasket className="w-14 h-14 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-base">חפש מוצר מהסופר</p>
              </div>
            )
          )}

          {results.length === 0 && query && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-base">לא נמצאו תוצאות, נסה מילה אחרת</p>
            </div>
          )}

          {results.map((product, idx) => {
            const isAdded = addedIds.has(product.name);
            const emoji = getProductEmoji(product.name, product.category);
            const nearbyStores = filterMode === "location" && userLocation
              ? getSimulatedStores(product.name, userLocation)
              : null;

            return (
              <div key={idx} className={`rounded-2xl border transition-all overflow-hidden ${
                isAdded ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              }`}>
                <div className="flex items-center gap-3 p-3">
                  <div className="w-13 h-13 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden w-[52px] h-[52px]">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-size:22px">${emoji}</span>`; }}
                      />
                    ) : (
                      <span className="text-2xl">{emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground line-clamp-1">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
                      <span className="text-sm font-bold text-primary">₪{product.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{product.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => !isAdded && handleAdd(product)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isAdded
                        ? "bg-primary text-primary-foreground"
                        : "border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    {isAdded ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>

                {nearbyStores && (
                  <div className="px-3 pb-3 flex gap-2 overflow-x-auto">
                    {nearbyStores.map((store) => (
                      <div key={store.chain} className="flex-shrink-0 bg-primary/8 border border-primary/20 rounded-xl px-3 py-1.5 text-xs">
                        <span className="font-semibold text-primary">{store.name}</span>
                        <span className="text-muted-foreground mr-1">· {store.distance} ק״מ</span>
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