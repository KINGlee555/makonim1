import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { getProductImageUrl, getSpecificProductImage } from "@/lib/productImages";
import { detectBrand, pickBestPhoto } from "@/lib/productPhotoMatch";
import { searchRemoteCatalog } from "@/lib/remoteProductCatalog";
import { getCachedPhoto, cachePhoto } from "@/lib/photoCache";

// Looks the product up in the barcode catalog; with a named brand it also retries a
// brand-focused query so e.g. "שמנת 15% יטבתה" still lands on the real Yotvata carton.
async function findBrandPhoto(name, brand, excludeUrl = "") {
  const queries = [name];
  if (brand) {
    const withoutNumbers = String(name || "").replace(/[\d%.,]+/g, " ").replace(/\s+/g, " ").trim();
    if (withoutNumbers && withoutNumbers !== name) queries.push(withoutNumbers);
    queries.push(brand);
  }
  for (const query of queries) {
    const products = await searchRemoteCatalog(query || "");
    const match = pickBestPhoto(products, name, excludeUrl);
    if (match?.image_url) {
      cachePhoto(name, match.image_url);
      return match;
    }
  }
  return null;
}

// Photo priority: the product's own catalog photo → the photo already matched for this
// name → a real brand-matched catalog photo → a generic category photo.
export default function ProductPhoto({ name, category, imageUrl, className = "" }) {
  const brand = detectBrand(name);
  const localUrl = brand
    ? getSpecificProductImage(name)
    : getProductImageUrl(name, category);
  const [src, setSrc] = useState(imageUrl || getCachedPhoto(name) || "");
  const [failed, setFailed] = useState(false);
  const [checking, setChecking] = useState(!imageUrl && !src);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    if (imageUrl) {
      setSrc(imageUrl);
      setChecking(false);
      return () => { cancelled = true; };
    }

    const remembered = getCachedPhoto(name);
    if (remembered) {
      setSrc(remembered);
      setChecking(false);
      return () => { cancelled = true; };
    }

    // Not seen before — look for the real product photo in the barcode catalog
    setSrc(localUrl || "");
    setChecking(true);
    findBrandPhoto(name, brand).then(match => {
      if (cancelled) return;
      if (match?.image_url) setSrc(match.image_url);
      else if (!localUrl) setFailed(true);
    }).finally(() => { if (!cancelled) setChecking(false); });

    return () => { cancelled = true; };
  }, [name, imageUrl, localUrl]);

  if (checking && !src) {
    return <div className={`shimmer bg-muted ${className}`} role="img" aria-label={`טוען תמונה עבור ${name}`} />;
  }

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
        if (event.currentTarget.naturalWidth < 60 || event.currentTarget.naturalHeight < 60) setFailed(true);
      }}
      onError={() => {
        const broken = src;
        findBrandPhoto(name, brand, broken).then(alternate => {
          if (alternate?.image_url) setSrc(alternate.image_url);
          else if (localUrl && localUrl !== broken) setSrc(localUrl);
          else setFailed(true);
        }).catch(() => setFailed(true));
      }}
    />
  );
}