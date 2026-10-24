import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { requestNotificationPermission, sendNotification } from "@/hooks/useListNotifications";
import { useT } from "@/lib/i18n";
import { isReminderDue } from "@/lib/reminders";

// תזכורות שהגיע זמנן: התראה במכשיר (בזמן שהאפליקציה פתוחה) וסימון שהתזכורת נשלחה,
// כדי שלא תחזור שוב. הבדיקה חוזרת כל חצי דקה.
export function useItemReminders(items) {
  const t = useT();
  const busy = useRef(false);

  useEffect(() => {
    const check = async () => {
      if (busy.current) return;
      const due = items.filter(item => isReminderDue(item));
      if (due.length === 0) return;
      busy.current = true;
      try {
        const permission = await requestNotificationPermission();
        if (permission === "granted") {
          due.forEach(item => sendNotification(t("reminder.title"), item.name));
        }
        await Promise.all(due.map(item => base44.entities.ListItem.update(item.id, { reminder_sent: true })));
      } catch {
        // תזכורת שלא נשלחה תנסה שוב בסבב הבא
      } finally {
        busy.current = false;
      }
    };

    check();
    const timer = window.setInterval(check, 30000);
    return () => window.clearInterval(timer);
  }, [items, t]);
}