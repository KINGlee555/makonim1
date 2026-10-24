// תזכורות לפריטים: מתי להזכיר, איך להציג את הזמן, והאם כבר הגיע הזמן

export function reminderTime(kind, now = new Date()) {
  const date = new Date(now);
  if (kind === "hour") date.setHours(date.getHours() + 1);
  if (kind === "tonight") {
    date.setHours(20, 0, 0, 0);
    if (date.getTime() <= now.getTime()) date.setDate(date.getDate() + 1);
  }
  if (kind === "tomorrow") {
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
  }
  if (kind === "week") {
    date.setDate(date.getDate() + 7);
    date.setHours(9, 0, 0, 0);
  }
  return date.toISOString();
}

// "12.11 20:00" — קצר מספיק לשורה של מוצר
export function reminderText(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function isReminderDue(item, now = Date.now()) {
  return Boolean(item?.remind_at) && !item?.reminder_sent && new Date(item.remind_at).getTime() <= now;
}

// ערך לשדה datetime-local
export function toLocalInput(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}