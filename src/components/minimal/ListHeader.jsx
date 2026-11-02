import EasyModeToggle from "@/components/EasyModeToggle";
import HeaderMenu from "@/components/HeaderMenu";
import BrandLogo from "@/components/BrandLogo";
import { useT } from "@/lib/i18n";

// הפתיח של הכרזה הרחבה: המיתוג במרכז, שם הרשימה, שורת הפעולות —
// ומתחתיהם שני המספרים שמגיעים מהמסך עצמו.
export default function ListHeader({ list, userName, onOpenProfile, onOpenSettings, onOpenShare, onOpenQr, children }) {
  const t = useT();

  return (
    <div className="pw-hero">
      <div className="pw-brand">
        <BrandLogo size="md" />
      </div>

      {list?.title && <p className="pw-lname">{list.title}</p>}

      <button type="button" onClick={onOpenQr} className="pw-code">{t("share.qrButton")}</button>

      <div className="pw-acts">
        <EasyModeToggle pill className="pw-btn pw-btn-s" />
        {userName && (
          <button type="button" onClick={onOpenProfile} className="pw-btn">
            {t("header.greeting", { name: userName })}
          </button>
        )}
        <button type="button" onClick={onOpenShare} className="pw-btn">{t("header.share")}</button>
        <HeaderMenu className="pw-btn" onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} />
      </div>

      {children}
    </div>
  );
}