import { Link } from "react-router-dom";
import { ChevronLeft, ShoppingBag, Users } from "lucide-react";

export default function ListCard({ list, itemCount, boughtCount }) {
  const pending = (itemCount || 0) - (boughtCount || 0);
  
  return (
    <Link to={`/list/${list.id}`} className="block">
      <div className="bg-card rounded-3xl border border-primary/10 p-5 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 active:scale-[0.98]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-7 h-7 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">{list.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-base text-muted-foreground">
                  {pending > 0 ? `${pending} לקנות` : "הכל נקנה! ✓"}
                </span>
                {list.shared_with?.length > 0 && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    {list.shared_with.length}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronLeft className="w-6 h-6 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}