import { ShoppingBasket } from "lucide-react";
import useProductPhoto from "@/hooks/useProductPhoto";

export default function ProductPhoto({ name, category, imageUrl, brand, barcode, className = "", onFound, lookup = true }) {
  const { src, recover, loaded } = useProductPhoto({ name, barcode, imageUrl, onFound, lookup });
  if (!src) return (
    <div className={`photo-tile flex items-center justify-center bg-market-surface ${className}`} role="img" aria-label={`${name} · תמונה לא זמינה`}>
      <ShoppingBasket className="h-[38%] w-[38%] text-market-ink/25" strokeWidth={1.6} />
    </div>
  );
  return (
    <img key={`${barcode || name}:${src}`} src={src} alt={name} className={`object-contain ${className}`}
      loading="lazy" decoding="async" referrerPolicy="no-referrer" onLoad={loaded} onError={recover} />
  );
}