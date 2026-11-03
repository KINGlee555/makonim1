import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { requestNotificationPermission, notificationsSupported } from "@/hooks/useListNotifications";
import { useT } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";
import NoticeCard from "@/components/notice/NoticeCard";

// שורת הפעלה: נגיעה אחת ומקבלים התראה במכשיר כשמישהו מהמשפחה מוסיף מוצר או קונה.
// אפשר לסגור אותה, והסגירה נשמרת לרשימה הזאת כדי שלא תחזור בכל כניסה.
const hiddenKey = (listId) => `mk_notify_hidden_${listId}`;

export default function NotificationPrompt({ list, onEnabled }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (list?.id) setClosed(localStorage.getItem(hiddenKey(list.id)) === "1");
  }, [list?.id]);

  if (!list || closed || busy || list.push_enabled) return null;
  if (!notificationsSupported() || Notification.permission === "denied") return null;

  const close = () => {
    localStorage.setItem(hiddenKey(list.id), "1");
    setClosed(true);
  };

  const enable = async () => {
    setBusy(true);
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      setBusy(false);
      setClosed(true);
      localStorage.setItem(hiddenKey(list.id), "1");
      toast({ title: t("notify.blocked") });
      return;
    }
    try {
      await base44.entities.ShoppingList.update(list.id, { push_enabled: true });
      if (onEnabled) onEnabled();
      localStorage.removeItem(hiddenKey(list.id));
    } catch {
      toast({ title: t("settings.error") });
    }
    setBusy(false);
    setClosed(true);
  };

  return (
    <NoticeCard
      icon={<Bell className="h-5 w-5" />}
      title={t("notify.enable")}
      text={t("notify.enableHint")}
      onClose={close}
    >
      <button
        type="button"
        onClick={enable}
        disabled={busy}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-black text-primary-foreground disabled:opacity-60"
      >
        <Bell className="h-5 w-5" />
        {t("notify.turnOn")}
      </button>
    </NoticeCard>
  );
}