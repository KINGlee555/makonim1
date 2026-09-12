const filters = [
  ["all", "הכול"],
  ["open", "פתוח בשבת"],
  ["closed", "סגור בשבת"]
];

export default function NearbyDealsFilters({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide" aria-label="סינון לפי פתיחה בשבת">
      {filters.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)} className={`h-9 flex-shrink-0 rounded-full px-4 text-sm font-semibold ${value === id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}