// הרץ הקטן שבפס המחלקה — סימן התנועה של הכרזה, בצבע של הפס שמאחוריו.
export default function SectionRunner({ tone = "ink" }) {
  const onYellow = tone === "ink";

  return (
    <svg className="pst-runner" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="28" cy="9" r="5" fill={onYellow ? "hsl(var(--pst-ink))" : "hsl(var(--pst-yellow))"} />
      <path d="M26 16l-8 8 4 4 6-3 3 8-6 9h6l6-9-3-9 5-3-3-5-8 5z" fill={onYellow ? "hsl(var(--pst-ink))" : "hsl(var(--pst-yellow))"} />
      <path d="M14 20l6-2" stroke={onYellow ? "hsl(var(--pst-pink))" : "hsl(var(--pst-ink))"} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}