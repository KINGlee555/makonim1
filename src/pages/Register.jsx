import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useT } from "@/lib/i18n";

export default function Register() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // TODO: Replace with your new backend's registration logic
      // Simulating a network request for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOtp(true);
    }
    catch (err) { setError(err.message || t("auth.register.failed")); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setError(""); setLoading(true);
    try {
      // TODO: Replace with your new backend's OTP verification logic
      // Simulating a network request for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      window.location.href = safeReturnTo();
    } catch (err) { setError(err.message || t("auth.register.invalidCode")); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError("");
    try {
      // TODO: Replace with your new backend's OTP resend logic
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({ title: t("auth.register.codeSent"), description: t("auth.register.codeSentDesc") });
    } catch (err) { setError(err.message || t("auth.register.resendFailed")); }
  };

  if (showOtp) {
    return (
        <AuthLayout icon={Mail} title={t("auth.register.verifyTitle")} subtitle={t("auth.register.verifySubtitle", { email })}>
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <div className="flex justify-center mb-6">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("auth.register.verifying")}</>) : t("auth.register.verify")}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t("auth.register.noCode")}{" "}
            <button onClick={handleResend} className="text-primary font-medium hover:underline">{t("auth.register.resend")}</button>
          </p>
        </AuthLayout>
    );
  }

  return (
      <AuthLayout
          icon={UserPlus} title={t("auth.register.title")} subtitle={t("auth.register.subtitle")}
          footer={
            <>
              {t("auth.register.haveAccount")}{" "}
              <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="text-primary font-medium hover:underline">
                {t("auth.register.login")}
              </Link>
            </>
          }
      >
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.register.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl border-primary/15 bg-secondary/20" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.register.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12 rounded-xl border-primary/15 bg-secondary/20" required />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("auth.register.loading")}</>) : t("auth.register.submit")}
          </Button>
        </form>
      </AuthLayout>
  );
}