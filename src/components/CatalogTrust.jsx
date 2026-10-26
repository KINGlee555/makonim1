import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

// המספר האמיתי של המוצרים באפליקציה — ישר מהמסד, לא הבטחה. מוצג ליד המיתוג כדי
// שכל מי שנכנס יראה מיד שהקטלוג גדול, ישראלי, ואפשר לסמוך עליו.
export default function CatalogTrust({ compact = false }) {
  const t = useT();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      base44.entities.CatalogProduct.count({}),
      base44.entities.PetProduct.count({})
    ]).then(([market, pet]) => {
      if (!cancelled) setCounts({ market, pet });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!counts) return null;
  const fmt = (value) => Number(value || 0).toLocaleString("he-IL");
  const total = counts.market + counts.pet;

  if (compact) {
    return <p className="pst-trust">{t("trust.line", { total: fmt(total) })}</p>;
  }

  return (
    <>
      <h2 className="pst-h2 pst-h2-b">{t("trust.band")}</h2>
      <div className="pst-panel text-center">
        <b className="block font-display text-6xl leading-none">{fmt(total)}</b>
        <p className="mt-2 text-base font-black">{t("trust.total")}</p>
        <div className="pst-cards mt-5 text-start">
          <div className="pst-why">
            <span className="pst-why-n">{fmt(counts.market)}</span>
            <p className="min-w-0">{t("trust.market")}</p>
          </div>
          <div className="pst-why">
            <span className="pst-why-n">{fmt(counts.pet)}</span>
            <p className="min-w-0">{t("trust.pet")}</p>
          </div>
        </div>
      </div>
    </>
  );
}