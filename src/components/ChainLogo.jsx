import { getChainLogo } from "@/lib/chainLogos";

export default function ChainLogo({ name, size = 18, className = "" }) {
  const { bg, initials } = getChainLogo(name || "");
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