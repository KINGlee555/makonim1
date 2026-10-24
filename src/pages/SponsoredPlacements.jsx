import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import AppFooter from "../components/AppFooter";
import SponsoredPlacementRow from "../components/sponsored/SponsoredPlacementRow";
import { useT } from "@/lib/i18n";

export default function SponsoredPlacements() {
  const t = useT();
  const [status, setStatus] = useState("loading");
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ chain_name: "", headline: "", body: "", url: "" });
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.SponsoredPlacement.filter({}, "-created_date", 50)
    .then(rows => setSlots(Array.isArray(rows) ? rows : rows.items || []))
    .catch(() => {});

  useEffect(() => {
    base44.auth.me()
      .then(me => {
        if (me?.role === "admin") {
          setStatus("ready");
          load();
        } else {
          setStatus("denied");
        }
      })
      .catch(() => setStatus("denied"));
  }, []);

  const handleAdd = async () => {
    const chain = form.chain_name.trim();
    const headline = form.headline.trim();
    const rawUrl = form.url.trim();
    if (!chain || !headline || !rawUrl) {
      toast({ title: t("sponsored.invalid"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const created = await base44.entities.SponsoredPlacement.create({
        chain_name: chain,
        headline,
        body: form.body.trim(),
        url: /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`,
        active: true,
        priority: 0
      });
      setSlots(prev => [created, ...prev]);
      setForm({ chain_name: "", headline: "", body: "", url: "" });
    } catch {
      toast({ title: t("sponsored.error"), variant: "destructive" });
    }
    setSaving(false);
  };

  const handleToggle = async (slot) => {
    const active = !slot.active;
    setSlots(prev => prev.map(s => (s.id === slot.id ? { ...s, active } : s)));
    await base44.entities.SponsoredPlacement.update(slot.id, { active }).catch(() => {});
  };

  const handleDelete = async (slot) => {
    setSlots(prev => prev.filter(s => s.id !== slot.id));
    await base44.entities.SponsoredPlacement.delete(slot.id).catch(() => {});
  };

  if (status !== "ready") {
    return (
      <div className="market-page min-h-screen bg-market-surface p-8 text-center text-[17px] font-black text-market-ink">
        {status === "loading" ? t("app.loading") : t("sponsored.adminOnly")}
      </div>
    );
  }

  return (
    <div className="market-page min-h-screen bg-market-surface pb-16">
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl md:px-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[15px] font-black text-market-blue no-underline">
          <ArrowRight className="h-4 w-4" />
          {t("sponsored.back")}
        </Link>

        <h1 className="mt-3 text-[28px] font-black leading-tight tracking-[-1px] text-market-ink">{t("sponsored.admin")}</h1>
        <p className="mt-1 text-[15px] font-bold text-market-ink/70">{t("sponsored.subtitle")}</p>

        <section className="mt-5 space-y-3.5 rounded-[30px] border-[3px] border-market-ink bg-market-surface p-5">
          <div>
            <Label className="text-[14px] font-black text-market-ink">{t("sponsored.chain")}</Label>
            <Input value={form.chain_name} onChange={e => setForm(f => ({ ...f, chain_name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-[14px] font-black text-market-ink">{t("sponsored.headline")}</Label>
            <Input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} />
          </div>
          <div>
            <Label className="text-[14px] font-black text-market-ink">{t("sponsored.body")}</Label>
            <Input value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
          </div>
          <div>
            <Label className="text-[14px] font-black text-market-ink">{t("sponsored.url")}</Label>
            <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="www.example.co.il" />
          </div>
          <Button
            onClick={handleAdd}
            disabled={saving}
            className="h-12 w-full rounded-[24px] bg-market-pink text-[16px] font-black text-white hover:bg-market-pink hover:text-white"
          >
            {saving ? t("sponsored.saving") : t("sponsored.save")}
          </Button>
        </section>

        <section className="mt-6 space-y-3">
          {slots.length === 0 && (
            <p className="text-center text-[15px] font-bold text-market-ink/60">{t("sponsored.empty")}</p>
          )}
          {slots.map(slot => (
            <SponsoredPlacementRow key={slot.id} slot={slot} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </section>

        <AppFooter />
      </main>
    </div>
  );
}