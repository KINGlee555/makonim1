import { BadgeCheck, MapPin, Plus } from "lucide-react";

export default function NearbyDealCard({ deal, onAdd }) {
  return (
    <article className="rounded-2xl border border-primary/10 bg-card p-3 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-bold text-foreground">{deal.product_name}</h3>
          <p className="truncate text-sm text-muted-foreground">{deal.supermarket} · {deal.distance_km.toFixed(1)} ק״מ</p>
        </div>
        <button onClick={() => onAdd({ name: deal.product_name, price: deal.sale_price, category: "אחר" })} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-label={`הוסף ${deal.product_name}`}>
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div><span className="text-xl font-bold text-primary">₪{deal.sale_price.toFixed(2)}</span><span className="mr-2 text-sm text-muted-foreground line-through">₪{deal.regular_price.toFixed(2)}</span></div>
        <span className="text-xs font-medium text-muted-foreground">{deal.open_on_saturday ? deal.saturday_hours : "סגור בשבת"}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-2 text-xs font-medium">
        <a href={deal.google_business_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary"><MapPin className="h-3.5 w-3.5" />פרטי העסק ב-Google</a>
        <a href={deal.offer_source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary"><BadgeCheck className="h-3.5 w-3.5" />מקור המבצע</a>
      </div>
    </article>
  );
}