import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users, User as UserIcon } from "lucide-react";
import { useT } from "@/lib/i18n";
import ConnectedUsersDialog from "./ConnectedUsersDialog";

export default function ConnectedUsers({ list }) {
  const t = useT();
  const [userData, setUserData] = useState({});
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!list) return;
    const allEmails = [list.created_by, ...(list.shared_with || [])].filter(Boolean);
    if (allEmails.length === 0) return;
    base44.entities.User.list().then(allUsers => {
      const map = {};
      allUsers.forEach(u => {
        map[u.email] = { name: u.full_name || u.email, photo: u.profile_image_url || "" };
      });
      setUserData(map);
    }).catch(() => {});
  }, [list]);

  const allEmails = [list?.created_by, ...(list?.shared_with || [])].filter(Boolean);
  if (allEmails.length === 0) return null;

  const getLabel = (email) => {
    if (!email || email === "anonymous") return t("users.listOwner");
    return userData[email]?.name || email;
  };
  const getPhoto = (email) => userData[email]?.photo || "";
  const isShared = allEmails.length > 1;

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2.5 bg-card rounded-2xl mb-4 shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          {allEmails.map(email => {
            const photo = getPhoto(email);
            return (
              <span key={email} className="text-xs text-foreground font-medium bg-muted px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5">
                {photo && (
                  <img src={photo} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                {getLabel(email)}
              </span>
            );
          })}
        </div>
        {isShared && (
          <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-1.5 flex-shrink-0 ms-2 bg-green-500/10 hover:bg-green-500/20 transition-colors text-green-600 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft inline-block" />
            {t("users.live")}
          </button>
        )}
      </div>
      <ConnectedUsersDialog open={showDialog} onOpenChange={setShowDialog} list={list} />
    </>
  );
}