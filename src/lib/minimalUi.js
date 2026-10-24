// שפת העיצוב השקטה של מסך הרשימה: קנבס לבן, קווי שיער דקים ואקסנט טורקיז אחד.
// כל הכפתורים חולקים את אותם מעברים בדיוק — צבע, צל ו�Opacity ב-200ms.
const motion = "transition-[background-color,color,box-shadow,opacity] duration-200";
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent";

export const uiPill = `h-[30px] shrink-0 rounded-[15px] border border-ui-line bg-ui-canvas px-3 text-[13px] text-ui-ink hover:bg-ui-surface active:opacity-70 ${motion} ${focus}`;
export const uiPillRow = "flex flex-wrap items-center gap-1.5";
export const uiSection = "border-b border-ui-line-soft py-3";
export const uiSectionLabel = "mb-2 text-[12px] text-ui-muted";
export const uiBanner = "flex items-center justify-between gap-3 rounded-[10px] bg-ui-surface px-3.5 py-2.5 text-[14px] text-ui-ink";
export const uiBannerAction = `h-[30px] shrink-0 rounded-[15px] border border-ui-accent bg-transparent px-3 text-[13px] text-ui-accent hover:bg-ui-accent hover:text-white active:opacity-70 ${motion} ${focus}`;
export const uiStep = `flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-ui-line bg-ui-canvas text-[14px] leading-none text-ui-ink hover:bg-ui-surface active:opacity-70 ${motion} ${focus}`;
export const uiPrimary = `h-11 w-full rounded-[22px] border border-ui-accent bg-ui-accent text-[15px] text-white hover:shadow-[0_2px_8px_rgba(14,159,143,0.35)] active:opacity-70 ${motion} ${focus}`;
export const uiOutline = `h-11 w-full rounded-[22px] border border-ui-line bg-ui-canvas text-[15px] text-ui-ink hover:shadow-[0_2px_8px_rgba(17,24,39,0.12)] active:opacity-70 ${motion} ${focus}`;
export const uiIconRound = `flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ui-line bg-ui-canvas text-ui-ink hover:bg-ui-surface active:opacity-70 ${motion} ${focus}`;
export const uiLink = `text-[13px] text-ui-muted underline-offset-4 hover:text-ui-ink ${motion} ${focus}`;

// כניסה מלמעלה עם דהייה קצרה — כל שורה נכנסת בהפרש קטן מהקודמת
export const uiEnter = "ui-in";
export const uiEnterDelay = (index) => ({ animationDelay: `${Math.min(index, 14) * 0.05}s` });