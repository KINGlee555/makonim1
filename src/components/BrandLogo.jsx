import "@/styles/brand.css";

// הלוגו של הבית: שם המותג כמילה אחת, בפונט מעוגל וכבד ובכחול בהיר —
// טקסט אמיתי ולא תמונה, כך שהוא תמיד חד, קריא ומתיישב נכון גם במצב כהה.
export default function BrandLogo({ size = "md", className = "" }) {
  return (
    <span className={`brand-logo brand-logo-${size} ${className}`.trim()}>
      <span className="brand-logo-word">MaKonim</span>
      <span className="brand-logo-dot" aria-hidden="true" />
    </span>
  );
}