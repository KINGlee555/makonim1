import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// הודעות המשתתפים ברשימה: נטענות פעם אחת, ומתעדכנות מיד עם כל הודעה חדשה —
// בלי לרענן ובלי לשאול את השרת כל כמה שניות.
export function useListMessages(listId, user) {
  const [messages, setMessages] = useState([]);
  const email = user?.email || "";
  const name = user?.full_name || email.split("@")[0] || "";

  useEffect(() => {
    if (!listId) return;
    let cancelled = false;
    const read = () => base44.entities.ListMessage.filter({ list_id: listId }, "-created_date", 60)
      .then(rows => { if (!cancelled) setMessages([...rows].reverse()); })
      .catch(() => {});
    read();
    const unsubscribe = base44.entities.ListMessage.subscribe(() => read());
    return () => { cancelled = true; unsubscribe?.(); };
  }, [listId]);

  const sendMessage = useCallback(async (text, kind = "message") => {
    const body = String(text || "").trim();
    if (!body || !listId) return;
    await base44.entities.ListMessage.create({
      list_id: listId,
      text: body,
      kind,
      from_email: email,
      from_name: name,
    });
  }, [listId, email, name]);

  return { messages, sendMessage, myEmail: email };
}