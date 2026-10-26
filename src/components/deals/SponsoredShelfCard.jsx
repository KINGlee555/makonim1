import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";
import ChainLogo from "@/components/ChainLogo";
import useSponsoredSlot from "@/hooks/useSponsoredSlot";
import { useT } from "@/lib/i18n";

// שטח הפרסום של האתר: מקום ממומן שנמכר מוצג כאן ראשון — וכשאין, השטח מוצע להשכרה.
export default function SponsoredShelfCard() {
  const t = useT();
  const slot = useSponsoredSlot();

  if (slot?.url) {
    return (
      <a href={slot.url} target="_blank" rel="noopener noreferrer" className="pst-spon">
        <ChainLogo name={slot.chain_name} size={22} className="flex-none" />
        <span className="pst-spon-t">
          {slot.headline}
          {slot.body && <span className="pst-spon-s">{slot.body}</span>}
        </span>
        <span className="pst-spon-tag">{t("sponsored.label")}</span>
      </a>
    );
  }

  return (
    <div className="pst-spon">
      <Megaphone className="h-5 w-5 flex-none" />
      <span className="pst-spon-t">
        {t("shelf.forRent")}
        <span className="pst-spon-s">{t("shelf.rentNote")}</span>
      </span>
      <Link to="/contact" className="pst-spon-tag">{t("shelf.rentCta")}</Link>
    </div>
  );
}