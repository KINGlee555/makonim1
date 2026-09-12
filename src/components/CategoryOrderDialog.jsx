import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { DEFAULT_CATEGORY_ORDER, loadCategoryOrder, saveCategoryOrder } from "@/lib/categoryOrder";

export default function CategoryOrderDialog({ open, onOpenChange, onSaved }) {
  const [order, setOrder] = useState(DEFAULT_CATEGORY_ORDER);

  useEffect(() => {
    if (open) setOrder(loadCategoryOrder());
  }, [open]);

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const handleSave = () => {
    saveCategoryOrder(order);
    onSaved?.(order);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col gap-3 p-5 sm:!max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">סדר המחלקות בסופר</DialogTitle>
          <p className="text-sm text-muted-foreground">סדרו את המחלקות לפי המסלול שלכם בסופר — הרשימה תסתדר בדיוק לפי הסדר הזה.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
          {order.map((category, index) => (
            <div key={category} className="flex items-center gap-2 rounded-2xl bg-card border p-2.5">
              <span className="w-7 h-7 flex-shrink-0 rounded-full bg-secondary text-secondary-foreground text-sm font-bold flex items-center justify-center">{index + 1}</span>
              <span className="flex-1 text-base font-medium truncate">{category}</span>
              <button onClick={() => move(index, -1)} aria-label={`העלה ${category}`} className="pointer-events-auto w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => move(index, 1)} aria-label={`הורד ${category}`} className="pointer-events-auto w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOrder(DEFAULT_CATEGORY_ORDER)} className="h-12 rounded-2xl gap-1.5">
            <RotateCcw className="w-4 h-4" />ברירת מחדל
          </Button>
          <Button onClick={handleSave} className="h-12 flex-1 rounded-2xl text-base font-bold">שמור סדר</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}