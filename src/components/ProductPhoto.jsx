import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getSpecificProductImage } from "@/lib/productImages";
import { detectBrand, pickBestPhoto } from "@/lib/productPhotoMatch";
import { searchRemoteCatalog } from "@/lib/remoteProductCatalog";
import { getCachedPhoto, cachePhoto, isPhotoMiss, cachePhotoMiss, isBrokenPhoto, markPhotoBroken } from "@/lib/photoCache";
import { photoByBarcode } from "@/lib/barcodePhotos";
import { chainPhotoUrl } from "@/lib/chainPhotos";
import { ShoppingBasket } from "lucide-react";

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

// תמונה שנשמרה בקטלוג לפי הברקוד של המוצר עצמו — התאמה מדויקת, בלי ניחושים
const barcodePhotos = new Map();

async function photoForBarcode(barcode) {
  if (!barcode) return "";
  const key = String(barcode);
  if (barcodePhotos.has(key)) return barcodePhotos.get(key);
  let image = "";
  try {
    const rows = await base44.entities.CatalogProduct.filter({ barcode: key, image_url: { $ne: "" } }, "-created_date", 1);
    image = rows?.[0]?.image_url || "";
  } catch {
    image = "";
  }
  barcodePhotos.set(key, image);
  return image;
}

// תמונה שלא נטענה בעבר לא מוצגת שוב — עדיף אייקון נקי מאשר תמונה שבורה
function usable(url, avoid) {
  return Boolean(url) && url !== avoid && !isBrokenPhoto(url);
}

// תמונה אמיתית של המוצר: קודם לפי הברקוד (אותו מוצר בדיוק), ואם אין — חיפוש בקטלוג לפי שם.
async function findRealPhoto(name, brand, barcode, avoid = "") {
  const exact = await photoForBarcode(barcode);
  if (usable(exact, avoid)) {
    cachePhoto(name, exact);
    return exact;
  }

  // התמונה של הברקוד הזה במאגרים הפתוחים — המוצר עצמו, לא ניחוש לפי שם
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

// מציג תמונה אמיתית של המוצר עצמו: התמונה ששמורה על המוצר, תמונה שכבר נמצאה לשם הזה,
// תמונה מדויקת לפי ברקוד, או התאמה ממותגת מהקטלוג. תמונה שלא נטענת מוחלפת בתמונה אחרת,
// ואם אין תמונה אמיתית בכלל — מוצג האייקון של המוצר, אף פעם לא מלבן ריק.
export default function ProductPhoto({ name, category, imageUrl, brand: brandProp, barcode, className = "", onFound, lookup = true }) {
  const brand = brandProp || detectBrand(name);
  // תמונת רפרנס כללית (עגבנייה, לחם) רק למוצר כללי בלי מותג ובלי ברקוד —
  // מוצר ממותג מקבל תמונה אמיתית שלו עצמו או כלום, אף פעם לא תמונה של מוצר אחר
  const typePhoto = brand || barcode ? "" : getSpecificProductImage(name);
  const known = useRef(getCachedPhoto(name));
  const found = useRef(onFound);
  found.current = onFound;
  // תמונת הרשת של המוצר לפי הברקוד — נטענת מיד, בלי לחכות לחיפוש
  const chainPhoto = barcode ? chainPhotoUrl(barcode) : "";
  const usableChain = usable(chainPhoto, "");
  const [src, setSrc] = useState(usable(imageUrl, "") ? imageUrl : known.current || (usableChain ? chainPhoto : "") || typePhoto);

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

    if (usableChain) {
      setSrc(chainPhoto);
      return () => { cancelled = true; };
    }

    setSrc(typePhoto);
    if (!lookup || (!name && !barcode) || missedNow.has(name) || isPhotoMiss(name)) return () => { cancelled = true; };

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
  }, [name, imageUrl, brand, barcode, typePhoto, lookup, chainPhoto, usableChain]);

  // תמונה שלא נטענה — נזכור אותה וננסה למצוא תמונה אמיתית אחרת לאותו מוצר
  const recover = (failed) => {
    markPhotoBroken(failed, name);
    if (!lookup) { setSrc(typePhoto || ""); return; }
    limitLookup(() => findRealPhoto(name, brand, barcode, failed))
      .then(alternate => setSrc(alternate || typePhoto || ""))
      .catch(() => setSrc(typePhoto || ""));
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