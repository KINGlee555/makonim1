// מקטע במסמך משפטי — כותרת משנה וטקסט קריא, באותה שפה עיצובית של האפליקציה.
export default function LegalSection({ title, children }) {
  return (
    <section className="pst-panel" aria-label={title}>
      <h2 className="mb-3 text-[19px] font-black leading-tight text-ui-ink sm:text-[21px]">{title}</h2>
      <div className="space-y-3 text-[15px] font-bold leading-relaxed text-ui-muted">{children}</div>
    </section>
  );
}

export function LegalList({ items }) {
  return (
    <ul className="list-disc space-y-2 pe-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalUpdated({ date }) {
  return <p className="text-[13px] font-bold text-ui-muted">עודכן לאחרונה: {date}</p>;
}