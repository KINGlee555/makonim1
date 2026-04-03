import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, UserPlus, Check, Link2, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ShareDialog({ open, onOpenChange, list, onAddUser, onRemoveUser }) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/join/${list?.share_code}`;
  const canAddMore = (list?.shared_with?.length || 0) < 5;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ title: "הקישור הועתק!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddUser = () => {
    if (!email.trim()) return;
    if (!canAddMore) {
      toast({ title: "ניתן לשתף עד 5 אנשים", variant: "destructive" });
      return;
    }
    onAddUser(email.trim());
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">שיתוף רשימה</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div>
            <label className="text-base font-medium text-foreground mb-2 block">קישור לשיתוף</label>
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

          <div>
            <label className="text-base font-medium text-foreground mb-2 block">
              הוסף לפי אימייל ({list?.shared_with?.length || 0}/5)
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="כתובת אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                className="h-12 rounded-xl"
                dir="ltr"
                disabled={!canAddMore}
              />
              <Button 
                onClick={handleAddUser} 
                className="h-12 w-12 rounded-xl flex-shrink-0"
                disabled={!canAddMore}
              >
                <UserPlus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {list?.shared_with?.length > 0 && (
            <div>
              <label className="text-base font-medium text-foreground mb-2 block">משתתפים</label>
              <div className="space-y-2">
                {list.shared_with.map((userEmail) => (
                  <div key={userEmail} className="flex items-center justify-between bg-muted rounded-xl px-4 py-3">
                    <span className="text-base" dir="ltr">{userEmail}</span>
                    <button
                      onClick={() => onRemoveUser(userEmail)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}