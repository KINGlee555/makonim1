import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const HEARTBEAT_MS = 30000;
const ONLINE_MS = 2 * 60 * 1000;

// נוכחות ברשימה: כל מי שפותח את הרשימה מסמן "אני כאן" כל חצי דקה,
// ומי שסימן לאחרונה נחשב מחובר עכשיו — בלי תלות במצב קנייה ובלי ניחושים.
export function isHere(member) {
  if (!member?.last_seen) return false;
  return Date.now() - new Date(member.last_seen).getTime() < ONLINE_MS;
}

export function useListPresence(listId, user) {
  const [members, setMembers] = useState([]);
  const email = user?.email || "";
  const name = user?.full_name || "";

  useEffect(() => {
    if (!listId || !email) return;
    let cancelled = false;

    const read = () => base44.entities.ListPresence.filter({ list_id: listId }, "-last_seen", 20)
      .then(list => { if (!cancelled) setMembers(list); })
      .catch(() => {});

    const beat = async () => {
      const stamp = new Date().toISOString();
      try {
        const mine = await base44.entities.ListPresence.filter({ list_id: listId, user_email: email }, "-created_date", 1);
        if (mine.length) await base44.entities.ListPresence.update(mine[0].id, { last_seen: stamp, user_name: name });
        else await base44.entities.ListPresence.create({ list_id: listId, user_email: email, user_name: name, last_seen: stamp });
      } catch { /* נוכחות לא חייבת לעצור את הרשימה */ }
      read();
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [listId, email, name]);

  return { members, online: members.filter(isHere) };
}