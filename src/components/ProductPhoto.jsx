import { useEffect, useRef, useState } from "react";
import { getSpecificProductImage } from "@/lib/productImages";
import { detectBrand, pickBestPhoto } from "@/lib/productPhotoMatch";
import { searchRemoteCatalog } from "@/lib/remoteProductCatalog";
import { getCachedPhoto, cachePhoto } from "@/lib/photoCache";
import { getProductEmoji } from "@/lib/productEmoji";

// כמה חיפושי תמונה רצים במקביל — רשימה ארוכה לא מציפה את הקטלוג
const MAX_CONCURRENT = 3;
let activeLookups = 0;
const waitingLookups = [];

function limitLookup(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      activeLookups += 1;
      task().then(resolve, reject).finally(() => {
        activeLookups -= 1;
        const next = waitingLookups.shift();
        if (next) next();
      });
    };
    if (activeLookups < MAX_CONCURRENT) run(); else waitingLookups.push(run);
  });
}

// Looks the product up in the real barcode catalog; with a brand in the name it retries a
// brand-focused query so e.g. "שמנת 15% יטבתה" still lands on the real Yotvata carton.
async function findRealPhoto(name, brand) {
  const queries = [name];
  if (brand) {
    const withoutNumbers = String(name || "").replace(/[\d%.,]+/g, " ").replace(/\s+/g, " ").trim();
    if (withoutNumbers && withoutNumbers !== name) queries.push(withoutNumbers);
    queries.push(brand);
  }
  for (const query of queries) {
    const products = await searchRemoteCatalog(query || "");
    const match = pickBestPhoto(products, name);
    if (match?.image_url) {
      cachePhoto(name, match.image_url);
      return match.image_url;
    }
  }
  return "";
}

// Shows the real photo of the product itself: the photo saved on the item, a photo already
// matched for this name, or a branded match from the barcode catalog. A branded item never
// falls back to a generic look-alike picture — until its real photo is found (or uploaded)
// it shows the product's own icon instead.
export default function ProductPhoto({ name, category, imageUrl, brand: brandProp, className = "", onFound }) {
  // מוצר עם מותג לא מקבל תמונת קטגוריה — רק התמונה האמיתית של המוצר
  const brand = brandProp || detectBrand(name);
  const keywordPhoto = brand ? "" : getSpecificProductImage(name);
  const known = useRef(getCachedPhoto(name));
  const found = useRef(onFound);
  found.current = onFound;
  const [src, setSrc] = useState(imageUrl || known.current || keywordPhoto);
  const [checking, setChecking] = useState(!imageUrl && !known.current);

  useEffect(() => {
    let cancelled = false;

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

    setSrc(keywordPhoto);
    setChecking(true);
    limitLookup(() => findRealPhoto(name, brand)).then(real => {
      if (cancelled || !real) return;
      setSrc(real);
      found.current?.(real);
    }).finally(() => { if (!cancelled) setChecking(false); });

    return () => { cancelled = true; };
  }, [name, imageUrl, brand, keywordPhoto]);

  if (checking && !src) {
    return <div className={`shimmer bg-muted ${className}`} role="img" aria-label={`טוען תמונה עבור ${name}`} />;
  }

  if (!src) {
    return (
      <div className={`photo-tile flex items-center justify-center bg-market-surface ${className}`} role="img" aria-label={name}>
        <span className="photo-emoji leading-none">{getProductEmoji(name, category)}</span>
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
        if (event.currentTarget.naturalWidth < 60 || event.currentTarget.naturalHeight < 60) setSrc(keywordPhoto || "");
      }}
      onError={() => {
        limitLookup(() => findRealPhoto(name, brand)).then(alternate => {
          if (alternate && alternate !== src) setSrc(alternate);
          else setSrc(keywordPhoto || "");
        }).catch(() => setSrc(keywordPhoto || ""));
      }}
    />
  );
}