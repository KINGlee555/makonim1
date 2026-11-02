// פס המחלקות בראש המסך: כל מחלקה ככדור בכרזה, והפס נשאר למעלה בזמן גלילת המוצרים.
export default function CategoryBar({ categories }) {
  if (!categories.length) return null;

  return (
    <div className="pw-bar">
      {categories.map((category, index) => (
        <span key={category} className={index === 0 ? "pw-bar-a" : ""}>
          {category}
        </span>
      ))}
    </div>
  );
}