import { categoryImage } from "@/lib/marketPalette";

// כותרת מחלקה שנשארת למעלה בזמן שהמוצרים שלה נגללים מתחתיה.
export default function CategoryHeader({ category, count }) {
  return (
    <div
      className="sticky z-20 -mx-5 flex items-center gap-2.5 border-b border-ui-line bg-ui-canvas px-5 pb-2 pt-2.5 sm:-mx-7 sm:px-7"
      style={{ top: "var(--ui-head-h, 106px)" }}
    >
      <img
        src={categoryImage(category)}
        alt={category}
        className="h-8 w-8 shrink-0 rounded-full object-cover [filter:saturate(.6)_brightness(1.08)]"
      />
      <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ui-ink">{category}</h2>
      <span className="shrink-0 rounded-[10px] border border-ui-accent px-2 text-[13px] leading-5 text-ui-accent">{count}</span>
    </div>
  );
}