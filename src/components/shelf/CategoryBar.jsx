// פס המחלקות בראש המסך: כל מחלקה ככדור בצבע שלה, והפס נשאר למעלה בזמן גלילת המוצרים.
export default function CategoryBar({ categories }) {
  if (!categories.length) return null;

  return (
    <div className="shf-bar">
      <div className="shf-bar-in">
        {categories.map((category, index) => (
          <span key={category} className={index === 0 ? "shf-bar-a" : index === 1 ? "shf-bar-b" : ""}>
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}