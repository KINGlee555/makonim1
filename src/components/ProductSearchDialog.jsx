import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2, ShoppingBasket } from "lucide-react";

const CATEGORY_EMOJIS = {
  "פירות וירקות": "🥦", "מוצרי חלב": "🥛", "בשר ודגים": "🥩",
  "לחם ומאפים": "🍞", "שימורים": "🥫", "חטיפים ומתוקים": "🍫",
  "משקאות": "🧃", "ניקיון": "🧹", "היגיינה": "🧴",
  "תבלינים": "🧂", "קפואים": "🧊", "אחר": "🛒"
};

function mapCategory(tags = []) {
  const str = tags.join(" ").toLowerCase();
  if (str.includes("dairy") || str.includes("milk") || str.includes("cheese") || str.includes("yogurt")) return "מוצרי חלב";
  if (str.includes("meat") || str.includes("fish") || str.includes("chicken")) return "בשר ודגים";
  if (str.includes("bread") || str.includes("bakery") || str.includes("pastry")) return "לחם ומאפים";
  if (str.includes("snack") || str.includes("candy") || str.includes("sweet") || str.includes("chocolate")) return "חטיפים ומתוקים";
  if (str.includes("beverage") || str.includes("drink") || str.includes("juice") || str.includes("water")) return "משקאות";
  if (str.includes("frozen")) return "קפואים";
  if (str.includes("fruit") || str.includes("vegetable")) return "פירות וירקות";
  if (str.includes("spice") || str.includes("condiment") || str.includes("sauce")) return "תבלינים";
  if (str.includes("canned") || str.includes("conserve")) return "שימורים";
  if (str.includes("cleaning") || str.includes("household")) return "ניקיון";
  if (str.includes("hygiene") || str.includes("beauty") || str.includes("cosmetic")) return "היגיינה";
  return "אחר";
}

export default function ProductSearchDialog({ open, onOpenChange, onAddProduct }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);

    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,image_url,categories_tags,quantity,nutriments`;
    const res = await fetch(url);
    const data = await res.json();

    const products = (data.products || [])
      .filter(p => p.product_name && p.image_url)
      .slice(0, 10)
      .map(p => ({
        name: p.product_name + (p.quantity ? ` ${p.quantity}` : ""),
        brand: p.brands || "",
        category: mapCategory(p.categories_tags || []),
        price: 0,
        image_url: p.image_url || ""
      }));

    setResults(products);
    setLoading(false);
  };

  const handleAdd = (product) => {
    onAddProduct(product);
    setAddedIds(prev => new Set([...prev, product.name]));
  };

  const handleClose = (val) => {
    onOpenChange(val);
    if (!val) { setQuery(""); setResults([]); setAddedIds(new Set()); }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">חיפוש מוצרים</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <Input
            placeholder="חפש מוצר... (חלב, לחם, עגבניות...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-12 rounded-xl text-base"
            autoFocus
          />
          <Button onClick={handleSearch} className="h-12 w-12 rounded-xl flex-shrink-0" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2 min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground text-base">מחפש מוצרים...</p>
            </div>
          )}

          {!loading && results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBasket className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-base">חפש מוצר מהסופר</p>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-base">לא נמצאו תוצאות, נסה מילה אחרת</p>
            </div>
          )}

          {results.map((product, idx) => {
            const isAdded = addedIds.has(product.name);
            const emoji = CATEGORY_EMOJIS[product.category] || "🛒";

            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.parentNode.innerHTML = `<span style="font-size:24px">${emoji}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-2xl">{emoji}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-foreground leading-tight">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {product.brand && <span className="text-sm text-muted-foreground">{product.brand}</span>}
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{product.category}</span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant={isAdded ? "default" : "outline"}
                  className="h-10 w-10 rounded-full flex-shrink-0"
                  onClick={() => !isAdded && handleAdd(product)}
                >
                  {isAdded ? <span className="text-sm">✓</span> : <Plus className="w-5 h-5" />}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}