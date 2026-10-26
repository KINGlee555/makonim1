import { useEffect, useRef } from "react";
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
    // Browsers (e.g., iPhone without adding to home screen) do not allow in-page notifications
  }
}

/**
 * Real-time notifications for the shared list — when someone in the family adds a product
 * or marks a product as bought. The notification appears on the device even when the app is open in the background,
 * so you don't have to constantly check it.
 */
export function useListNotifications(listId, enabled, myUserId) {
  const t = useT();
  const notifiedBought = useRef(new Set());

  useEffect(() => {
    if (!listId || !enabled) return;
    if (!notificationsSupported() || Notification.permission !== "granted") return;

    // TODO: Implement real-time subscription for ListItem updates in your new backend (e.g., Supabase realtime)
    /*
    const unsubscribe = newBackend.subscribeToListItemUpdates(listId, (event) => {
      const data = event.data;
      if (!data || data.list_id !== listId) return;

      // The person who performed the action on this device — does not get a notification about themselves
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
    */

    const mockUnsubscribe = () => {};
    return mockUnsubscribe;

  }, [listId, enabled, myUserId, t]);
}