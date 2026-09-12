import { useMemo, useState } from "react";
import { Loader2, MapPinned, Sparkles } from "lucide-react";
import NearbyDealCard from "@/components/NearbyDealCard";
import NearbyDealsFilters from "@/components/NearbyDealsFilters";
import useNearbyDeals from "@/hooks/useNearbyDeals";

export default function NearbyDeals({ onAddProduct }) {
  const [filter, setFilter] = useState("all");
  const { deals, status, error, load } = useNearbyDeals();
  const visible = useMemo(() => deals.filter(deal => filter === "all" || (filter === "open" ? deal.open_on_saturday : !deal.open_on_saturday)), [deals, filter]);
  const busy = status === "locating" || status === "loading";

  return (
    <section className="mb-5 rounded-2xl border border-primary/10 bg-secondary/40 p-4" aria-labelledby="nearby-deals-title">
      <div className="flex items-start justify-between gap-3">
        <div><h2 id="nearby-deals-title" className="flex items-center gap-2 text-lg font-bold text-foreground"><Sparkles className="h-5 w-5 text-primary" />מבצעים קרובים אליך</h2><p className="mt-1 text-sm text-muted-foreground">עד 5 מוצרים נפוצים עם מבצע ופרטי עסק מאומתים</p></div>
        <button onClick={load} disabled={busy} className="flex h-10 flex-shrink-0 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPinned className="h-4 w-4" />}{busy ? "בודק..." : "מצא"}
        </button>
      </div>
      {error && <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>}
      {status === "done" && deals.length === 0 && <p className="mt-3 text-sm text-muted-foreground">לא נמצאו כרגע מבצעים שאפשר לאמת באזור שלך.</p>}
      {deals.length > 0 && <div className="mt-4 space-y-3"><NearbyDealsFilters value={filter} onChange={setFilter} /><div className="grid gap-3 md:grid-cols-2">{visible.map(deal => <NearbyDealCard key={`${deal.supermarket}-${deal.product_name}`} deal={deal} onAdd={onAddProduct} />)}</div>{visible.length === 0 && <p className="text-sm text-muted-foreground">אין תוצאות מאומתות במסנן הזה.</p>}</div>}
    </section>
  );
}