import { Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// שורת הגנה לכל מחיר שמוצג: מאיפה המחיר הגיע, ומי קובע בסוף.
const TEXT = {
  he: "המחירים נאספים מדי יום מקבצי שקיפות המחירים הרשמיים של הרשתות. ייתכנו הפרשים בין סניפים ובמהלך היום — המחיר המחייב הוא המחיר בקופה.",
  en: "Prices are collected daily from the chains' official price transparency files. Prices may differ between branches and during the day — the price at the register is binding.",
  ru: "Цены собираются ежедневно из официальных файлов прозрачности цен сетей. Возможны различия между филиалами и в течение дня — цена на кассе является окончательной.",
};

export default function PriceNotice() {
  const { lang } = useLanguage();

  return (
    <p className="pst-price-note">
      <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{TEXT[lang] || TEXT.he}</span>
    </p>
  );
}