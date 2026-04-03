import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2, ShoppingBasket } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ProductSearchDialog({ open, onOpenChange, onAddProduct }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `אתה עוזר קניות בסופרמרקט בישראל. המשתמש מחפש: "${query}".
      
      החזר רשימה של עד 10 מוצרים רלוונטיים שניתן למצוא בסופרמרקטים בישראל (שופרסל, רמי לוי, מגה וכו').
      עבור כל מוצר תן: שם מוצר מדויק בעברית, מותג, קטגוריה, ומחיר משוער בשקלים.
      
      הקטגוריות האפשריות: פירות וירקות, מוצרי חלב, בשר ודגים, לחם ומאפים, שימורים, חטיפים ומתוקים, משקאות, ניקיון, היגיינה, תבלינים, קפואים, אחר.`,
      response_json_schema: {
        type: "object",
        properties: {
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                brand: { type: "string" },
                category: { type: "string" },
                price: { type: "number" }
              }
            }
          }
        }
      }
    });
    setResults(res.products || []);
    setLoading(false);
  };

  const handleAdd = (product) => {
    onAddProduct({
      name: product.brand ? `${product.name} - ${product.brand}` : product.name,
      price: product.price || 0,
      category: product.category || "אחר",
      image_url: ""
    });
    setAddedIds(prev => new Set([...prev, `${product.name}-${product.brand}`]));
  };

  const handleClose = (val) => {
    onOpenChange(val);
    if (!val) {
      setQuery("");
      setResults([]);
      setAddedIds(new Set());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">חיפוש מוצרים</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <Input
            placeholder="חפש מוצר... (למשל: חלב, לחם, עגבניות)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-12 rounded-xl text-base"
            autoFocus
          />
          <Button
            onClick={handleSearch}
            className="h-12 w-12 rounded-xl flex-shrink-0"
            disabled={loading}
          >
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

          {!loading && results.length === 0 && query && (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBasket className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-base">חפש מוצרים מהסופר</p>
            </div>
          )}

          {results.map((product, idx) => {
            const productId = `${product.name}-${product.brand}`;
            const isAdded = addedIds.has(productId);
            
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBasket className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-foreground truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {product.brand && (
                      <span className="text-sm text-muted-foreground">{product.brand}</span>
                    )}
                    {product.price > 0 && (
                      <span className="text-sm font-medium text-primary">₪{product.price.toFixed(2)}</span>
                    )}
                  </div>
                  {product.category && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">
                      {product.category}
                    </span>
                  )}
                </div>
                <Button
                  size="icon"
                  variant={isAdded ? "default" : "outline"}
                  className="h-10 w-10 rounded-full flex-shrink-0"
                  onClick={() => handleAdd(product)}
                  disabled={isAdded}
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