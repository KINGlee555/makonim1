import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, Store, X } from "lucide-react";
import { FAST_CHAINS, fetchChainPrices } from "@/lib/chainPrices";
import { openChainsNow } from "@/lib/openChains";
import { useT } from "@/lib/i18n";

// אחרי שמוצר נוסף לרשימה: איפה אפשר לקנות אותו עכשיו — רק חנויות שפתוחות —
// ובאיזו מהן הכי זול. חנות סגורה לא מוצעת, גם אם המחיר שלה זול יותר.
export default function WhereToBuyCard({ product, onClose }) {
  const t = useT();
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const openChains = useMemo(() => openChainsNow(), []);

  useEffect(() => {
    if (!product?.name) return;
    let cancelled = false;
    const item = { name: product.name, barcode: product.barcode || "" };
    const key = product.barcode || product.name;
    const found = (result) => {
      const map = {};
      (result?.chains || []).forEach(chain => {
        const price = chain.prices?.[key];
        if (price > 0) map[chain.id] = price;
      });
      return map;
    };
    setPrices({});
    setLoading(true);
    (async () => {
      try {
        // 1. מה שכבר שמור לנו במסד — מופיע מיד
        const cached = await fetchChainPrices([item], undefined, { cacheOnly: true });
        if (cancelled) return;
        setPrices(found(cached));
        setLoading(false);
        // 2. המחיר החי של הרשתות הגדולות — מתווסף על המסך כשמגיע
        const fresh = await fetchChainPrices([item], FAST_CHAINS);
        if (cancelled) return;
        setPrices(previous => ({ ...previous, ...found(fresh) }));
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [product?.name, product?.barcode]);

  if (!product?.name) return null;

  // רק חנויות שפתוחות עכשיו ויש להן מחיר אמיתי למוצר — מהזול ליקר
  const offers = openChains
    .filter(chain => prices[chain.id] > 0)
    .map(chain => ({ ...chain, price: prices[chain.id] }))
    .sort((a, b) => a.price - b.price);

  return (
    <section className="pst-where animate-slide-up" aria-live="polite">
      <header className="pst-where-head">
        <p className="pst-where-label">
          <Store aria-hidden="true" />
          <span>{t("where.title", { name: product.name })}</span>
        </p>
        <button type="button" className="pst-where-x" onClick={onClose} aria-label={t("where.close")}>
          <X aria-hidden="true" />
        </button>
      </header>

      {!offers.length && loading && (
        <p className="pst-where-note">
          <Loader2 className="animate-spin" aria-hidden="true" />
          {t("where.searching")}
        </p>
      )}

      {!offers.length && !loading && (
        <p className="pst-where-note">
          {openChains.length ? t("where.noPrice") : t("where.noneOpen")}
        </p>
      )}

      {offers.length > 0 && (
        <div className="pst-where-rows">
          {offers.slice(0, 3).map((chain, index) => (
            <div key={chain.id} className="pst-where-row">
              <span className="pst-where-nm">{chain.name}</span>
              {index === 0 && <span className="pst-where-best">{t("where.cheapestTag")}</span>}
              <span className="pst-where-time">
                <Clock aria-hidden="true" />
                {t("where.openUntil", { time: chain.until })}
              </span>
              <b className="pst-where-price">₪{chain.price.toFixed(2)}</b>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}