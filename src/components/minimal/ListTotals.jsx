import { useT } from "@/lib/i18n";

// שני המספרים של הרשימה — סה״כ העלויות וכמה מוצרים נשאר לקנות.
// יושבים בתוך הפתיח הצהוב, כך שהם הדבר הראשון שרואים.
export default function ListTotals({ itemCount, total }) {
  const t = useT();

  return (
    <section className="pw-nums" aria-label={t("list.total")}>
      <span className="pw-num">
        {t("list.total")}
        <b>₪{total.toFixed(2)}</b>
      </span>
      <span className="pw-num pw-num-t">
        {t("list.toBuy")}
        <b>{itemCount}</b>
      </span>
    </section>
  );
}