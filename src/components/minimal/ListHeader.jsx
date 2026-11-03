import EasyModeToggle from "@/components/EasyModeToggle";
import HeaderMenu from "@/components/HeaderMenu";
import BrandLogo from "@/components/BrandLogo";
import { useT } from "@/lib/i18n";

// הפתיח של הכרזה הרחבה: המיתוג במרכז, שם הרשימה, שורת פעולות קצרה —
// ומתחתיהם שני המספרים שמגיעים מהמסך עצמו.
export default function ListHeader({ list, onOpenSettings, onOpenShare, children }) {
  const t = useT();

  return (
    <div className="pw-hero">
      <div className="pw-brand">
        <BrandLogo size="md" />
      </div>

      {list?.title && <p className="pw-lname">{list.title}</p>}

      <div className="pw-acts">
        <EasyModeToggle pill className="pw-btn pw-btn-s" />
        <button type="button" onClick={onOpenShare} className="pw-btn">{t("header.share")}</button>
        <HeaderMenu className="pw-btn" onOpenSettings={onOpenSettings} />
      </div>

      {children}
    </div>
  );
}