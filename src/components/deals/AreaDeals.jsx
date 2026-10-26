import DealsShelf from "@/components/deals/DealsShelf";
import PriceDropNotice from "@/components/PriceDropNotice";
import PetFoodDeals from "@/components/pets/PetFoodDeals";

// "המבצעים באזור שלי" — במקום הצעות חכמות: מבצעים אמיתיים מהסופרים המוכרים,
// ירידות מחיר מול מה ששילמתם בפעם האחרונה, ואוכל לחיות במבצע מחנויות החיות.
export default function AreaDeals({ listId, items, onAddProduct, onOpenAllDeals }) {
  return (
    <div className="space-y-4">
      <DealsShelf bare onAddProduct={onAddProduct} onOpenAllDeals={onOpenAllDeals} />
      <PriceDropNotice listId={listId} items={items} />
      <PetFoodDeals onAddProduct={onAddProduct} />
    </div>
  );
}