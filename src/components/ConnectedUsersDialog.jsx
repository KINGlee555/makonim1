import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Copy, Check, Crown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

export default function ConnectedUsersDialog({ open, onOpenChange, list }) {
  const t = useT();
  const [userNames, setUserNames] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !list) return;
    const allEmails = [list.created_by, ...(list.shared_with || [])].filter(Boolean);
    if (allEmails.length === 0) return;
    base44.entities.User.list().then(allUsers => {
      const map = {};
      allUsers.forEach(u => { map[u.email] = u.full_name || u.email; });
      setUserNames(map);
    }).catch(() => {});
  }, [open, list]);

  const allEmails = [list?.created_by, ...(list?.shared_with || [])].filter(Boolean);
  const getLabel = (email) => {
    const name = userNames[email] || email;
    if (!name || name === "anonymous") return t("users.noName");
    return name;
  };
  const shareUrl = list ? `${window.location.origin}/join/${list.share_code}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast({ title: t("share.linkCopied"), duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start">{t("users.dialogTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">{t("users.members")}</p>
            <div className="space-y-2">
              {allEmails.map(email => (
                <div key={email} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{getLabel(email)}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>
                  {email === list?.created_by && (
                    <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full flex-shrink-0">
                      <Crown className="w-3 h-3" />
                      {t("users.owner")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">{t("users.inviteFamily")}</p>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 px-3 py-2.5 bg-muted rounded-xl text-sm text-muted-foreground truncate">
                {shareUrl}
              </div>
              <Button onClick={handleCopyLink} className="rounded-xl flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t("share.copied") : t("share.copy")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("users.inviteDesc")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}