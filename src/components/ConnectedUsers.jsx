import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users, User as UserIcon, Phone } from "lucide-react";
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
  const phones = list?.invited_phones || [];
  if (allEmails.length === 0 && phones.length === 0) return null;

  const getLabel = (email) => {
    if (!email || email === "anonymous") return t("users.listOwner");
    return userData[email]?.name || email;
  };
  const getPhoto = (email) => userData[email]?.photo || "";
  const isShared = allEmails.length + phones.length > 1;

  return (
    <>
      <section className="mb-4 animate-fade-in">
        <h2 className="mb-2 text-lg font-bold text-foreground">{t("users.connected")}</h2>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-transparent px-1 py-1">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          {allEmails.map(email => {
            const photo = getPhoto(email);
            return (
              <span key={email} className="text-xs text-foreground font-medium bg-card px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5 shadow-sm">
                {photo && (
                  <img src={photo} alt="" className="w-4 h-4 rounded-full object-cover" />
                )}
                {getLabel(email)}
              </span>
            );
          })}
          {phones.map(phone => (
            <span key={phone} className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-card px-2 py-1 text-xs font-medium text-foreground shadow-sm">
              <Phone className="h-3 w-3 text-primary" />
              {phone}
            </span>
          ))}
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
      </section>
      <ConnectedUsersDialog open={showDialog} onOpenChange={setShowDialog} list={list} />
    </>
  );
}