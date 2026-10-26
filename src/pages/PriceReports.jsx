import { useCallback, useEffect, useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PriceReportCard from "@/components/PriceReportCard";
import PosterPage from "@/components/poster/PosterPage";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

// עמוד המנהל: אישור דיווחי "המחיר לא נכון". אישור מעדכן את המחיר בכל הרשימות
// שמוכרות את אותו מוצר, כדי שכולם יראו את המחיר הנכון.
export default function PriceReports() {
  const t = useT();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    const rows = await base44.entities.PriceReport.filter({ status: "pending" }, "-created_date", 60);
    setReports(rows);
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

  const review = async (report, action) => {
    setBusy(report.id);
    try {
      let updated = 0;
      if (action === "approve") {
        const matches = await base44.entities.ListItem.filter(
          report.barcode ? { barcode: report.barcode } : { name: report.item_name }, "-created_date", 200
        );
        const changed = matches.filter(row => Number(row.price) !== Number(report.seen_price));
        if (changed.length) {
          await base44.entities.ListItem.bulkUpdate(
            changed.map(row => ({ id: row.id, price: Number(report.seen_price) }))
          );
        }
        updated = changed.length;
      }
      await base44.entities.PriceReport.update(report.id, {
        status: action === "approve" ? "approved" : "rejected"
      });
      toast({
        title: action === "approve" ? t("adminPrices.approved") : t("adminPrices.rejected"),
        description: action === "approve" ? t("adminPrices.updated", { count: updated }) : undefined
      });
      setReports(prev => prev.filter(row => row.id !== report.id));
    } catch {
      toast({ title: t("adminPrices.failed"), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <PosterPage icon={Flag} title={t("adminPrices.title")} subtitle={t("adminPrices.subtitle")} back="/">
      <div>
        {loading && (
          <div className="flex items-center justify-center py-16 text-market-ink">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        )}

        {!loading && !isAdmin && (
          <p className="pst-empty border-solid bg-[#FF3B5D]/10">{t("admin.noAccess")}</p>
        )}

        {!loading && isAdmin && reports.length === 0 && (
          <p className="pst-empty border-solid bg-[#FFD400]">{t("adminPrices.none")}</p>
        )}

        {!loading && isAdmin && reports.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {reports.map(report => (
              <PriceReportCard key={report.id} report={report} busy={busy === report.id}
                onApprove={row => review(row, "approve")} onReject={row => review(row, "reject")} />
            ))}
          </div>
        )}
      </div>
    </PosterPage>
  );
}