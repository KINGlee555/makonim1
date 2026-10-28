import { useT } from "@/lib/i18n";

// שני המספרים של הרשימה — סה״כ העלויות וכמה מוצרים נשאר לקנות.
// יושבים מתחת לרשימת הקניות, כדי שהמוצרים עצמם יהיו הדבר הראשון שרואים.
export default function ListTotals({ itemCount, total }) {
  const t = useT();

  return (
    <section className="pst-totals-slot" aria-label={t("list.total")}>
      <div className="pst-nums">
        <span className="pst-num">
          {t("list.total")}
          <b>₪{total.toFixed(2)}</b>
        </span>
        <span className="pst-num pst-num-t">
          {t("list.toBuy")}
          <b>{itemCount}</b>
        </span>
      </div>
    </section>
  );
}