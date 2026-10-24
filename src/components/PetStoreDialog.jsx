import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ExternalLink, Loader2, Navigation, Package, PawPrint, Plus, Search, Tag } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { PET_CATEGORY, PET_STORES, isBigSize, wazeUrl } from "@/lib/petStores";

const MODES = [
  { id: "all", key: "pet.mode.all", icon: Search },
  { id: "deals", key: "pet.mode.deals", icon: Tag },
  { id: "big", key: "pet.mode.big", icon: Package },
];

const TURN_KEY = "makonim_pet_store_turn";
// בכל פתיחה מתקדמים בקטלוג של חנות אחת-שתיים בלבד — כדי לא להעמיס על החנויות
// ועל השרת, והחיפוש מתעדכן עם כל מה שכבר נטען
const CHUNKS_PER_STORE = 6;
const STORES_PER_OPEN = 2;

export default function PetStoreDialog({ open, onOpenChange, onAddProduct }) {
  const t = useT();
  const [store, setStore] = useState("all");
  const [mode, setMode] = useState("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(null);
  const [addedIds, setAddedIds] = useState([]);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const buildingRef = useRef(false);

  // הטעינה מהחנויות מתקדמת חנות-חנות וממשיכה מאיפה שעצרה, כדי שקטלוג
  // שנקטע באמצע יושלם בפתיחה הבאה
  const ensureCatalog = useCallback(async (storeFilter) => {
    if (buildingRef.current) return;
    buildingRef.current = true;
    try {
      const stores = PET_STORES.filter(item => item.live);
      const stored = localStorage.getItem(TURN_KEY) || "";
      const pending = stored.endsWith("!");
      const storedId = pending ? stored.slice(0, -1) : stored;
      const found = stores.findIndex(item => item.id === storedId);
      const startIndex = found < 0 ? 0 : Math.max(0, found + (pending ? 0 : 1));
      const rotation = [...stores.slice(startIndex), ...stores.slice(0, startIndex)];
      const order = storeFilter !== "all" ? stores.filter(item => item.id === storeFilter) : rotation;

      for (const petStore of order.slice(0, STORES_PER_OPEN)) {
        let fromPage = 0;
        let chunks = 0;
        let total = 0;
        let finished = false;
        for (let step = 0; step < CHUNKS_PER_STORE; step += 1) {
          setBuilding({ name: petStore.name, count: total });
          const response = await base44.functions.invoke("petCatalog", {
            store: petStore.id,
            ...(fromPage ? { from_page: fromPage } : {}),
          });
          const data = response?.data || {};
          total = data.total || total;
          if (data.skip || data.error) {
            finished = true;
            break;
          }
          chunks += 1;
          fromPage = data.next_page || 0;
          if (data.done || !fromPage) {
            finished = true;
            break;
          }
        }
        setBuilding(null);
        if (chunks > 0) setCatalogVersion(version => version + 1);
        localStorage.setItem(TURN_KEY, finished ? petStore.id : `${petStore.id}!`);
      }
    } finally {
      buildingRef.current = false;
    }
  }, []);

  const runSearch = useCallback(async (text, storeFilter, listMode) => {
    setLoading(true);
    try {
      const criteria = {};
      if (storeFilter !== "all") criteria.store = storeFilter;
      const trimmed = text.trim();
      if (trimmed) criteria.name = { $regex: trimmed };
      if (listMode === "deals") criteria.discount_pct = { $gt: 0 };
      // שקי מזון גדולים הם היקרים בקטלוג — לכן בתצוגה הזו מביאים קודם את המוצרים
      // עם משקל מזוהה, מהגדולים לקטנים, ואז מסננים 3 ק"ג ומעלה
      if (listMode === "big") criteria.size_label = { $ne: "" };
      const page = await base44.entities.PetProduct.filter(criteria, {
        sort: listMode === "deals" ? "-discount_pct" : listMode === "big" ? "-price" : "price",
        limit: listMode === "big" ? 300 : 40,
      });
      const items = page?.items || [];
      setRows(listMode === "big" ? items.filter(item => isBigSize(item.name)).slice(0, 40) : items);
    } catch (error) {
      console.error("pet store search failed", error);
      setRows([]);
    }
    setLoading(false);
  }, []);

  // פתיחה: מציגים מיד מה שכבר נטען, והקטלוג ממשיך להיטען ברקע
  useEffect(() => {
    if (!open) return;
    runSearch(query, store, mode);
    ensureCatalog(store).catch(() => {});
  }, [open]);

  // בחירת חנות מתחילה לטעון אותה מיד
  useEffect(() => {
    if (!open || store === "all") return;
    ensureCatalog(store).catch(() => {});
  }, [open, store, ensureCatalog]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => runSearch(query, store, mode), 300);
    return () => clearTimeout(timer);
  }, [open, query, store, mode, catalogVersion, runSearch]);

  const handleAdd = (product) => {
    onAddProduct({
      name: String(product.name).slice(0, 64),
      price: product.price,
      image_url: product.image_url,
      category: PET_CATEGORY,
      brand: product.brand || "",
    });
    setAddedIds(prev => (prev.includes(product.id) ? prev : [...prev, product.id]));
    toast({ title: t("pet.added", { name: String(product.name).slice(0, 28) }) });
  };

  const cheapest = rows.length > 1
    ? rows.reduce((min, item) => (item.price < min.price ? item : min), rows[0])
    : null;
  const chosenStore = PET_STORES.find(item => item.id === store);
  // ניווט לחנויות שמופיעות בתוצאות, ואם אין תוצאות — לחנויות שאין להן מחירים אצלנו
  const navStores = rows.length
    ? [...new Set(rows.map(item => item.store))].map(id => PET_STORES.find(item => item.id === id)).filter(Boolean).slice(0, 4)
    : PET_STORES.filter(item => !item.live);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[36rem]">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2 text-[17px] font-semibold text-ui-ink">
            <PawPrint className="h-5 w-5 text-ui-accent" />
            {t("pet.title")}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-ui-muted">{t("pet.hint")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ui-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("pet.search")}
              className="h-11 w-full rounded-xl border border-ui-line bg-ui-canvas px-3 pe-9 text-[15px] text-ui-ink outline-none focus-visible:border-ui-accent"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[{ id: "all", name: t("pet.allStores") }, ...PET_STORES].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStore(item.id)}
                className={`rounded-full border px-3 py-1.5 text-[13px] ${store === item.id ? "border-ui-accent bg-ui-accent text-white" : "border-ui-line text-ui-ink"}`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MODES.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] ${mode === item.id ? "border-ui-ink bg-ui-ink text-ui-canvas" : "border-ui-line text-ui-ink"}`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {t(item.key)}
              </button>
            ))}
          </div>

          {building && (
            <p className="flex items-center gap-2 rounded-xl border border-ui-line-soft bg-ui-surface px-3 py-2 text-[13px] text-ui-ink">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ui-accent" />
              <span>
                {t("pet.building", { store: building.name })}
                {building.count > 0 ? ` ${t("pet.buildingCount", { count: building.count })}` : ""}
              </span>
            </p>
          )}

          {!building && chosenStore && !chosenStore.live && (
            <p className="rounded-xl border border-ui-line-soft bg-ui-surface px-3 py-2 text-[13px] leading-relaxed text-ui-ink">
              {t("pet.blocked")}
            </p>
          )}

          {cheapest && !loading && (
            <p className="text-[13px] text-ui-muted">
              {t("pet.cheapest", { price: cheapest.price.toFixed(2), store: cheapest.store_name })}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-ui-accent" />
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-ui-line-soft px-4 py-8 text-center">
              <p className="text-[15px] font-medium text-ui-ink">{mode === "deals" ? t("pet.noDeals") : t("pet.empty")}</p>
              <p className="mt-1 text-[13px] text-ui-muted">{mode === "deals" ? t("pet.noDealsDesc") : t("pet.emptyDesc")}</p>
            </div>
          ) : (
            <>
              <p className="text-[12px] text-ui-muted">{t("pet.onlyImages")}</p>
              <div className="grid max-h-[46vh] grid-cols-2 gap-2 overflow-y-auto pe-1">
                {rows.map(product => (
                  <div key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-ui-line bg-card">
                    <div className="relative aspect-square bg-ui-surface">
                      <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-contain" />
                      {product.discount_pct > 0 && (
                        <span className="absolute end-1.5 top-1.5 rounded-full bg-market-pink px-2 py-0.5 text-[11px] font-bold text-white">
                          {t("pet.off", { percent: product.discount_pct })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-2">
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ui-ink">{product.name}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded-full bg-ui-surface px-2 py-0.5 text-[11px] text-ui-muted">{product.store_name}</span>
                        {product.size_label && (
                          <span className="rounded-full bg-ui-surface px-2 py-0.5 text-[11px] text-ui-muted">{product.size_label}</span>
                        )}
                      </div>
                      <div className="mt-auto flex items-end justify-between gap-1 pt-1">
                        <div>
                          <p className="text-[15px] font-semibold tabular-nums text-ui-ink">₪{product.price.toFixed(2)}</p>
                          {product.was_price > 0 && (
                            <p className="text-[11px] tabular-nums text-ui-muted line-through">₪{product.was_price.toFixed(2)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={t("pet.open")}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-ui-line text-ui-muted"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleAdd(product)}
                            aria-label={t("pet.add")}
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${addedIds.includes(product.id) ? "bg-ui-accent text-white" : "bg-ui-accent/10 text-ui-accent"}`}
                          >
                            {addedIds.includes(product.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {navStores.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-ui-line-soft pt-3">
              {navStores.map(petStore => (
                <a
                  key={petStore.id}
                  href={wazeUrl(petStore.nav || petStore.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ui-line px-3 py-1.5 text-[13px] text-ui-ink"
                >
                  <Navigation className="h-3.5 w-3.5 text-ui-accent" />
                  {t("pet.nav", { store: petStore.name })}
                </a>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}