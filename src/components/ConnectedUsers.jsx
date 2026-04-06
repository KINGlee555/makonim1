import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users } from "lucide-react";

export default function ConnectedUsers({ list }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!list) return;
    loadUsers();
  }, [list]);

  const loadUsers = async () => {
    const allEmails = [list.created_by, ...(list.shared_with || [])].filter(Boolean);
    if (allEmails.length === 0) return;
    try {
      const allUsers = await base44.entities.User.list();
      const relevant = allUsers.filter(u => allEmails.includes(u.email));
      setUsers(relevant);
    } catch {}
  };

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/10 overflow-x-auto" dir="rtl">
      <Users className="w-4 h-4 text-primary flex-shrink-0" />
      <div className="flex gap-2 flex-wrap">
        {users.map(u => (
          <span key={u.email} className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
            {u.full_name || u.email.split("@")[0]} מחובר/ת
          </span>
        ))}
      </div>
    </div>
  );
}