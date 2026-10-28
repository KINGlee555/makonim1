// "מי הוסיף את המוצר ומתי" — שם המשתתף ושעת ההוספה המדויקת, בשפה הנוכחית.
import itemMeta from "@/lib/locales/itemMeta";

const LOCALES = { he: "he-IL", en: "en-GB", ru: "ru-RU" };

function dict(lang) {
  return itemMeta[lang] || itemMeta.he;
}

export function addedTime(value, lang) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const words = dict(lang);
  const locale = LOCALES[lang] || LOCALES.he;
  const time = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return time;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `${words["item.yesterday"]} ${time}`;
  const day = date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  return `${day} ${time}`;
}

export function addedText(item, lang) {
  const words = dict(lang);
  const time = addedTime(item.created_date, lang);
  const name = (item.added_by || "").trim();
  if (name && time) return words["item.addedByAt"].replace("{name}", name).replace("{time}", time);
  if (name) return words["item.addedBy"].replace("{name}", name);
  if (time) return words["item.addedAt"].replace("{time}", time);
  return "";
}