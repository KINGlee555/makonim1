import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users } from "lucide-react";

export default function ConnectedUsers({ list }) {
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    if (!list) return;
    const allEmails = [list.created_by, ...(list.shared_with || [])].filter(Boolean);
    if (allEmails.length === 0) return;
    base44.entities.User.list().then(allUsers => {
      const map = {};
      allUsers.forEach(u => { map[u.email] = u.full_name || u.email.split("@")[0]; });
      setUserNames(map);
    }).catch(() => {});
  }, [list]);

  const allEmails = [list?.created_by, ...(list?.shared_with || [])].filter(Boolean);
  if (allEmails.length === 0) return null;

  const getLabel = (email) => userNames[email] || email.split("@")[0];
  const isShared = allEmails.length > 1;

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-primary/5 rounded-2xl mb-4" dir="rtl">
      <div className="flex items-center gap-2 flex-wrap flex-1">
        <Users className="w-4 h-4 text-primary flex-shrink-0" />
        {allEmails.map(email => (
          <span key={email} className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
            {getLabel(email)}
          </span>
        ))}
      </div>
      {isShared && (
        <div className="flex items-center gap-1.5 flex-shrink-0 mr-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
          LIVE
        </div>
      )}
    </div>
  );
}