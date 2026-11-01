import { useEffect, useRef, useState } from "react";
import { chainPhotoUrl } from "@/lib/chainPhotos";
import { fastImageUrl } from "@/lib/imageUrl";
import { getCachedPhoto, cachePhoto, isBrokenPhoto, markPhotoBroken } from "@/lib/photoCache";
import { getSpecificProductImage } from "@/lib/productImages";
import { productPhotoCandidates } from "@/lib/productPhotoQueue";

const generic = url => /images\.(pexels|unsplash)\.com/.test(url || "");
export default function useProductPhoto({ name, barcode, imageUrl, onFound, lookup = true }) {
  const identity = String(barcode || name || "");
  const [extra, setExtra] = useState({ identity: "", urls: [] });
  const [failed, setFailed] = useState({ identity: "", urls: [] });
  const callback = useRef(onFound);
  callback.current = onFound;
  const stored = imageUrl || "";
  const remembered = getCachedPhoto(identity);
  const retailer = barcode ? chainPhotoUrl(barcode) : "";
  const type = !barcode ? getSpecificProductImage(name) : "";
  const sources = [...new Set([
    remembered, !generic(stored) && stored, retailer,
    ...(extra.identity === identity ? extra.urls : []), stored, type
  ].filter(Boolean))];
  const candidates = [...new Set(sources.flatMap(url => [fastImageUrl(url, 240), url]))];
  const rejected = failed.identity === identity ? failed.urls : [];
  const src = candidates.find(url => !rejected.includes(url) && !isBrokenPhoto(url)) || "";
  const needsLookup = lookup && (!src || generic(src));
  useEffect(() => {
    if (!needsLookup || !identity) return;
    let alive = true;
    productPhotoCandidates({ name, barcode }).then(urls => {
      if (alive) setExtra({ identity, urls });
    });
    return () => { alive = false; };
  }, [identity, name, barcode, needsLookup]);
  const recover = () => {
    if (!src) return;
    markPhotoBroken(src, identity);
    setFailed(previous => ({ identity, urls: [...(previous.identity === identity ? previous.urls : []), src] }));
  };
  const loaded = () => {
    if (!src || generic(src)) return;
    cachePhoto(identity, src);
    if (src !== imageUrl) callback.current?.(src);
  };
  return { src, recover, loaded };
}