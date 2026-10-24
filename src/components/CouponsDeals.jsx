import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, Sparkles, Tag } from "lucide-react";
import { fetchChainDealsInGroups, dealPriceText, multiBuyText } from "@/lib/chainDeals";
import ChainLogo from "@/components/ChainLogo";
import { useT } from "@/lib/i18n";

// מבצעים אמיתיים מהרשתות — מתוך קבצי השקיפות הרשמיים, מתעדכנים כל בוקר.
export default function CouponsDeals({ open, onOpenChange, items, onAddProduct }) {
  const t = useT();
  const [tab, setTab] = useState("mine");
  const [query, setQuery] = useState("");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");

  const signature = useMemo(
    () => (items || []).map(item => `${item.name}|${item.barcode || ""}`).join(";"),
    [items]
  );

  const load = useCallback(async (which, searchTerm) => {
    setDeals([]);
    setLoading(true);
    try {
      const payload = searchTerm ? { mode: "search", query: searchTerm }
        : which === "popular" ? { mode: "popular" }
          : { mode: "items", items: (items || []).filter(item => item?.name).map(item => ({ name: item.name, barcode: item.barcode || "" })) };
      if (!searchTerm && which !== "popular" && !payload.items.length) return;
      await fetchChainDealsInGroups(payload, setDeals);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    if (!open) return;
    setSearched("");
    setQuery("");
    load(tab, "");
  }, [open, tab, signature]);

  const handleSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2) return;
    setSearched(term);
    load(null, term);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-lg flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Tag className="h-5 w-5 text-market-pink" />{t("deals.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex shrink-0 gap-2">
          <button onClick={() => setTab("mine")}
            className={`h-10 flex-1 rounded-2xl border-2 text-[14px] font-black ${tab === "mine" && !searched ? "border-market-ink bg-market-pink text-white" : "border-market-ink/30 bg-background text-market-ink"}`}>
            {t("deals.mine")}
          </button>
          <button onClick={() => setTab("popular")}
            className={`h-10 flex-1 rounded-2xl border-2 text-[14px] font-black ${tab === "popular" && !searched ? "border-market-ink bg-market-yellow text-market-ink" : "border-market-ink/30 bg-background text-market-ink"}`}>
            {t("deals.popular")}
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex shrink-0 gap-2">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("deals.searchPlaceholder")}
            className="h-11 rounded-2xl border-2 border-market-ink/30 text-base" />
          <Button type="submit" className="h-11 rounded-2xl bg-market-blue px-4 font-black text-white hover:bg-market-blue">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex-1 space-y-2 overflow-y-auto pb-2">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-market-ink">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-bold">{t("deals.loading")}</span>
            </div>
          )}

          {!loading && deals.length === 0 && (
            <p className="rounded-2xl bg-market-track px-4 py-8 text-center text-[15px] font-black text-market-ink">
              {searched ? t("deals.noSearch", { name: searched }) : t("deals.empty")}
            </p>
          )}

          {!loading && deals.map((deal, index) => (
            <div key={`${deal.chain}-${deal.barcode}-${index}`} className="flex items-center gap-3 rounded-2xl border-2 border-market-ink/20 bg-card p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-black text-market-ink">{deal.name || deal.barcode}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                  <ChainLogo name={deal.chain_name} size={14} />{deal.chain_name}
                  {deal.ends_on ? ` · ${t("deals.ends", { date: deal.ends_on })}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-market-pink px-2 py-0.5 text-[13px] font-black text-white">{dealPriceText(deal)}</span>
                  {deal.price > 0 && !multiBuyText(deal) && (
                    <span className="text-[12px] font-bold text-muted-foreground line-through">₪{Number(deal.price).toFixed(2)}</span>
                  )}
                  {deal.discount > 0 && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[12px] font-black text-primary">-{deal.discount}%</span>}
                  {deal.description && multiBuyText(deal) && <span className="truncate text-[12px] font-bold text-muted-foreground">{deal.description}</span>}
                </div>
              </div>
              {onAddProduct && (
                <button onClick={() => onAddProduct({ name: deal.name || deal.barcode, barcode: deal.barcode, price: deal.deal_price || 0, category: "אחר", image_url: "" })}
                  aria-label={t("deals.addToList")} title={t("deals.addToList")}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-market-yellow text-market-ink">
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}

          <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-[11px] font-bold text-muted-foreground">
            <Sparkles className="h-3 w-3" />{t("deals.updated")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}