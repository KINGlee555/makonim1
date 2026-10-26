import { Link } from "react-router-dom";
import { Users, Sparkles, ArrowLeft, ShoppingCart } from "lucide-react";
import { useT } from "@/lib/i18n";
import PosterPage from "@/components/poster/PosterPage";
import { posterPhoto } from "@/lib/categoryPoster";
import { demoItems, demoMembers, demoBasketTotal, demoSavings, lineCost } from "@/lib/demoList";

const groupByCategory = (items) =>
  items.reduce((groups, item) => {
    const category = item.category || "אחר";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

const amountLabel = (item) => (item.unit === "gram" ? `${item.quantity / 1000} kg` : `×${item.quantity}`);

// רשימת דוגמה ציבורית — כרזת שוק עם אותם אריחים, שורות ומקטעים של הרשימה עצמה.
export default function DemoList() {
  const t = useT();
  const cheapestTotal = demoBasketTotal * demoSavings.factor;
  const savings = demoBasketTotal - cheapestTotal;
  const groups = Object.entries(groupByCategory(demoItems));

  return (
    <PosterPage icon={ShoppingCart} title={t("demo.title")} subtitle={t("demo.subtitle")} back="/">
      <section className="pst-panel">
        <p className="flex items-center gap-2 text-[17px] font-black">
          <Users className="h-5 w-5" />
          {t("demo.withYou")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {demoMembers.map(name => (
            <span key={name} className="flex items-center gap-2 rounded-full border-[3px] border-pst-ink px-3 py-1 text-[14px] font-black">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pst-yellow text-[13px] font-black">{name[0]}</span>
              {name}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[13px] font-bold text-ui-muted">{t("demo.shareNote")}</p>
      </section>

      <section className="pst-panel mt-4">
        <p className="flex items-center gap-2 text-[17px] font-black">
          <Sparkles className="h-5 w-5" />
          {t("demo.basketTitle")}
        </p>
        <p className="mt-2 text-[21px] font-black leading-tight text-pst-pink">
          {t("demo.basketCheapest", { amount: savings.toFixed(2), chain: demoSavings.cheapestChain })}
        </p>
        <p className="mt-1 text-[13px] font-bold text-ui-muted">
          {t("demo.basketTotal", { total: demoBasketTotal.toFixed(2) })} · {t("demo.sampleTag")}
        </p>
      </section>

      {groups.map(([category, items]) => (
        <section key={category}>
          <h2 className="pst-h2">
            <span>{category}</span>
            <small>{items.length}</small>
          </h2>
          <div className="pst-sech">
            <img src={posterPhoto(category)} alt="" loading="lazy" />
          </div>
          <div className="mt-4">
            {items.map(item => (
              <div key={item.name} className="pst-lrow">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border-[3px] border-pst-ink bg-pst-yellow text-[22px]">
                  {item.emoji}
                </span>
                <div className="pst-lrow-t">
                  <p className="truncate">{item.name}</p>
                  <p className="pst-lrow-s">{amountLabel(item)}</p>
                </div>
                <span className="pst-lrow-v">₪{lineCost(item).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="pst-panel mt-6 text-center">
        <p className="text-[20px] font-black leading-tight">{t("demo.ctaTitle")}</p>
        <p className="mt-1 text-[14px] font-bold text-ui-muted">{t("demo.ctaSub")}</p>
        <Link to="/register" className="pst-btn mt-4 inline-flex w-full items-center justify-center gap-2">
          {t("demo.cta")}
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-[13px] font-bold text-ui-muted">{t("demo.haveLink")}</p>
      </section>
    </PosterPage>
  );
}