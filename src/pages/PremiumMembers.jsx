import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PosterPage from "@/components/poster/PosterPage";
// import AppFooter from "../components/AppFooter"; // Included in case you need it
import PremiumMemberRow from "@/components/premium/PremiumMemberRow";
import PremiumLeadRow from "@/components/premium/PremiumLeadRow";
import { Crown, Wallet } from "lucide-react";

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

// Premium members management screen — activate subscriptions here after Bit/Bank transfer payment
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
    // TODO: Fetch premium members and leads from your new backend database
    // Mocking empty arrays for now
    setMembers([]);
    setLeads([]);
  };

  useEffect(() => {
    (async () => {
      try {
        // TODO: Verify if the current user is an admin via your new auth provider
        // Mocking admin as true so you can view and test the UI
        const admin = true;
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
      // TODO: Insert the new premium member into your backend database
      /*
      await newBackend.createPremiumMember({
        user_email: form.user_email.trim().toLowerCase(),
        user_name: form.user_name.trim(),
        plan: form.plan,
        paid_until: addDays(today(), PLANS[form.plan].days),
        amount: Number(form.amount) || PLANS[form.plan].price,
        payment_method: "bit",
        active: true,
        note: form.note.trim(),
      });
      */

      setForm({ user_name: "", user_email: "", plan: form.plan, amount: PLANS[form.plan].price, note: "" });
      await load();
    } catch {
      setError("לא הצלחנו לשמור את המנוי — נסו שוב");
    }
    setBusy(false);
  };

  const handleExtend = async (member, days) => {
    // TODO: Update the member's paid_until date in your backend database
    await load();
  };

  const handleToggle = async (member) => {
    // TODO: Toggle the member's active status in your backend database
    await load();
  };

  const handleRemove = async (member) => {
    // TODO: Delete the member from your backend database
    await load();
  };

  const handleRemoveLead = async (lead) => {
    // TODO: Delete the lead from your backend database
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
        <PosterPage icon={Crown} title="מנויי פרימיום">
          <div className="h-24 border-[3px] border-pst-ink shimmer" />
        </PosterPage>
    );
  }

  if (!isAdmin) {
    return (
        <PosterPage icon={Crown} title="מנויי פרימיום">
          <p className="pst-empty">המסך הזה מיועד לבעל האפליקציה בלבד</p>
        </PosterPage>
    );
  }

  return (
      <PosterPage icon={Crown} title="מנויי פרימיום" subtitle="מפעילים מנוי אחרי תשלום ב-Bit או בהעברה">
        <div>
          <div className="pst-panel flex items-center gap-3">
            <Wallet className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="text-[14px] font-bold text-ui-muted">מנויים פעילים</p>
              <p className="text-[20px] font-black">
                {activeMembers.length} · ₪{revenue.toFixed(0)} שנגבו
              </p>
            </div>
          </div>

          <section className="pst-panel mt-6">
            <h2 className="mb-3 text-[20px] font-black">הוספת מנוי</h2>
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

          <section>
            <h2 className="pst-h2 mt-8">פניות של מחכים לפרימיום ({leads.length})</h2>
            {leads.length === 0 ? (
                <p className="pst-empty">
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
            <h2 className="pst-h2 mt-8">מנויים ({members.length})</h2>
            {members.length === 0 ? (
                <p className="pst-empty">עדיין אין מנויים.</p>
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
        </div>
      </PosterPage>
  );
}