// פס המחלקות בראש המסך: כל מחלקה ככדור בצבע שלה, והפס נשאר למעלה בזמן גלילת המוצרים.
export default function CategoryBar({ categories }) {
  if (!categories.length) return null;

  return (
    <div className="pst-bar">
      <div className="pst-bar-in">
        {categories.map((category, index) => (
          <span key={category} className={index === 0 ? "pst-bar-a" : index === 1 ? "pst-bar-b" : ""}>
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}