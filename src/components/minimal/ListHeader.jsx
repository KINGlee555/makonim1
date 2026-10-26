import { Pencil } from "lucide-react";
import EasyModeToggle from "@/components/EasyModeToggle";
import HeaderMenu from "@/components/HeaderMenu";
import CatalogTrust from "@/components/CatalogTrust";
import { useT } from "@/lib/i18n";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/067697bc9_logo.png";

// פתיח הכרזה: מיתוג, שם הרשימה, שני המספרים הגדולים ומתחת שורת הפעולות — הכול על צהוב שטוח.
export default function ListHeader({ list, userName, itemCount, total, onOpenProfile, onOpenSettings, onOpenShare, onOpenQr, onRename }) {
  const t = useT();

  return (
    <div className="pst-hero">
      <div className="pst-brand">
        <span>MaKonim</span>
        <img src={LOGO} alt="MaKonim" />
      </div>

      <div className="pst-row">
        <h1 className="pst-ttl">
          <button type="button" onClick={onRename} title={t("rename.button")}>
            <span className="truncate">{list.title}</span>
            <Pencil strokeWidth={2.4} />
          </button>
        </h1>

        <div className="pst-nums">
          <span className="pst-num">
            {t("list.total")}
            <b>₪{total.toFixed(2)}</b>
          </span>
          <span className="pst-num pst-num-t">
            {t("list.toBuy")}
            <b>{itemCount}</b>
          </span>
        </div>
      </div>

      <div className="pst-acts">
        {userName && (
          <button type="button" onClick={onOpenProfile} className="pst-greet">
            {t("header.greeting", { name: userName })}
          </button>
        )}
        <EasyModeToggle pill className="pst-btn pst-btn-s" />
        <button type="button" onClick={onOpenShare} className="pst-btn">{t("header.share")}</button>
        <button type="button" onClick={onOpenQr} className="pst-btn">{t("share.qrButton")}</button>
        <HeaderMenu className="pst-btn" onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} />
      </div>

      <CatalogTrust compact />
    </div>
  );
}