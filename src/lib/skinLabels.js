// שמות ערכות העיצוב בשלוש השפות — בקובץ קטן כדי לא לגעת בקובץ התרגומים הגדול
const LABELS = {
  he: { fridge: "פתק על המקרר", quiet: "רגוע וסולידי", poster: "כרזת שוק (צבעוני)" },
  en: { fridge: "Note on the fridge", quiet: "Calm and solid", poster: "Market poster (colorful)" },
  ru: { fridge: "Записка на холодильнике", quiet: "Спокойная", poster: "Яркая афиша (цветная)" },
};

export function skinLabel(lang, skin) {
  const dict = LABELS[lang] || LABELS.he;
  return dict[skin] || dict.fridge;
}