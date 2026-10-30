import EasyModeToggle from "@/components/EasyModeToggle";
import HeaderMenu from "@/components/HeaderMenu";
import CatalogTrust from "@/components/CatalogTrust";
import { useT } from "@/lib/i18n";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/067697bc9_logo.png";

// פתיח הכרזה: לוגו גדול במרכז ומיד מתחתיו שורת הפעולות.
// שני המספרים (סה״כ וכמה נשאר לקנות) עברו לתחתית הרשימה.
export default function ListHeader({ list, userName, onOpenProfile, onOpenSettings, onOpenShare, onOpenQr }) {
  const t = useT();

  return (
    <div className="pst-hero">
      <span className="fun-shine" aria-hidden="true" />
      <div className="pst-brand">
        <img src={LOGO} alt="MaKonim" className="fun-logo" />
        <span>MaKonim</span>
      </div>

      {list?.title && <p className="pst-listname">{list.title}</p>}

      <div className="pst-acts">
        {userName && (
          <button type="button" onClick={onOpenProfile} className="pst-greet fun-wiggle">
            {t("header.greeting", { name: userName })}
          </button>
        )}
        <span className="pst-easy">
          <EasyModeToggle pill className="pst-btn pst-btn-s" />
          <span className="pst-easy-hint">{t("header.easyModeHint")}</span>
        </span>
        <button type="button" onClick={onOpenShare} className="pst-btn">{t("header.share")}</button>
        <button type="button" onClick={onOpenQr} className="pst-btn">{t("share.qrButton")}</button>
        <HeaderMenu className="pst-btn" onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} />
      </div>

      <CatalogTrust compact />
    </div>
  );
}