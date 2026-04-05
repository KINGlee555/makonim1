import { useState } from "react";
import { searchProducts } from "@/lib/israeliProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ShoppingBasket } from "lucide-react";

const CATEGORY_EMOJIS = {
  "פירות וירקות": "🥦", "מוצרי חלב": "🥛", "בשר ודגים": "🥩",
  "לחם ומאפים": "🍞", "שימורים": "🥫", "חטיפים ומתוקים": "🍫",
  "משקאות": "🧃", "ניקיון": "🧹", "היגיינה": "🧴",
  "תבלינים": "🧂", "קפואים": "🧊", "אחר": "🛒"
};



export default function ProductSearchDialog({ open, onOpenChange, onAddProduct }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());

  const handleSearch = () => {
    if (!query.trim()) return;
    setResults(searchProducts(query));
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
          <Button onClick={handleSearch} className="h-12 w-12 rounded-xl flex-shrink-0">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2 min-h-0">
          {results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBasket className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-base">חפש מוצר מהסופר</p>
            </div>
          )}

          {results.length === 0 && query && (
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
                  <p className="text-base font-medium text-foreground leading-tight line-clamp-2">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {product.brand && <span className="text-sm text-muted-foreground">{product.brand}</span>}
                    <span className="text-sm font-bold text-primary">₪{product.price.toFixed(2)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">{product.category}</span>
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