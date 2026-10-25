import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/067697bc9_logo.png";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function requestNotificationPermission() {
  if (!notificationsSupported()) return Promise.resolve("not-supported");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  if (Notification.permission === "denied") return Promise.resolve("denied");
  return Notification.requestPermission();
}

export function sendNotification(title, body) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: LOGO, badge: LOGO });
  } catch {
    // דפדפנים (למשל אייפון בלי הוספה למסך הבית) לא מאפשרים התראה מתוך הדף
  }
}

/**
 * התראות בזמן אמת על הרשימה המשותפת — כשמישהו מהמשפחה מוסיף מוצר
 * או מסמן מוצר כנקנה. ההתראה מופיעה במכשיר גם כשהאפליקציה פתוחה ברקע,
 * כדי שלא צריך להיכנס אליה כל רגע.
 */
export function useListNotifications(listId, enabled, myUserId) {
  const t = useT();
  const notifiedBought = useRef(new Set());

  useEffect(() => {
    if (!listId || !enabled) return;
    if (!notificationsSupported() || Notification.permission !== "granted") return;

    const unsubscribe = base44.entities.ListItem.subscribe((event) => {
      const data = event.data;
      if (!data || data.list_id !== listId) return;
      // מי שעשה את הפעולה במכשיר הזה — לא מקבל התראה על עצמו
      if (myUserId && data.created_by_id === myUserId) return;

      if (event.type === "create") {
        sendNotification(t("notify.added"), t("list.addedToList", { name: data.name }));
      } else if (event.type === "update" && data.status === "bought" && !notifiedBought.current.has(event.id)) {
        notifiedBought.current.add(event.id);
        const by = (data.bought_by || "").trim();
        sendNotification(t("notify.bought"), by ? `${by} · ${t("notify.boughtBody", { name: data.name })}` : t("notify.boughtBody", { name: data.name }));
      }
    });

    return unsubscribe;
  }, [listId, enabled, myUserId, t]);
}