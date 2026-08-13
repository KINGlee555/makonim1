export default function AppHeader({ rightAction, userName }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-primary/10 shadow-sm px-4 py-2">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/d32242af8_IMG_0035.png"
            alt="מה קונים?"
            className="h-12 w-auto object-contain"
          />
          {rightAction && <div>{rightAction}</div>}
        </div>
        {userName && (
          <p className="text-sm font-medium text-primary mt-1">
            היי! מה קונים {userName} 👋
          </p>
        )}
      </div>
    </header>
  );
}