import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import PosterPage from "@/components/poster/PosterPage";
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
      <PosterPage icon={Megaphone} title={t("sponsored.admin")}>
        <p className="pst-empty">{status === "loading" ? t("app.loading") : t("sponsored.adminOnly")}</p>
      </PosterPage>
    );
  }

  return (
    <PosterPage icon={Megaphone} title={t("sponsored.admin")} subtitle={t("sponsored.subtitle")} back="/" backLabel={t("sponsored.back")}>
      <div>
        <section className="pst-panel space-y-3.5">
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
            className="h-12 w-full bg-pst-pink text-[16px] font-black text-white hover:bg-pst-pink hover:text-white"
          >
            {saving ? t("sponsored.saving") : t("sponsored.save")}
          </Button>
        </section>

        <section className="mt-6 space-y-3">
          {slots.length === 0 && (
            <p className="pst-empty">{t("sponsored.empty")}</p>
          )}
          {slots.map(slot => (
            <SponsoredPlacementRow key={slot.id} slot={slot} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </section>
      </div>
    </PosterPage>
  );
}