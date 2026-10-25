import { useState } from "react";
import { Bell } from "lucide-react";
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
    <button type="button" onClick={enable}
      className="big-in mt-5 flex w-full items-center gap-3 rounded-[18px] border-2 border-big-attn bg-big-attn-soft px-4 py-3 text-start hover:opacity-90">
      <Bell className="h-7 w-7 shrink-0 text-big-attn-ink" strokeWidth={2.2} />
      <span className="flex min-w-0 flex-col">
        <span className="text-[19px] leading-tight text-big-attn-ink">{t("notify.enable")}</span>
        <span className="truncate text-[14px] text-big-attn-ink/80">{t("notify.enableHint")}</span>
      </span>
    </button>
  );
}