// שורת כרטיסי הכלים שנגללת הצידה — לחיצה על כרטיס פותחת את הכלי שמתחתיה.
export default function ToolStrip({ tools, open, onToggle, className = "" }) {
  return (
    <div className={`pst-strip ${className}`}>
      {tools.map(tool => (
        <button
          key={tool.id}
          type="button"
          onClick={() => onToggle(tool.id)}
          aria-expanded={open === tool.id}
          className={`pst-card ${open === tool.id ? "pst-card-on" : ""}`}
        >
          <span>{tool.label}</span>
          {tool.note && <small>{tool.note}</small>}
        </button>
      ))}
    </div>
  );
}