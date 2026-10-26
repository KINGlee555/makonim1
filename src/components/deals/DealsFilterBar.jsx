import { useT } from "@/lib/i18n";

// סינון תוצאות המבצעים: הכול, רשת אחת, או ההנחות הגדולות בלבד.
export default function DealsFilterBar({ value, onChange, chains }) {
  const t = useT();
  const chips = [
    { id: "all", label: t("filter.all") },
    ...chains.map(chain => ({ id: chain.id, label: chain.name || chain.id })),
    { id: "big", label: t("filter.big") }
  ];

  if (!chains.length) return null;

  return (
    <div className="pst-chips mb-3" role="group" aria-label={t("filter.label")}>
      {chips.map(chip => (
        <button key={chip.id} type="button" onClick={() => onChange(chip.id)}
          className={`pst-chip ${value === chip.id ? "pst-chip-on" : ""}`}>
          {chip.label}
        </button>
      ))}
    </div>
  );
}