import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Mail, Send, Loader2, Link as LinkIcon, MessageCircle, Radio } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { buildInvitationEmailBody, INVITATION_SUBJECT } from "@/lib/invitationEmail";
import JoinQrCode from "@/components/JoinQrCode";
import { useT } from "@/lib/i18n";

export default function ShareDialog({ open, onOpenChange, list, currentUser, itemCount = 0 }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState("");

  const shareLink = `${window.location.origin}/join/${list?.share_code}`;
  const senderName = currentUser?.full_name || currentUser?.email || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ title: t("share.linkCopied"), duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  // הודעת שיתוף עם שם הרשימה ומספר המוצרים שמחכים — קישור שמזמין להצטרף
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    itemCount > 0
      ? t("share.whatsappText", { title: list?.title || t("app.name"), count: itemCount, link: shareLink })
      : t("share.whatsappTextEmpty", { title: list?.title || t("app.name"), link: shareLink })
  )}`;

  // Proximity share — uses Web Share API (AirDrop on iOS, Nearby Share on Android)
  const handleProximityShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list?.title || t("app.name"),
          text: t("share.shareNote"),
          url: shareLink,
        });
      } catch (e) {
        // User cancelled — silently ignore
      }
    } else {
      // Fallback: copy link
      handleCopy();
      toast({ title: t("share.proximityUnsupported"), duration: 3000 });
    }
  };

  const handleSendInvite = async () => {
    const trimmed = email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!emailOk) {
      toast({ title: t("share.invalidEmail"), variant: "destructive", duration: 2500 });
      return;
    }
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: trimmed,
        subject: INVITATION_SUBJECT,
        body: buildInvitationEmailBody({ shareLink, senderName, listTitle: list?.title }),
        from_name: "מה קונים?",
      });
      toast({ title: t("share.inviteSent", { email: trimmed }), duration: 3000 });
      setEmail("");
    } catch (e) {
      toast({
        title: t("share.emailFailed"),
        description: t("share.emailFailedDesc"),
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setSending(false);
    }
  };

  // הזמנה למספר טלפון: המספר נשמר ברשימה ונפתחת שיחת וואטסאפ עם קישור ההצטרפות
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneLocal = phoneDigits.startsWith("972") ? `0${phoneDigits.slice(3)}` : phoneDigits;
  const phoneOk = phoneLocal.length >= 9 && phoneLocal.length <= 11;
  const waNumber = phoneDigits.startsWith("972")
    ? phoneDigits
    : phoneDigits.startsWith("0")
      ? `972${phoneDigits.slice(1)}`
      : phoneDigits;
  const inviteText = itemCount > 0
    ? t("share.whatsappText", { title: list?.title || t("app.name"), count: itemCount, link: shareLink })
    : t("share.whatsappTextEmpty", { title: list?.title || t("app.name"), link: shareLink });

  const handlePhoneInvite = async () => {
    if (!phoneOk) {
      toast({ title: t("share.phoneInvalid"), variant: "destructive", duration: 2500 });
      return;
    }
    try {
      const phones = Array.from(new Set([...(list?.invited_phones || []), phoneLocal]));
      await base44.entities.ShoppingList.update(list.id, { invited_phones: phones });
      toast({ title: t("share.phoneSaved"), duration: 2500 });
      setPhone("");
    } catch {
      toast({ title: t("share.emailFailed"), variant: "destructive", duration: 3000 });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-start">{t("share.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Proximity Share — AirDrop / Nearby Share */}
          <button
            onClick={handleProximityShare}
            className="mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div className="text-start flex-1 min-w-0">
              <p className="font-bold text-base">{t("share.proximity")}</p>
              <p className="text-sm text-primary-foreground/80">{t("share.proximityDesc")}</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t("share.or")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div>
            <label className="text-base font-medium text-foreground mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              {t("share.sendEmail")}
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                dir="ltr"
                placeholder={t("share.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !sending && handleSendInvite()}
                className="text-sm h-12 rounded-xl"
              />
              <Button
                onClick={handleSendInvite}
                disabled={sending || !email.trim()}
                className="h-12 rounded-xl flex-shrink-0 gap-1"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {t("share.send")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("share.emailNote")}</p>
          </div>

          <div>
            <label className="text-base font-medium text-foreground mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              {t("share.phoneTitle")}
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                inputMode="tel"
                dir="ltr"
                placeholder={t("share.phonePlaceholder")}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground"
              />
              <a
                href={phoneOk ? `https://wa.me/${waNumber}?text=${encodeURIComponent(inviteText)}` : undefined}
                target="_blank"
                rel="noreferrer"
                onClick={handlePhoneInvite}
                className={`flex h-12 flex-shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-bold no-underline transition-opacity ${phoneOk ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <MessageCircle className="h-4 w-4" />
                {t("share.phoneSend")}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t("share.or")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div>
            <label className="text-base font-medium text-foreground mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              {t("share.yourLink")}
            </label>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="text-sm h-12 rounded-xl" dir="ltr" />
              <Button
                onClick={handleCopy}
                className="h-12 w-12 rounded-xl flex-shrink-0"
                variant={copied ? "default" : "outline"}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
              <Button asChild className="h-12 w-12 rounded-xl flex-shrink-0" variant="outline" title={t("share.whatsapp")}>
                <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label={t("share.whatsapp")}>
                  <MessageCircle className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          <JoinQrCode url={shareLink} />

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-primary">{t("share.shareNote")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}