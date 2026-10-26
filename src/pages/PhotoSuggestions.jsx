import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PhotoSuggestionCard from "@/components/PhotoSuggestionCard";
import PosterPage from "@/components/poster/PosterPage";
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
    <PosterPage icon={ImagePlus} title={t("admin.title")} subtitle={t("admin.subtitle")} back="/">
      <div>
        {loading && (
          <div className="flex items-center justify-center py-16 text-market-ink">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        )}

        {!loading && !isAdmin && (
          <p className="pst-empty border-solid bg-pst-pink/10">{t("admin.noAccess")}</p>
        )}

        {!loading && isAdmin && suggestions.length === 0 && (
          <p className="pst-empty border-solid bg-pst-yellow">{t("admin.none")}</p>
        )}

        {!loading && isAdmin && suggestions.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {suggestions.map(suggestion => (
              <PhotoSuggestionCard key={suggestion.id} suggestion={suggestion} busy={busy === suggestion.id}
                onApprove={row => review(row, "approve")} onReject={row => review(row, "reject")} />
            ))}
          </div>
        )}
      </div>
    </PosterPage>
  );
}