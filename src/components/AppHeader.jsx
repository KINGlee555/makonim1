export default function AppHeader({ subtitle, rightAction }) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-2">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/a7d82b190_IMG_0027.png"
            alt="מה קונים?"
            className="h-12 w-auto object-contain"
          />
          {subtitle && <p className="text-xs text-muted-foreground leading-none mt-0.5">{subtitle}</p>}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}