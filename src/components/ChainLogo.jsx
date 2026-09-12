import { useState } from "react";
import { getChainLogo } from "@/lib/chainLogos";

export default function ChainLogo({ name, size = 18, className = "" }) {
  const { bg, initials, logo } = getChainLogo(name || "");
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <span
        style={{ width: size * 1.6, height: size }}
        className={`inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5 shadow-sm ${className}`}
      >
        <img src={logo} alt={name} className="h-full w-full object-contain" loading="lazy" onError={() => setFailed(true)} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: bg, width: size, height: size, fontSize: size * 0.5 }}
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-md font-bold leading-none text-white shadow-sm ${className}`}
    >
      {initials}
    </span>
  );
}