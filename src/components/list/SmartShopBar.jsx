import { Crown, MapPin } from "lucide-react";
import { getPreferredSupermarket } from "@/lib/supermarkets";

// שתי הפעולות שקובעות איך כדאי לצאת לקניות: הסל הכי זול מול הרשתות,
// והחנות הקרובה אליך. יושבות מיד מתחת לשני המספרים, לפני שורת המוצרים.
export default function SmartShopBar({ onCompare, onNearest, disabled }) {
  const nearest = getPreferredSupermarket();

  return (
    <section className="pw-smart" aria-label="קונים חכם">
      <h2 className="pw-smart-h">קונים חכם</h2>

      <div className="pw-smart-acts">
        <button type="button" onClick={onCompare} disabled={disabled} className="pw-smart-btn pw-smart-z">
          <Crown className="pw-smart-ic" aria-hidden="true" />
          <span className="pw-smart-t">הסל הכי זול</span>
          <span className="pw-smart-s">השוואה בין כל הרשתות</span>
        </button>

        <button type="button" onClick={onNearest} className="pw-smart-btn">
          <MapPin className="pw-smart-ic" aria-hidden="true" />
          <span className="pw-smart-t">החנות הקרובה</span>
          <span className="pw-smart-s">{nearest ? `ניווט ל${nearest}` : "ניווט לסניף הקרוב"}</span>
        </button>
      </div>
    </section>
  );
}