import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import PremiumMemberRow from "@/components/premium/PremiumMemberRow";
import PremiumLeadRow from "@/components/premium/PremiumLeadRow";
import { ArrowRight, Crown, Wallet } from "lucide-react";

const PLANS = {
  monthly: { label: "חודשי", price: 19.9, days: 30 },
  yearly: { label: "שנתי", price: 149, days: 365 },
};

const today = () => new Date().toISOString().slice(0, 10);

function addDays(fromIso, days) {
  const base = fromIso ? new Date(`${fromIso}T12:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

// מסך הניהול של מנויי הפרימיום — כאן מפעילים מנוי אחרי תשלום ב-Bit/העברה
export default function PremiumMembers() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [members, setMembers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ user_name: "", user_email: "", plan: "yearly", amount: PLANS.yearly.price, note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const load = async () => {
    const [mem, lead] = await Promise.all([
      base44.entities.PremiumMember.list("-created_date", 100),
      base44.entities.PremiumInterest.list("-created_date", 50),
    ]);
    setMembers(mem || []);
    setLeads(lead || []);
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const admin = me?.role === "admin";
        setIsAdmin(admin);
        if (admin) await load();
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);

  const setPlan = (plan) => setForm(f => ({ ...f, plan, amount: PLANS[plan].price }));

  const handleSave = async () => {
    if (!form.user_email.trim()) {
      setError("צריך למלא מייל של המנוי");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await base44.entities.PremiumMember.create({
        user_email: form.user_email.trim().toLowerCase(),
        user_name: form.user_name.trim(),
        plan: form.plan,
        paid_until: addDays(today(), PLANS[form.plan].days),
        amount: Number(form.amount) || PLANS[form.plan].price,
        payment_method: "bit",
        active: true,
        note: form.note.trim(),
      });
      setForm({ user_name: "", user_email: "", plan: form.plan, amount: PLANS[form.plan].price, note: "" });
      await load();
    } catch {
      setError("לא הצלחנו לשמור את המנוי — נסו שוב");
    }
    setBusy(false);
  };

  const handleExtend = async (member, days) => {
    await base44.entities.PremiumMember.update(member.id, { paid_until: addDays(member.paid_until, days), active: true }).catch(() => {});
    await load();
  };

  const handleToggle = async (member) => {
    await base44.entities.PremiumMember.update(member.id, { active: !member.active }).catch(() => {});
    await load();
  };

  const handleRemove = async (member) => {
    await base44.entities.PremiumMember.delete(member.id).catch(() => {});
    await load();
  };

  const handleRemoveLead = async (lead) => {
    await base44.entities.PremiumInterest.delete(lead.id).catch(() => {});
    await load();
  };

  const handleUseLead = (lead) => {
    setPlan(lead.plan === "monthly" || lead.plan === "yearly" ? lead.plan : "yearly");
    setForm(f => ({ ...f, user_name: lead.user_name || "", user_email: lead.email || "", note: lead.note || "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopy = async (member) => {
    const plan = PLANS[member.plan] || PLANS.monthly;
    const text = `היי${member.user_name ? ` ${member.user_name}` : ""}! המנוי הפרימיום ב-MaKonim מוכן: מסלול ${plan.label}, ₪${member.amount || plan.price}, בתוקף עד ${member.paid_until}. אפשר לשלם ב-Bit או בהעברה, ואני מפעיל את המנוי מיד.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(member.id);
      setTimeout(() => setCopied(""), 2000);
    } catch {}
  };

  const activeMembers = members.filter(m => m.active);
  const revenue = activeMembers.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="responsive-container mx-auto px-4 py-6">
          <div className="h-24 rounded-3xl bg-muted shimmer" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader
          rightAction={
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate("/")}>
              <ArrowRight className="w-5 h-5" />
            </Button>
          }
        />
        <main className="responsive-container mx-auto px-4 py-10 text-center">
          <p className="text-lg font-semibold text-foreground">המסך הזה מיועד לבעל האפליקציה בלבד</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        rightAction={
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate("/")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
        }
      />
      <main className="responsive-container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">מנויי פרימיום</h1>
            <p className="text-muted-foreground">מפעילים מנוי אחרי תשלום ב-Bit או בהעברה</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-3xl border border-primary/15 bg-card p-5">
          <Wallet className="h-6 w-6 flex-shrink-0 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">מנויים פעילים</p>
            <p className="text-xl font-bold text-foreground">
              {activeMembers.length} · ₪{revenue.toFixed(0)} שנגבו
            </p>
          </div>
        </div>

        <section className="mb-7 rounded-3xl border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold text-foreground">הוספת מנוי</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="שם המנוי" value={form.user_name} onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))} />
            <Input placeholder="מייל המנוי" value={form.user_email} onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(PLANS).map(([id, plan]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPlan(id)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  form.plan === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                }`}
              >
                {plan.label} · ₪{plan.price}
              </button>
            ))}
            <Input
              type="number"
              className="w-28"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <Input
            className="mt-3"
            placeholder="הערה פנימית (לא חובה)"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          />
          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
          <Button onClick={handleSave} disabled={busy} className="mt-4 h-11 w-full rounded-2xl text-base sm:w-auto sm:px-8">
            {busy ? "שומר..." : "הוספת מנוי"}
          </Button>
        </section>

        <section className="mb-7">
          <h2 className="mb-3 text-lg font-semibold text-foreground">פניות של מחכים לפרימיום ({leads.length})</h2>
          {leads.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              עדיין אין פניות. כל מי שלוחץ "אני רוצה פרימיום" באפליקציה יופיע כאן.
            </p>
          ) : (
            <div className="space-y-2">
              {leads.map(lead => (
                <PremiumLeadRow key={lead.id} lead={lead} onUse={handleUseLead} onRemove={handleRemoveLead} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">מנויים ({members.length})</h2>
          {members.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">עדיין אין מנויים.</p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <PremiumMemberRow
                  key={member.id}
                  member={member}
                  copied={copied}
                  onExtend={handleExtend}
                  onToggle={handleToggle}
                  onRemove={handleRemove}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          )}
        </section>

        <AppFooter />
      </main>
    </div>
  );
}