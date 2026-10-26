import { useEffect, useRef, useState } from "react";
import { getSpecificProductImage } from "@/lib/productImages";
import { detectBrand, pickBestPhoto } from "@/lib/productPhotoMatch";
import { searchRemoteCatalog } from "@/lib/remoteProductCatalog";
import { getCachedPhoto, cachePhoto, isPhotoMiss, cachePhotoMiss, isBrokenPhoto, markPhotoBroken } from "@/lib/photoCache";
import { photoByBarcode } from "@/lib/barcodePhotos";
import { ShoppingBasket } from "lucide-react";

// How many image searches run concurrently — a long list fills up fast, without flooding the catalog
const MAX_CONCURRENT = 6;
let activeLookups = 0;
const waitingLookups = [];

// Names we already searched a photo for and didn't find — don't search again in the same session
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

// Photo saved in the catalog by the product's own barcode — exact match, no guessing
const barcodePhotos = new Map();

async function photoForBarcode(barcode) {
  if (!barcode) return "";
  const key = String(barcode);
  if (barcodePhotos.has(key)) return barcodePhotos.get(key);
  let image = "";
  try {
    // TODO: Fetch photo by barcode from your new backend catalog
    // Mocking an empty response for now
    const rows = [];
    image = rows?.[0]?.image_url || "";
  } catch {
    image = "";
  }
  barcodePhotos.set(key, image);
  return image;
}

// A photo that failed to load in the past is not shown again — better a clean icon than a broken image
function usable(url, avoid) {
  return Boolean(url) && url !== avoid && !isBrokenPhoto(url);
}

// Real product photo: first by barcode (the exact same product), and if not — search the catalog by name.
async function findRealPhoto(name, brand, barcode, avoid = "") {
  const exact = await photoForBarcode(barcode);
  if (usable(exact, avoid)) {
    cachePhoto(name, exact);
    return exact;
  }

  // The photo for this barcode in open databases — the product itself, not a guess by name
  const fromDatabases = await photoByBarcode(barcode);
  if (usable(fromDatabases, avoid)) {
    cachePhoto(name, fromDatabases);
    return fromDatabases;
  }

  const queries = [name];
  if (brand) {
    const withoutNumbers = String(name || "").replace(/[\d%.,]+/g, " ").replace(/\s+/g, " ").trim();
    if (withoutNumbers && withoutNumbers !== name) queries.push(withoutNumbers);
    queries.push(brand);
  }
  for (const query of queries) {
    const products = await searchRemoteCatalog(query || "");
    const match = pickBestPhoto(products, name);
    if (usable(match?.image_url, avoid)) {
      cachePhoto(name, match.image_url);
      return match.image_url;
    }
  }
  return "";
}

// Displays a real photo of the product itself: the photo saved on the product, a photo already found for this name,
// an exact match by barcode, or a branded match from the catalog. A photo that doesn't load is replaced with another,
// and if there's no real photo at all — the product's icon is shown, never an empty rectangle.
export default function ProductPhoto({ name, category, imageUrl, brand: brandProp, barcode, className = "", onFound }) {
  const brand = brandProp || detectBrand(name);
  const keywordPhoto = brand ? "" : getSpecificProductImage(name);
  const known = useRef(getCachedPhoto(name));
  const found = useRef(onFound);
  found.current = onFound;
  const [src, setSrc] = useState(usable(imageUrl, "") ? imageUrl : known.current || keywordPhoto);

  useEffect(() => {
    let cancelled = false;

    if (usable(imageUrl, "")) {
      setSrc(imageUrl);
      return () => { cancelled = true; };
    }

    const remembered = getCachedPhoto(name);
    if (remembered) {
      setSrc(remembered);
      return () => { cancelled = true; };
    }

    setSrc(keywordPhoto);
    if ((!name && !barcode) || missedNow.has(name) || isPhotoMiss(name)) return () => { cancelled = true; };

    limitLookup(() => findRealPhoto(name, brand, barcode)).then(real => {
      if (cancelled) return;
      if (real) {
        setSrc(real);
        found.current?.(real);
        return;
      }
      missedNow.add(name);
      cachePhotoMiss(name);
    }).catch(() => {
      missedNow.add(name);
    });

    return () => { cancelled = true; };
  }, [name, imageUrl, brand, barcode, keywordPhoto]);

  // A photo that failed to load — we'll remember it and try to find another real photo for the same product
  const recover = (failed) => {
    markPhotoBroken(failed, name);
    limitLookup(() => findRealPhoto(name, brand, barcode, failed))
        .then(alternate => setSrc(alternate || keywordPhoto || ""))
        .catch(() => setSrc(keywordPhoto || ""));
  };

  if (!src) {
    return (
        <div className={`photo-tile flex items-center justify-center bg-market-surface ${className}`} role="img" aria-label={name}>
          <ShoppingBasket className="h-[38%] w-[38%] text-market-ink/25" strokeWidth={1.6} />
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
            if (event.currentTarget.naturalWidth < 60 || event.currentTarget.naturalHeight < 60) recover(src);
          }}
          onError={() => recover(src)}
      />
  );
}