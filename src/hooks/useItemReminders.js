import { useEffect, useRef } from "react";
import { requestNotificationPermission, sendNotification } from "@/hooks/useListNotifications";
import { useT } from "@/lib/i18n";
import { isReminderDue } from "@/lib/reminders";

// Reminders that are due: device notification (while the app is open) and marking the reminder as sent,
// so it doesn't repeat. The check runs every half minute.
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

        // TODO: Update the item's reminder_sent flag to true in your new backend
        // Simulating backend update for now
        await Promise.all(due.map(item => new Promise(resolve => setTimeout(resolve, 100))));
      } catch {
        // A reminder that wasn't sent will try again in the next cycle
      } finally {
        busy.current = false;
      }
    };

    check();
    const timer = window.setInterval(check, 30000);
    return () => window.clearInterval(timer);
  }, [items, t]);
}