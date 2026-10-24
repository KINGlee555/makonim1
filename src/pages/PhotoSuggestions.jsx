import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImagePlus, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PhotoSuggestionCard from "@/components/PhotoSuggestionCard";
import AppFooter from "@/components/AppFooter";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

// עמוד המנהל: אישור או דחייה של תמונות שהמשתמשים הציעו למוצרים.
export default function PhotoSuggestions() {
  const t = useT();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    const rows = await base44.entities.ImageSuggestion.filter({ status: "pending" }, "-created_date", 60);
    setSuggestions(rows);
  }, []);

  useEffect(() => {
    let active = true;
    base44.auth.me()
      .then(me => {
        if (!active) return;
        setUser(me);
        if (me?.role === "admin") return load();
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);

  const review = async (suggestion, action) => {
    setBusy(suggestion.id);
    try {
      const response = await base44.functions.invoke("reviewPhotoSuggestion", { id: suggestion.id, action });
      const updated = response.data?.updated;
      toast({
        title: action === "approve" ? t("admin.approved") : t("admin.rejected"),
        description: action === "approve" && updated ? t("admin.updated", { count: updated.items }) : undefined
      });
      setSuggestions(prev => prev.filter(row => row.id !== suggestion.id));
    } catch {
      toast({ title: t("admin.failed"), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="market-page min-h-screen bg-market-surface pb-16">
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl md:px-10">
        <div className="mb-5 flex items-center gap-3">
          <Link to="/" aria-label={t("admin.back")}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-[3px] border-market-ink bg-market-yellow text-market-ink">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-[24px] font-black leading-tight text-market-ink">
              <ImagePlus className="h-6 w-6 text-market-pink" />{t("admin.title")}
            </h1>
            <p className="text-sm font-bold text-muted-foreground">{t("admin.subtitle")}</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-market-ink">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        )}

        {!loading && !isAdmin && (
          <p className="rounded-3xl border-[3px] border-market-ink bg-market-pink-soft px-5 py-6 text-center text-[17px] font-black text-market-ink">
            {t("admin.noAccess")}
          </p>
        )}

        {!loading && isAdmin && suggestions.length === 0 && (
          <p className="rounded-3xl border-[3px] border-market-ink bg-market-yellow-soft px-5 py-8 text-center text-[18px] font-black text-market-ink">
            {t("admin.none")}
          </p>
        )}

        {!loading && isAdmin && suggestions.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {suggestions.map(suggestion => (
              <PhotoSuggestionCard key={suggestion.id} suggestion={suggestion} busy={busy === suggestion.id}
                onApprove={row => review(row, "approve")} onReject={row => review(row, "reject")} />
            ))}
          </div>
        )}

        <AppFooter />
      </main>
    </div>
  );
}