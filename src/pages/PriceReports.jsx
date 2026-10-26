import { useCallback, useEffect, useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import PriceReportCard from "@/components/PriceReportCard";
import PosterPage from "@/components/poster/PosterPage";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

// Admin page: Approving "wrong price" reports. Approval updates the price in all lists
// selling the same product, so everyone sees the correct price.
export default function PriceReports() {
  const t = useT();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    // TODO: Fetch pending price reports from your new backend database
    // Mocking an empty array for now
    setReports([]);
  }, []);

  useEffect(() => {
    let active = true;

    // TODO: Verify if the current user is an admin via your new auth provider
    // Mocking admin role for development purposes
    const mockUser = { role: "admin" };

    if (active) {
      setUser(mockUser);
      if (mockUser?.role === "admin") {
        load().finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }

    return () => { active = false; };
  }, [load]);

  const review = async (report, action) => {
    setBusy(report.id);
    try {
      let updated = 0;

      // TODO: Implement price update logic and report status update in your new backend
      // Simulating network request for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === "approve") {
        // Mocking updated count
        updated = 1;
      }

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
              <p className="pst-empty border-solid bg-pst-pink/10">{t("admin.noAccess")}</p>
          )}

          {!loading && isAdmin && reports.length === 0 && (
              <p className="pst-empty border-solid bg-pst-yellow">{t("adminPrices.none")}</p>
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