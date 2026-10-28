import { Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import usePricesUpdatedAt from "@/hooks/usePricesUpdatedAt";

// שורת הגנה לכל מחיר שמוצג: מאיפה המחיר הגיע, מתי עודכן, ומי קובע בסוף.
const TEXT = {
  he: "המחירים נאספים מדי יום מקבצי שקיפות המחירים הרשמיים של הרשתות. ייתכנו הפרשים בין סניפים ובמהלך היום — המחיר המחייב הוא המחיר בקופה.",
  en: "Prices are collected daily from the chains' official price transparency files. Prices may differ between branches and during the day — the price at the register is binding.",
  ru: "Цены собираются ежедневно из официальных файлов прозрачности цен сетей. Возможны различия между филиалами и в течение дня — цена на кассе является окончательной.",
};

const UPDATED_LABEL = {
  he: "המחירים עודכנו לאחרונה",
  en: "Prices last updated",
  ru: "Цены обновлены",
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
  const locale = LOCALES[lang] || LOCALES.he;
  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PriceNotice() {
  const { lang } = useLanguage();
  const updatedAt = usePricesUpdatedAt();
  const stamp = stampText(updatedAt, lang);

  return (
    <p className="pst-price-note">
      <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        {TEXT[lang] || TEXT.he}
        {stamp && (
          <b className="mt-1 block font-black">
            {UPDATED_LABEL[lang] || UPDATED_LABEL.he}: <bdi>{stamp}</bdi>
          </b>
        )}
      </span>
    </p>
  );
}