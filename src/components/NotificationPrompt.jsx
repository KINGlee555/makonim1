import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { requestNotificationPermission, notificationsSupported } from "@/hooks/useListNotifications";
import { useT } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";

// שורת הפעלה קטנה מעל הרשימה: נגיעה אחת ומקבלים התראה במכשיר
// כשמישהו מהמשפחה מוסיף מוצר או מסמן מוצר כנקנה.
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
      await base44.entities.ShoppingList.update(list.id, { push_enabled: true });
      if (onEnabled) onEnabled();
    } catch {
      toast({ title: t("settings.error") });
    }
    setBusy(false);
    setDismissed(true);
  };

  return (
    <div className="shf-push">
      <div className="shf-push-in">
        <span className="min-w-0">{t("notify.enableHint")}</span>
        <button type="button" onClick={enable} disabled={busy} className="shf-push-btn shrink-0">
          {t("notify.enable")}
        </button>
      </div>
    </div>
  );
}