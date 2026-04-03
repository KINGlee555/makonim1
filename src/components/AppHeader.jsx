import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function AppHeader({ title, backTo, rightAction }) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backTo ? (
            <Link to={backTo} className="text-2xl text-muted-foreground hover:text-foreground transition-colors">
              →
            </Link>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}