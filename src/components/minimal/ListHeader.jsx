import EasyModeToggle from "@/components/EasyModeToggle";
import HeaderMenu from "@/components/HeaderMenu";
import CatalogTrust from "@/components/CatalogTrust";
import { useT } from "@/lib/i18n";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/067697bc9_logo.png";

// הפתיח של הכרזה הרחבה: לוגו ומיתוג במרכז, שם הרשימה, קוד ההצטרפות,
// שורת הפעולות, מספר הקטלוג — ומתחתיהם שני המספרים שמגיעים מהמסך עצמו.
export default function ListHeader({ list, userName, onOpenProfile, onOpenSettings, onOpenShare, onOpenQr, children }) {
  const t = useT();

  return (
    <div className="pw-hero">
      <div className="pw-brand">
        <img src={LOGO} alt="MaKonim" className="pw-logo" />
        <span>MaKonim</span>
      </div>

      {list?.title && <p className="pw-lname">{list.title}</p>}

      <button type="button" onClick={onOpenQr} className="pw-code">{t("share.qrButton")}</button>

      <div className="pw-acts">
        <EasyModeToggle pill className="pw-btn pw-btn-s" />
        <span className="pw-hint">{t("header.easyModeHint")}</span>
        {userName && (
          <button type="button" onClick={onOpenProfile} className="pw-btn">
            {t("header.greeting", { name: userName })}
          </button>
        )}
        <button type="button" onClick={onOpenShare} className="pw-btn">{t("header.share")}</button>
        <HeaderMenu className="pw-btn" onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} />
      </div>

      <CatalogTrust compact />

      {children}
    </div>
  );
}