// שורת כרטיסי הכלים שנגללת הצידה — לחיצה על כרטיס פותחת את הכלי שמתחתיה.
export default function ToolStrip({ tools, open, onToggle }) {
  return (
    <div className="shf-strip">
      {tools.map(tool => (
        <button
          key={tool.id}
          type="button"
          onClick={() => onToggle(tool.id)}
          aria-expanded={open === tool.id}
          className={`shf-card ${tool.tone || ""} ${open === tool.id ? "shf-card-on" : ""}`}
        >
          <span>{tool.label}</span>
          {tool.note && <small>{tool.note}</small>}
        </button>
      ))}
    </div>
  );
}