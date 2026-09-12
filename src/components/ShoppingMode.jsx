import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, SkipForward, ShoppingBag, Maximize2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import ProductPhoto from "@/components/ProductPhoto";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

export default function ShoppingMode({ items, onBought, onExit, userName, listId }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [boughtCount, setBoughtCount] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Request fullscreen on mount for distraction-free shopping
    const elem = containerRef.current;
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!userName || !listId) return;
    let cancelled = false;
    base44.entities.ShoppingList.get(listId).then(list => {
      if (cancelled) return;
      const shoppers = list.active_shoppers || [];
      if (!shoppers.includes(userName)) {
        base44.entities.ShoppingList.update(listId, { active_shoppers: [...shoppers, userName] });
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
      base44.entities.ShoppingList.get(listId).then(list => {
        const shoppers = (list.active_shoppers || []).filter(s => s !== userName);
        base44.entities.ShoppingList.update(listId, { active_shoppers: shoppers });
      }).catch(() => {});
    };
  }, [userName, listId]);

  const handleNext = useCallback((bought) => {
    if (bought && items[index]) {
      onBought(items[index]);
      setBoughtCount(c => c + 1);
    } else {
      setIndex(i => i + 1);
    }
  }, [items, index, onBought]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext(true);
      else if (e.key === "ArrowLeft") handleNext(false);
      else if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, onExit]);

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <p className="text-xl text-muted-foreground mb-6">{t("list.empty")}</p>
        <Button onClick={onExit} className="bg-primary text-primary-foreground rounded-xl px-8">{t("shoppingMode.exit")}</Button>
      </div>
    );
  }

  if (index >= items.length) {
    // Confetti celebration
    if (boughtCount > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#3d8c97", "#d1f2f3", "#f5c98a", "#b5f59c"] });
      setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }), 200);
      setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }), 400);
    }
    return (
      <div ref={containerRef} className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("shoppingMode.done")}</h2>
        <p className="text-muted-foreground mb-1">{t("shoppingMode.boughtCount", { count: boughtCount })}</p>
        <p className="text-muted-foreground mb-6">{items.length - boughtCount} {t("shoppingMode.skipped")}</p>
        <Button onClick={onExit} className="bg-primary text-primary-foreground rounded-xl px-8">{t("shoppingMode.exit")}</Button>
      </div>
    );
  }

  const item = items[index];
  const progress = (index / items.length) * 100;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="pt-4 px-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-xl"><X className="w-5 h-5" /></Button>
          <span className="text-sm font-medium text-muted-foreground">{index + 1} / {items.length}</span>
          <div className="w-10" />
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) handleNext(true);
              else if (info.offset.x < -100) handleNext(false);
            }}
            className="w-full max-w-sm bg-card border-2 border-border rounded-3xl p-8 shadow-lg cursor-grab active:cursor-grabbing select-none"
          >
            <ProductPhoto name={item.name} category={item.category} imageUrl={item.image_url} className="mx-auto mb-6 h-32 w-32 rounded-2xl" />
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">{item.name}</h2>
            {item.category && <p className="text-center text-muted-foreground mb-4">{item.category}</p>}
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-3xl font-bold text-primary">₪{(item.price || 0).toFixed(2)}</span>
              {item.quantity > 1 && <span className="text-lg text-muted-foreground">×{item.quantity}</span>}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-4 pb-8">
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" className="h-14 rounded-full px-6 border-2 text-muted-foreground" onClick={() => handleNext(false)}>
            <SkipForward className="w-6 h-6" /><span className="ms-1">{t("shoppingMode.skip")}</span>
          </Button>
          <Button className="h-20 w-20 rounded-full bg-primary text-primary-foreground shadow-lg" onClick={() => handleNext(true)}>
            <Check className="w-10 h-10" />
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">{t("shoppingMode.swipeHint")}</p>
      </div>
    </div>
  );
}