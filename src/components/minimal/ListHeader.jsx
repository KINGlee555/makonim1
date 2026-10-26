import { Pencil } from "lucide-react";
import EasyModeToggle from "@/components/EasyModeToggle";
import HeaderMenu from "@/components/HeaderMenu";
import { useT } from "@/lib/i18n";

const HERO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/95682f2e0_generated_812359bc.jpg";
const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/77de857b8_generated_image.png";

// פתיח המסך: תמונת שוק, שם הרשימה ושני המספרים הגדולים, ומתחת שורת הפעולות.
export default function ListHeader({ list, userName, itemCount, total, onOpenProfile, onOpenSettings, onOpenShare, onOpenQr, onRename }) {
  const t = useT();

  return (
    <div className="shf-hero">
      <img src={HERO} alt="" className="shf-hero-bg" />
      <div className="shf-scrim" />

      <div className="shf-hero-in">
        <div className="shf-brand">
          <span>MaKonim</span>
          <img src={LOGO} alt="MaKonim" />
          {userName && <span className="shf-greet">{t("header.greeting", { name: userName })}</span>}
        </div>

        <div className="shf-row">
          <h1 className="shf-ttl">
            <button type="button" onClick={onRename} title={t("rename.button")}>
              <span className="truncate">{list.title}</span>
              <Pencil className="h-[26px] w-[26px] shrink-0" strokeWidth={2.2} />
            </button>
          </h1>

          <div className="shf-nums">
            <span className="shf-num">
              {t("list.toBuy")}
              <b>{itemCount}</b>
            </span>
            <span className="shf-num shf-num-t">
              {t("list.total")}
              <b>₪{total.toFixed(2)}</b>
            </span>
          </div>
        </div>

        <div className="shf-acts">
          <EasyModeToggle pill className="shf-btn shf-btn-sol" />
          <button type="button" onClick={onOpenShare} className="shf-btn">{t("header.share")}</button>
          <button type="button" onClick={onOpenQr} className="shf-btn">{t("share.qrButton")}</button>
          <HeaderMenu className="shf-btn" onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} />
        </div>
      </div>
    </div>
  );
}