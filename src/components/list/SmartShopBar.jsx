import { Clock, Crown, MapPin, Plus, Store } from "lucide-react";
import ChainLogo from "@/components/ChainLogo";
import { SUPERMARKETS, getPreferredSupermarket } from "@/lib/supermarkets";
import { storeStatus } from "@/lib/storeHours";
import { dealPriceText } from "@/lib/chainDeals";
import useNearestBranch from "@/hooks/useNearestBranch";
import useNearestStoreDeals from "@/hooks/useNearestStoreDeals";

// "קונים חכם" — כרטיס אחד ממורכז: החנות הקרובה אליך עם המרחק והשעות שלה,
// מה מגיע ממנה לרשימה, וההמלצות שלה. שתי הפעולות שקובעות איפה קונים.
export default function SmartShopBar({ onCompare, onNearest, disabled, items = [], onAddProduct }) {
  const storeName = getPreferredSupermarket() || "שופרסל";
  const chain = SUPERMARKETS.find(entry => entry.name === storeName);
  const { branch, status: branchStatus } = useNearestBranch(storeName);
  const { mine, recommended, loading } = useNearestStoreDeals(chain?.chain || "shufersal", items);

  const status = storeStatus(new Date(), chain?.shabbat);
  const statusText = status.label === "openUntil" ? `פתוח עד ${status.time}`
    : status.label === "opensAt" ? `נפתח ב־${status.time}`
      : status.label === "closedToday" ? "סגור היום" : "סגור עכשיו";
  const branchHours = branch?.hours && branch.hours.length <= 34 ? branch.hours : "";

  const addRecommended = (deal) => {
    if (!onAddProduct) return;
    onAddProduct({ name: deal.name, price: Number(deal.deal_price) || 0, category: "אחר", barcode: deal.barcode || "" });
  };

  return (
    <section className="pw-smart" aria-label="קונים חכם">
      <header className="pw-smart-head">
        <div className="pw-smart-id">
          <p className="pw-smart-kicker">קונים חכם</p>
          <h2 className="pw-smart-title">
            {branch?.name || storeName}
            <small>החנות הקרובה אליך</small>
          </h2>
        </div>
        <ChainLogo name={storeName} size={40} className="pw-smart-logo" />
      </header>

      <div className="pw-smart-chips">
        <span className="pw-smart-chip">
          <MapPin aria-hidden="true" />
          {branch ? `${branch.distanceKm.toFixed(1)} ק״מ` : branchStatus === "error" ? "אין גישה למיקום" : "מחשב מרחק"}
        </span>
        <span className={`pw-smart-chip ${status.open ? "pw-smart-open" : "pw-smart-closed"}`}>
          <Clock aria-hidden="true" />
          {statusText}
        </span>
        {branch?.brand && branch.brand !== branch.name && (
          <span className="pw-smart-chip"><Store aria-hidden="true" />{branch.brand}</span>
        )}
      </div>

      <p className="pw-smart-hours">
        {branchHours ? `שעות הסניף: ${branchHours}` : "שעות פתיחה משוערות של הרשת — כדאי לוודא מול הסניף"}
      </p>

      <div className="pw-smart-acts">
        <button type="button" onClick={onCompare} disabled={disabled} className="pw-smart-btn pw-smart-z">
          <Crown className="pw-smart-ic" aria-hidden="true" />
          <span className="pw-smart-t">הסל הכי זול</span>
          <span className="pw-smart-s">השוואה בין כל הרשתות</span>
        </button>
        <button type="button" onClick={onNearest} className="pw-smart-btn">
          <MapPin className="pw-smart-ic" aria-hidden="true" />
          <span className="pw-smart-t">ניווט לחנות</span>
          <span className="pw-smart-s">רכב או הליכה</span>
        </button>
      </div>

      <div className="pw-smart-cols">
        <div className="pw-smart-block">
          <h3>מהחנות הזאת</h3>
          {mine.length > 0 ? (
            <div className="pw-smart-rows">
              {mine.map(deal => (
                <div key={`${deal.barcode || deal.name}`} className="pw-smart-row">
                  <span className="pw-smart-row-n">{deal.name}</span>
                  <b className="pw-smart-row-p">{dealPriceText(deal)}</b>
                </div>
              ))}
            </div>
          ) : (
            <p className="pw-smart-empty">
              {loading ? "בודקים מבצעים בחנות…" : "אין מבצעים ברשת הזאת על המוצרים שברשימה"}
            </p>
          )}
        </div>

        <div className="pw-smart-block">
          <h3>המלצות מהחנות</h3>
          {recommended.length > 0 ? (
            <div className="pw-smart-rows">
              {recommended.map(deal => (
                <div key={`${deal.barcode || deal.name}`} className="pw-smart-row">
                  <span className="pw-smart-row-n">{deal.name}</span>
                  <b className="pw-smart-row-p">{dealPriceText(deal)}</b>
                  {onAddProduct && (
                    <button type="button" className="pw-smart-add" onClick={() => addRecommended(deal)}
                      aria-label={`הוספת ${deal.name} לרשימה`}>
                      <Plus aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="pw-smart-empty">
              {loading ? "אוספים את ההמלצות של החנות…" : "אין כרגע מבצעים נוספים שאפשר להמליץ עליהם"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}