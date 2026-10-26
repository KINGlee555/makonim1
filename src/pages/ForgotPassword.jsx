import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useT } from "@/lib/i18n";

export default function ForgotPassword() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with your new backend's password reset logic
      // Simulating a network request for now
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    catch {}
    finally { setLoading(false); setSent(true); }
  };

  return (
      <AuthLayout
          icon={Mail} title={t("auth.forgot.title")} subtitle={t("auth.forgot.subtitle")}
          footer={<Link to="/login" className="text-primary font-medium hover:underline"><ArrowLeft className="w-3 h-3 inline mr-1" />{t("auth.forgot.back")}</Link>}
      >
        {sent ? (
            <p className="text-sm text-foreground text-center">{t("auth.forgot.success")}</p>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.forgot.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl border-primary/15 bg-secondary/20" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("auth.forgot.loading")}</>) : t("auth.forgot.submit")}
              </Button>
            </form>
        )}
      </AuthLayout>
  );
}