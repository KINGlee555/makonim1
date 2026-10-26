import { useState } from "react";
import { requestNotificationPermission, notificationsSupported } from "@/hooks/useListNotifications";
import { useT } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";

// Small prompt bar above the list: one tap and you get device notifications
// when a family member adds a product or marks a product as bought.
export default function NotificationPrompt({ list, onEnabled }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || busy || !list || list.push_enabled) return null;
  if (!notificationsSupported() || Notification.permission === "denied") return null;

  const enable = async () => {
    setBusy(true);
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      setBusy(false);
      setDismissed(true);
      toast({ title: t("notify.blocked") });
      return;
    }
    try {
      // TODO: Update the list's push_enabled flag to true in your new backend
      // Simulating a network request for now
      await new Promise(resolve => setTimeout(resolve, 500));
      if (onEnabled) onEnabled();
    } catch {
      toast({ title: t("settings.error") });
    }
    setBusy(false);
    setDismissed(true);
  };

  return (
      <div className="pst-note">
        <span className="min-w-0">{t("notify.enableHint")}</span>
        <button type="button" onClick={enable} disabled={busy} className="shrink-0">
          {t("notify.enable")}
        </button>
      </div>
  );
}