import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ShareDialog({ open, onOpenChange, list }) {
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/join/${list?.share_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ title: "הקישור הועתק!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">שתף את הרשימה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-base font-medium text-foreground mb-2 block">הקישור הייחודי שלך</label>
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

          <div className="bg-muted/50 rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">שתף את הקישור עם משפחה וחברים והם יצטרפו לרשימה אוטומטית!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}