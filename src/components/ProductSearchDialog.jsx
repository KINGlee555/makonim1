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
      prompt: `אתה מאגר מוצרים של סופרמרקט ישראלי. המשתמש חיפש: "${query}".

החזר רשימה של 8-10 מוצרים אמיתיים שנמכרים בסופרמרקטים בישראל (שופרסל, רמי לוי, מגה, ויקטורי).
השתמש בידע שלך על מוצרים ישראליים אמיתיים עם מותגים אמיתיים.

דוגמאות למוצרים:
- חלב תנובה 3% 1 ליטר - ₪6.90
- לחם אחיד אחד - ₪7.50
- ביצים L 12 יחידות - ₪19.90
- שמן זית כתית מעולה 750ml - ₪35.00
- גבינה צהובה עמק 400g - ₪22.90

עבור כל מוצר תן:
- name: שם המוצר המלא בעברית כולל מותג וגודל/משקל
- brand: שם המותג
- category: קטגוריה (פירות וירקות / מוצרי חלב / בשר ודגים / לחם ומאפים / שימורים / חטיפים ומתוקים / משקאות / ניקיון / היגיינה / תבלינים / קפואים / אחר)
- price: מחיר משוער בשקלים (מספר בלבד)
- image_url: השאר ריק ("")

ודא שהמוצרים רלוונטיים לחיפוש ואמיתיים לחלוטין.`,
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
                price: { type: "number" },
                image_url: { type: "string" }
              }
            }
          }
        }
      }
    });
    setResults(res?.products || []);
    setLoading(false);
  };

  const handleAdd = (product) => {
    onAddProduct({
      name: product.name,
      price: product.price || 0,
      category: product.category || "אחר",
      image_url: product.image_url || ""
    });
    setAddedIds(prev => new Set([...prev, product.name]));
  };

  const handleClose = (val) => {
    onOpenChange(val);
    if (!val) {
      setQuery("");
      setResults([]);
      setAddedIds(new Set());
    }
  };

  const CATEGORY_EMOJIS = {
    "פירות וירקות": "🥦", "מוצרי חלב": "🥛", "בשר ודגים": "🥩",
    "לחם ומאפים": "🍞", "שימורים": "🥫", "חטיפים ומתוקים": "🍫",
    "משקאות": "🧃", "ניקיון": "🧹", "היגיינה": "🧴",
    "תבלינים": "🧂", "קפואים": "🧊", "אחר": "🛒"
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

          {!loading && results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBasket className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-base">חפש מוצר מהסופר</p>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-base">לא נמצאו תוצאות, נסה שוב</p>
            </div>
          )}

          {results.map((product, idx) => {
            const isAdded = addedIds.has(product.name);
            const emoji = CATEGORY_EMOJIS[product.category] || "🛒";

            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<span style="font-size:24px">${emoji}</span>`; }}
                    />
                  ) : (
                    <span className="text-2xl">{emoji}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-foreground">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {product.brand && <span className="text-sm text-muted-foreground">{product.brand}</span>}
                    {product.price > 0 && (
                      <span className="text-sm font-semibold text-primary">₪{Number(product.price).toFixed(2)}</span>
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