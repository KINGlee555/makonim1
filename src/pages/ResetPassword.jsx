import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useT } from "@/lib/i18n";

export default function ResetPassword() {
  const t = useT();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError(t("auth.reset.passwordMismatch")); return; }
    setLoading(true);
    try { await base44.auth.resetPassword({ resetToken, newPassword }); window.location.href = "/login"; }
    catch (err) { setError(err.message || t("auth.reset.failed")); }
    finally { setLoading(false); }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle} title={t("auth.reset.invalidLink")} subtitle={t("auth.reset.invalidLinkDesc")}
        footer={<Link to="/forgot-password" className="text-primary font-medium hover:underline">{t("auth.reset.requestNew")}</Link>}
      >
        <p className="text-sm text-foreground text-center">{t("auth.reset.incomplete")}</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Lock} title={t("auth.reset.title")} subtitle={t("auth.reset.subtitle")}>
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.reset.newPassword")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="new-password" autoFocus placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 h-12 rounded-xl border-primary/15 bg-secondary/20" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t("auth.reset.confirmPassword")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12 rounded-xl border-primary/15 bg-secondary/20" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20" disabled={loading}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("auth.reset.loading")}</>) : t("auth.reset.submit")}
        </Button>
      </form>
    </AuthLayout>
  );
}