import { ShoppingCart } from "lucide-react";

export default function AppHeader({ subtitle, rightAction }) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold text-foreground tracking-tight">MaKonim</span>
            {subtitle && <p className="text-xs text-muted-foreground leading-none mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}