import { Link } from "react-router-dom";
import { Users, Sparkles, ShoppingCart, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import AppFooter from "@/components/AppFooter";
import { demoItems, demoMembers, demoBasketTotal, demoSavings, lineCost } from "@/lib/demoList";

const groupByCategory = (items) =>
  items.reduce((groups, item) => {
    const category = item.category || "אחר";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

const amountLabel = (item) => (item.unit === "gram" ? `${item.quantity / 1000} kg` : `×${item.quantity}`);

export default function DemoList() {
  const t = useT();
  const cheapestTotal = demoBasketTotal * demoSavings.factor;
  const savings = demoBasketTotal - cheapestTotal;
  const groups = Object.entries(groupByCategory(demoItems));

  return (
    <div className="min-h-screen bg-ui-canvas font-system font-medium text-ui-ink tabular-nums">
      <header className="sticky top-0 z-10 border-b border-ui-line bg-ui-canvas/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[760px] items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[15px] font-semibold">
            <ShoppingCart className="h-4 w-4 text-ui-accent" />
            MaKonim
          </span>
          <span className="rounded-full bg-market-yellow-soft px-3 py-1 text-[12px] font-semibold text-market-ink">
            {t("demo.badge")}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 pb-10 sm:px-7">
        <h1 className="mt-4 text-[22px] font-semibold leading-tight">{t("demo.title")}</h1>
        <p className="mt-1 text-[14px] text-ui-muted">{t("demo.subtitle")}</p>

        <section className="mt-3 rounded-2xl border border-ui-line-soft px-3 py-2.5">
          <p className="flex items-center gap-2 text-[13px] font-medium">
            <Users className="h-4 w-4 text-ui-accent" />
            {t("demo.withYou")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {demoMembers.map(name => (
              <span key={name} className="flex items-center gap-1.5 rounded-full border border-ui-line px-2.5 py-1 text-[13px]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ui-surface text-[12px] font-semibold">{name[0]}</span>
                {name}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-ui-muted">{t("demo.shareNote")}</p>
        </section>

        <section className="mt-3 rounded-2xl border border-ui-line-soft px-3 py-2.5">
          <p className="flex items-center gap-2 text-[13px] font-medium">
            <Sparkles className="h-4 w-4 text-ui-accent" />
            {t("demo.basketTitle")}
          </p>
          <p className="mt-1 text-[16px] font-semibold text-ui-accent">
            {t("demo.basketCheapest", { amount: savings.toFixed(2), chain: demoSavings.cheapestChain })}
          </p>
          <p className="text-[12px] text-ui-muted">
            {t("demo.basketTotal", { total: demoBasketTotal.toFixed(2) })} · {t("demo.sampleTag")}
          </p>
        </section>

        {groups.map(([category, items]) => (
          <section key={category} className="pt-3">
            <h2 className="text-[13px] font-semibold text-ui-muted">{category}</h2>
            {items.map(item => (
              <div key={item.name} className="flex items-center gap-3 border-b border-ui-line-soft py-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ui-surface text-[20px]">{item.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-ui-ink">{item.name}</p>
                  <p className="text-[12px] text-ui-muted">{item.category}</p>
                </div>
                <span className="shrink-0 text-[14px] text-ui-muted">{amountLabel(item)}</span>
                <span className="shrink-0 text-[14px] font-semibold text-ui-ink">₪{lineCost(item).toFixed(2)}</span>
              </div>
            ))}
          </section>
        ))}

        <section className="mt-5 rounded-2xl border-2 border-ui-accent/30 bg-ui-surface px-4 py-4 text-center">
          <p className="text-[17px] font-semibold text-ui-ink">{t("demo.ctaTitle")}</p>
          <p className="mt-0.5 text-[13px] text-ui-muted">{t("demo.ctaSub")}</p>
          <Link to="/register" className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ui-accent px-5 text-[16px] font-semibold text-white">
            {t("demo.cta")}
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-[12px] text-ui-muted">{t("demo.haveLink")}</p>
        </section>

        <AppFooter />
      </main>
    </div>
  );
}