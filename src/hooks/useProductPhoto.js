import { useEffect, useRef, useState } from "react";
import { chainPhotoUrl } from "@/lib/chainPhotos";
import { fastImageUrl } from "@/lib/imageUrl";
import { getCachedPhoto, cachePhoto, isBrokenPhoto, markPhotoBroken } from "@/lib/photoCache";
import { photoIdentity, exactProductPhoto } from "@/lib/productPhotoIdentity";
import { productPhotoCandidates } from "@/lib/productPhotoQueue";
import { basicProductPhoto, photoBrand } from "@/lib/basicProductPhotos";

export default function useProductPhoto({ name, brand: suppliedBrand, barcode, imageUrl, onFound, lookup = true }) {
  const brand = photoBrand(name, suppliedBrand, barcode);
  const identity = photoIdentity({ name, brand, barcode });
  const basic = basicProductPhoto(name, brand, barcode);
  const [extra, setExtra] = useState({ identity: "", urls: [] });
  const [failed, setFailed] = useState({ identity: "", urls: [] });
  const callback = useRef(onFound);
  const notified = useRef("");
  callback.current = onFound;
  const stored = exactProductPhoto(imageUrl, barcode) || (basic && [basic, fastImageUrl(basic, 240)].includes(imageUrl)) ? imageUrl : "";
  const remembered = getCachedPhoto(identity);
  const retailer = barcode ? chainPhotoUrl(barcode) : "";
  const resolved = extra.identity === identity ? extra.urls : [];
  const sources = [...new Set([stored, basic, remembered, ...resolved, retailer].filter(Boolean))];
  const candidates = [...new Set(sources.flatMap(url => [fastImageUrl(url, 240), url]))];
  const rejected = failed.identity === identity ? failed.urls : [];
  const src = candidates.find(url => !rejected.includes(url) && !isBrokenPhoto(url)) || "";
  // Invalid inherited photos never render, and never suppress the exact-name lookup.
  const hasUsableMatch = [stored, basic, remembered].filter(Boolean).some(url =>
    [fastImageUrl(url, 240), url].some(candidate => !rejected.includes(candidate) && !isBrokenPhoto(candidate)));
  const needsLookup = lookup && !hasUsableMatch;
  useEffect(() => {
    if (!needsLookup || (!barcode && !name)) return;
    let alive = true;
    productPhotoCandidates({ name, brand, barcode }).then(urls => {
      if (alive) setExtra({ identity, urls });
    });
    return () => { alive = false; };
  }, [identity, name, brand, barcode, needsLookup]);
  const recover = () => {
    if (!src) return;
    markPhotoBroken(src, identity);
    setFailed(previous => ({ identity, urls: [...(previous.identity === identity ? previous.urls : []), src] }));
  };
  const loaded = () => {
    if (!src || (!exactProductPhoto(src, barcode) && src !== fastImageUrl(basic, 240) && src !== basic && !resolved.some(url => src === url || src === fastImageUrl(url, 240)) && src !== remembered)) return;
    cachePhoto(identity, src);
    const key = `${identity}|${src}`;
    if (src !== imageUrl && notified.current !== key) {
      notified.current = key;
      callback.current?.(src);
    }
  };
  return { src, recover, loaded };
}