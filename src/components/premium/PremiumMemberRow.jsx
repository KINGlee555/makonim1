import { Check, Copy, Plus, Trash2 } from "lucide-react";

const PLAN_LABEL = { monthly: "חודשי", yearly: "שנתי" };
const btn = "flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:border-primary/40";

function daysLeft(until) {
  if (!until) return 0;
  return Math.ceil((new Date(`${until}T23:59:59`).getTime() - Date.now()) / 86400000);
}

// שורת מנוי פעיל במסך הניהול: מי, עד מתי, כמה שולם ומה אפשר לעשות
export default function PremiumMemberRow({ member, copied, onExtend, onToggle, onRemove, onCopy }) {
  const left = daysLeft(member.paid_until);
  const expired = left < 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{member.user_name || member.user_email}</p>
          <p className="truncate text-sm text-muted-foreground">{member.user_email}</p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {PLAN_LABEL[member.plan] || member.plan}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className={member.active ? "font-medium text-green-700" : "font-medium text-muted-foreground"}>
          {member.active ? "פעיל" : "כבוי"}
        </span>
        <span className={expired ? "font-medium text-red-600" : "text-muted-foreground"}>
          עד {member.paid_until} ({left} ימים)
        </span>
        {member.amount ? <span className="text-muted-foreground">₪{member.amount}</span> : null}
        {member.note ? <span className="truncate text-muted-foreground">{member.note}</span> : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onExtend(member, 30)} className={btn}>
          <Plus className="h-4 w-4" />חודש
        </button>
        <button type="button" onClick={() => onExtend(member, 365)} className={btn}>
          <Plus className="h-4 w-4" />שנה
        </button>
        <button type="button" onClick={() => onCopy(member)} className={btn}>
          {copied === member.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          הודעת תשלום
        </button>
        <button type="button" onClick={() => onToggle(member)} className={btn}>
          {member.active ? "כיבוי" : "הפעלה"}
        </button>
        <button type="button" onClick={() => onRemove(member)} className={`${btn} text-red-600`}>
          <Trash2 className="h-4 w-4" />מחיקה
        </button>
      </div>
    </div>
  );
}