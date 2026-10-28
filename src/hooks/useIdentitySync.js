import { useEffect, useState } from "react";
import { attachToList, approveJoin } from "@/lib/memberIdentity";
import { loadLocalName } from "@/lib/userName";

// דואג לכך שלכל שם תהיה רשימה אחת קבועה. כשהשם כבר משויך לרשימה אחרת,
// מחזיר conflict — והמסך מציג בקשת אישור לפני שהשם מתווסף לרשימה נוספת.
export default function useIdentitySync(list, user) {
  const [conflict, setConflict] = useState(null);
  const listId = list?.id;
  const listTitle = list?.title || "";
  const name = user?.full_name || loadLocalName();
  const email = user?.email || "";

  useEffect(() => {
    if (!listId || !name) return;
    let cancelled = false;
    attachToList({ name, email, listId, listTitle })
      .then(result => { if (!cancelled) setConflict(result.conflict || null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [listId, listTitle, name, email]);

  const approve = async () => {
    if (!conflict) return;
    await approveJoin(conflict, listId);
    setConflict(null);
  };

  return { conflict, approve, dismiss: () => setConflict(null) };
}