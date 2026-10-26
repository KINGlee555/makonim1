import { useEffect, useState } from "react";

const HEARTBEAT_MS = 30000;
const ONLINE_MS = 2 * 60 * 1000; // 2 minutes

// List presence: anyone who opens the list marks "I am here" every half minute,
// and whoever pinged recently is considered connected now — regardless of shopping mode and without guessing.
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

    const read = async () => {
      try {
        // TODO: Fetch presence records for this listId from your new backend
        // Mocking an empty list of members for now
        const list = [];
        if (!cancelled) setMembers(list);
      } catch {
        // Ignore errors
      }
    };

    const beat = async () => {
      const stamp = new Date().toISOString();
      try {
        // TODO: Implement presence heartbeat in your new backend (upsert record)
        // Example: await newBackend.upsertPresence({ list_id: listId, user_email: email, user_name: name, last_seen: stamp });

        // Simulating network delay for now
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch {
        /* Presence shouldn't block the list */
      }
      read();
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [listId, email, name]);

  return { members, online: members.filter(isHere) };
}