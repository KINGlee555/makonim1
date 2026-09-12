import { useState } from "react";
import { Package } from "lucide-react";
import { getProductImageUrl } from "@/lib/productImages";

export default function ProductPhoto({ name, category, imageUrl, className = "" }) {
  const fallbackUrl = getProductImageUrl(name, category);
  const [src, setSrc] = useState(imageUrl || fallbackUrl || "");
  const [failed, setFailed] = useState(false);

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
      onError={() => {
        if (src !== fallbackUrl && fallbackUrl) setSrc(fallbackUrl);
        else setFailed(true);
      }}
    />
  );
}