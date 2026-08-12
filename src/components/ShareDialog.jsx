import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Mail, Send, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { buildInvitationEmailBody, INVITATION_SUBJECT } from "@/lib/invitationEmail";

export default function ShareDialog({ open, onOpenChange, list, currentUser }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const shareLink = `${window.location.origin}/join/${list?.share_code}`;
  const senderName = currentUser?.full_name || currentUser?.email || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ title: "הקישור הועתק!", duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    const trimmed = email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!emailOk) {
      toast({ title: "כתובת מייל לא תקינה", variant: "destructive", duration: 2500 });
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
      toast({ title: `ההזמנה נשלחה ל-${trimmed} 🎉`, duration: 3000 });
      setEmail("");
    } catch (e) {
      toast({
        title: "שליחת המייל נכשלה",
        description: "ייתכן שהכתובת אינה רשומה באפליקציה. ניתן לשתף קישור במקום.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">שתף את הרשימה</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Email invite */}
          <div>
            <label className="text-base font-medium text-foreground mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              שלח הזמנה במייל
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                dir="ltr"
                placeholder="הקלד/י את המייל של בן/בת הזוג..."
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
                שלח
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              המייל יגיע עם קישור ישיר להצטרפות לרשימה 🎉
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">או</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Link copy */}
          <div>
            <label className="text-base font-medium text-foreground mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              הקישור הייחודי שלך
            </label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="text-sm h-12 rounded-xl"
                dir="ltr"
              />
              <Button
                onClick={handleCopy}
                className="h-12 w-12 rounded-xl flex-shrink-0"
                variant={copied ? "default" : "outline"}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-primary">שתף את הקישור עם משפחה וחברים והם יצטרפו לרשימה אוטומטית!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}