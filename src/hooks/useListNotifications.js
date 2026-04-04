import { useEffect } from "react";

export function requestNotificationPermission() {
  if (!("Notification" in window)) return Promise.resolve("not-supported");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  if (Notification.permission === "denied") return Promise.resolve("denied");
  return Notification.requestPermission();
}

export function sendNotification(title, body) {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico"
  });
}

export function useListNotifications(items, currentUserEmail) {
  // When items change via real-time, notify if another user bought or added something
  useEffect(() => {
    // stored in ref to avoid initial load notifications
  }, []);
}