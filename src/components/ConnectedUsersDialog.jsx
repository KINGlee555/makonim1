import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Copy, Check, Crown, Radio, User as UserIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

export default function ConnectedUsersDialog({ open, onOpenChange, list }) {
  const t = useT();
  const [userData, setUserData] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !list) return;
    const allEmails = [list.created_by, ...(list.shared_with || [])].filter(Boolean);
    if (allEmails.length === 0) return;
    base44.entities.User.list().then(allUsers => {
      const map = {};
      allUsers.forEach(u => {
        map[u.email] = { name: u.full_name || u.email, photo: u.profile_image_url || "" };
      });
      setUserData(map);
    }).catch(() => {});
  }, [open, list]);

  const allEmails = [list?.created_by, ...(list?.shared_with || [])].filter(Boolean);
  const getLabel = (email) => {
    if (!email || email === "anonymous") return t("users.listOwner");
    return userData[email]?.name || email;
  };
  const getPhoto = (email) => userData[email]?.photo || "";
  const shareUrl = list ? `${window.location.origin}/join/${list.share_code}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast({ title: t("share.linkCopied"), duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Proximity share — AirDrop on iOS, Nearby Share on Android
  const handleProximityShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list?.title || t("app.name"),
          text: t("share.shareNote"),
          url: shareUrl,
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
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
              {allEmails.map(email => {
                const photo = getPhoto(email);
                return (
                  <div key={email} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {photo ? (
                        <img src={photo} alt={getLabel(email)} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-primary" />
                      )}
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
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">{t("users.inviteFamily")}</p>
            {/* Proximity share button */}
            <button
              onClick={handleProximityShare}
              className="mx-auto mb-2 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-3 text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-center text-sm font-bold">{t("share.proximity")}</span>
            </button>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="min-w-0 truncate rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                {shareUrl}
              </div>
              <Button onClick={handleCopyLink} className="h-10 flex-shrink-0 rounded-xl px-3 text-xs">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? t("share.copied") : t("share.copy")}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("users.inviteDesc")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}