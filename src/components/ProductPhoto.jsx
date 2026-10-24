import { useEffect, useRef, useState } from "react";
import { getSpecificProductImage } from "@/lib/productImages";
import { detectBrand, pickBestPhoto } from "@/lib/productPhotoMatch";
import { searchRemoteCatalog } from "@/lib/remoteCatalog";
import { getCachedPhoto, cachePhoto, isPhotoMiss, cachePhotoMiss } from "@/lib/photoCache";
import { getProductEmoji } from "@/lib/productEmoji";

// כמה חיפושי תמונה רצים במקביל — רשימה ארוכה מתמלאת מהר, בלי להציף את הקטלוג
const MAX_CONCURRENT = 6;
let activeLookups = 0;
const waitingLookups = [];

// שמות שכבר חיפשנו להם תמונה ולא נמצאה — לא מחפשים שוב באותה פתיחה
const missedNow = new Set();

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
// falls back to a generic look-alike picture — עד שנמצא הצילום האמיתי הוא מציג את האייקון
// של המוצר עצמו, כדי שאף כרטיס לא יישאר ריק בזמן החיפוש.
export default function ProductPhoto({ name, category, imageUrl, brand: brandProp, className = "", onFound }) {
  const brand = brandProp || detectBrand(name);
  const keywordPhoto = brand ? "" : getSpecificProductImage(name);
  const known = useRef(getCachedPhoto(name));
  const found = useRef(onFound);
  found.current = onFound;
  const [src, setSrc] = useState(imageUrl || known.current || keywordPhoto);

  useEffect(() => {
    let cancelled = false;

    if (imageUrl) {
      setSrc(imageUrl);
      return () => { cancelled = true; };
    }

    const remembered = getCachedPhoto(name);
    if (remembered) {
      setSrc(remembered);
      return () => { cancelled = true; };
    }

    setSrc(keywordPhoto);
    if (!name || missedNow.has(name) || isPhotoMiss(name)) return () => { cancelled = true; };

    limitLookup(() => findRealPhoto(name, brand)).then(real => {
      if (cancelled) return;
      if (real) setSrc(real);
      else { missedNow.add(name); cachePhotoMiss(name); }
      if (real) found.current?.(real);
    }).catch(() => {
      missedNow.add(name);
    });

    return () => { cancelled = true; };
  }, [name, imageUrl, brand, keywordPhoto]);

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
          const fallback = keywordPhoto || "";
          if (alternate && alternate !== src) setSrc(alternate);
          else { missedNow.add(name); cachePhotoMiss(name); setSrc(fallback); }
        }).catch(() => setSrc(keywordPhoto || ""));
      }}
    />
  );
}