import { useState } from "react";

// בקשת האישור: השם כבר משויך לרשימה אחת, ולהוסיף אותו לרשימה נוספת
// אפשר רק אחרי שהמשתמש עצמו מאשר.
export default function IdentitySyncPrompt({ conflict, listTitle, onApprove, onDismiss }) {
  const [busy, setBusy] = useState(false);

  const approve = async () => {
    setBusy(true);
    try { await onApprove(); } finally { setBusy(false); }
  };

  return (
    <div className="pst-panel-slot">
      <div className="rounded-2xl border-2 border-pst-ink bg-pst-yellow p-3 text-pst-ink">
        <p className="text-[15px] font-black leading-snug">
          {`השם "${conflict.name}" כבר משויך לרשימה «${conflict.list_title || "אחרת"}».`}
        </p>
        <p className="mt-1 text-[13px] font-bold leading-snug">
          {`כדי להוסיף אותו גם לרשימה «${listTitle || "הזו"}» נדרש האישור שלך. בלי אישור — השם נשאר ברשימה אחת בלבד.`}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={approve}
            disabled={busy}
            className="min-h-[40px] rounded-full border-2 border-pst-ink bg-pst-ink px-4 text-[13px] font-black text-pst-yellow disabled:opacity-60"
          >
            {busy ? "מוסיף…" : "אישור — הוסף אותי גם כאן"}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-[40px] rounded-full border-2 border-pst-ink bg-white/70 px-4 text-[13px] font-black text-pst-ink"
          >
            לא עכשיו
          </button>
        </div>
      </div>
    </div>
  );
}