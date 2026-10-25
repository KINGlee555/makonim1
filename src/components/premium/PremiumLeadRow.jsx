import { UserPlus, Trash2 } from "lucide-react";

const PLAN_LABEL = { monthly: "חודשי", yearly: "שנתי", unsure: "לא בטוח" };

// פנייה של משתמש שביקש פרימיום — מועמדת להפוך למנוי
export default function PremiumLeadRow({ lead, onUse, onRemove }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{lead.user_name || lead.email || "ללא שם"}</p>
        <p className="truncate text-sm text-muted-foreground">
          {lead.email || "ללא מייל"} · {PLAN_LABEL[lead.plan] || lead.plan}
          {lead.note ? ` · ${lead.note}` : ""}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {lead.created_date ? new Date(lead.created_date).toLocaleDateString("he-IL") : ""}
        </p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <button
          type="button"
          onClick={() => onUse(lead)}
          className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
        >
          <UserPlus className="h-4 w-4" />הפעלה כמנוי
        </button>
        <button
          type="button"
          onClick={() => onRemove(lead)}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-red-600"
        >
          <Trash2 className="h-4 w-4" />מחיקה
        </button>
      </div>
    </div>
  );
}