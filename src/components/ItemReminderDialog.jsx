import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { reminderTime, toLocalInput } from "@/lib/reminders";
import { uiPill } from "@/lib/minimalUi";

const PICKS = ["hour", "tonight", "tomorrow", "week"];

// תזכורת למוצר: בחירה מהירה של זמן, או תאריך ושעה מדויקים
export default function ItemReminderDialog({ item, onClose, onSaved }) {
  const t = useT();
  const [custom, setCustom] = useState("");

  useEffect(() => {
    setCustom(item?.remind_at ? toLocalInput(item.remind_at) : "");
  }, [item]);

  const save = (value) => {
    onSaved(item, value);
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-ui-accent" />{t("reminder.title")}
          </DialogTitle>
        </DialogHeader>
        {item && <p className="truncate text-[14px] text-ui-muted">{item.name}</p>}
        <p className="text-[12px] text-ui-muted">{t("reminder.hint")}</p>

        <div className="flex flex-wrap gap-2">
          {PICKS.map(kind => (
            <button key={kind} type="button" onClick={() => save(reminderTime(kind))} className={uiPill}>
              {t(`reminder.${kind}`)}
            </button>
          ))}
        </div>

        <label className="space-y-2 text-sm font-semibold">
          <span>{t("reminder.exact")}</span>
          <Input type="datetime-local" value={custom} onChange={(event) => setCustom(event.target.value)} className="h-12 rounded-xl" />
        </label>
        <Button onClick={() => save(new Date(custom).toISOString())} disabled={!custom} className="h-12 rounded-xl">
          {t("reminder.set")}
        </Button>

        {item?.remind_at && (
          <button type="button" onClick={() => save("")} className="inline-flex items-center justify-center gap-1.5 text-[13px] text-ui-muted">
            <BellOff className="h-3.5 w-3.5" />{t("reminder.clear")}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}