import { Info, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import usePricesUpdatedAt from "@/hooks/usePricesUpdatedAt";
import "@/styles/price-update.css";

// שורת הגנה לכל מחיר שמוצג: מאיפה המחיר הגיע, מתי עודכן, ומי קובע בסוף.
const TEXT = {
  he: "המחירים נאספים מדי יום מקבצי שקיפות המחירים הרשמיים של הרשתות. ייתכנו הפרשים בין סניפים ובמהלך היום — המחיר המחייב הוא המחיר בקופה.",
  en: "Prices are collected daily from the chains' official price transparency files. Prices may differ between branches and during the day — the price at the register is binding.",
  ru: "Цены собираются ежедневно из официальных файлов прозрачности цен сетей. Возможны различия между филиалами и в течение дня — цена на кассе является окончательной.",
};

// השורה שמציינת את העדכון האחרון מול אתרי השקיפות הממשלתיים
const UPDATED_LABEL = {
  he: "עודכן מול אתרי שקיפות המחירים של הרשתות",
  en: "Last updated from the chains' price transparency files",
  ru: "Последнее обновление из файлов прозрачности цен",
};

const CHAINS_TEXT = {
  he: (count) => `${count} רשתות`,
  en: (count) => `${count} chains`,
  ru: (count) => `${count} сетей`,
};

const LOCALES = { he: "he-IL", en: "en-GB", ru: "ru-RU" };

// המסד שומר זמנים ב-UTC בלי סימון — מפרשים אותם כך ומציגים בשעון המכשיר
function toDate(value) {
  if (!value) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// תאריך ושעה בשפה הנוכחית — אותו פורמט שבו מוצגות שאר השעות באפליקציה
function stampText(value, lang) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleString(LOCALES[lang] || LOCALES.he, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// היום שעבורו נמשכו המחירים — כדי שיהיה ברור שזה העדכון של היום
function dayText(value, lang) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(LOCALES[lang] || LOCALES.he, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function PriceNotice() {
  const { lang } = useLanguage();
  const info = usePricesUpdatedAt();
  const stamp = stampText(info.at, lang);
  const day = dayText(info.day, lang);

  return (
    <>
      <p className="pst-price-note">
        <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{TEXT[lang] || TEXT.he}</span>
      </p>

      {stamp && (
        <p className="pst-gov" role="status">
          <ShieldCheck className="pst-gov-ic" aria-hidden="true" />
          <span className="pst-gov-t">
            {UPDATED_LABEL[lang] || UPDATED_LABEL.he}: <b>{stamp}</b>
          </span>
          <span className="pst-gov-c">
            {day ? (lang === "en" ? `prices for ${day}` : lang === "ru" ? `цены за ${day}` : `מחירי ${day}`) : ""}
            {day && info.chains > 0 ? " · " : ""}
            {info.chains > 0 ? (CHAINS_TEXT[lang] || CHAINS_TEXT.he)(info.chains) : ""}
          </span>
        </p>
      )}
    </>
  );
}