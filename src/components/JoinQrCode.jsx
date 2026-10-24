import { useState } from "react";
import { useT } from "@/lib/i18n";

// קוד QR לקישור ההצטרפות — סורקים מהטלפון השני ומצטרפים לרשימה.
// אם תמונת הקוד לא נטענת, הקישור והכפתורים שמעליה נשארים הדרך להצטרף.
export default function JoinQrCode({ url }) {
  const t = useT();
  const [failed, setFailed] = useState(false);
  if (!url || failed) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(url)}`}
        alt={t("share.qrAlt")}
        width={160}
        height={160}
        onError={() => setFailed(true)}
        className="h-40 w-40 rounded-2xl border border-border bg-white p-1"
      />
      <p className="text-center text-xs text-muted-foreground">{t("share.qrHint")}</p>
    </div>
  );
}