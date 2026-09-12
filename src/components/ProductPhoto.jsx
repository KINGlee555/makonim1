import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { getProductImageUrl } from "@/lib/productImages";
import { normalizeProductText } from "@/lib/productSearch";
import { searchRemoteCatalog } from "@/lib/remoteProductCatalog";

export default function ProductPhoto({ name, category, imageUrl, className = "" }) {
  const fallbackUrl = getProductImageUrl(name, category);
  const [src, setSrc] = useState(imageUrl || fallbackUrl || "");
  const [failed, setFailed] = useState(false);
  const [checking, setChecking] = useState(!imageUrl && !fallbackUrl);
  const [triedRemote, setTriedRemote] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const initial = imageUrl || fallbackUrl || "";
    setSrc(initial);
    setFailed(false);
    setChecking(!initial);
    setTriedRemote(!initial);
    if (!initial && name) {
      searchRemoteCatalog(name).then(products => {
        if (cancelled) return;
        const target = normalizeProductText(name);
        const match = products.find(product => normalizeProductText(product.name) === target) || products[0];
        if (match?.image_url) setSrc(match.image_url);
        else setFailed(true);
      }).finally(() => { if (!cancelled) setChecking(false); });
    }
    return () => { cancelled = true; };
  }, [name, imageUrl, fallbackUrl]);

  if (checking) return <div className={`shimmer bg-muted ${className}`} role="img" aria-label={`טוען תמונה עבור ${name}`} />;

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-secondary text-primary ${className}`} role="img" aria-label={name}>
        <Package className="h-7 w-7" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`object-cover ${className}`}
      loading="lazy"
      decoding="async"
      onLoad={(event) => {
        if (event.currentTarget.naturalWidth < 80 || event.currentTarget.naturalHeight < 80) setFailed(true);
      }}
      onError={() => {
        if (src !== fallbackUrl && fallbackUrl) {
          setSrc(fallbackUrl);
        } else if (!triedRemote && name) {
          setTriedRemote(true);
          setChecking(true);
          searchRemoteCatalog(name).then(products => {
            const target = normalizeProductText(name);
            const alternate = products.find(product => normalizeProductText(product.name) === target && product.image_url !== src)
              || products.find(product => product.image_url !== src);
            if (alternate?.image_url) { setSrc(alternate.image_url); setFailed(false); }
            else setFailed(true);
          }).finally(() => setChecking(false));
        } else {
          setFailed(true);
        }
      }}
    />
  );
}