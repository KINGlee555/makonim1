import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Send, QrCode } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

// קוד הצטרפות אחד לכל רשימה — סורקים מהטלפון של השני ומצטרפים מיד
export default function JoinQrDialog({ open, onOpenChange, list }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/join/${list?.share_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: t("share.linkCopied"), duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  // שיתוף מהיר דרך הטלפון עצמו, ואם אין — מעתיקים את הקישור
  const handleSend = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: list?.title || t("app.name"), url: link });
      } catch {
        // המשתמש סגר את חלון השיתוף
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <QrCode className="h-5 w-5 text-primary" strokeWidth={2} />
            {t("share.qrTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 pt-1">
          <p className="max-w-full truncate text-base font-medium text-foreground">{list?.title}</p>

          <div className="rounded-3xl border border-primary/20 bg-white p-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(link)}`}
              alt={t("share.qrAlt")}
              width={220}
              height={220}
              className="h-[220px] w-[220px]"
            />
          </div>

          <p className="text-center text-sm text-muted-foreground">{t("share.qrScanHint")}</p>

          <p dir="ltr" className="rounded-xl bg-secondary px-4 py-1.5 text-center text-sm font-semibold tracking-widest text-secondary-foreground">
            {list?.share_code}
          </p>

          <div className="flex w-full gap-2 pt-1">
            <Button onClick={handleCopy} variant={copied ? "default" : "outline"} className="h-12 flex-1 gap-2 rounded-xl">
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {t("share.copy")}
            </Button>
            <Button onClick={handleSend} className="h-12 flex-1 gap-2 rounded-xl">
              <Send className="h-5 w-5" />
              {t("share.qrSend")}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">{t("share.qrAccountHint")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}