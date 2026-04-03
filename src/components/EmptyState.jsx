export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground text-lg mb-6 max-w-xs">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}