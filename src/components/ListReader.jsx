import { useState, useRef } from "react";
import { Volume2, Square } from "lucide-react";
import { useT } from "@/lib/i18n";
import { uiPill } from "@/lib/minimalUi";

export default function ListReader({ items }) {
  const t = useT();
  const [reading, setReading] = useState(false);
  const utteranceRef = useRef(null);

  const handleRead = () => {
    if (reading) {
      window.speechSynthesis.cancel();
      setReading(false);
      return;
    }

    const pending = items.filter(i => i.status !== "bought");
    if (pending.length === 0) return;

    const text = pending
      .map(i => `${i.name} ${i.quantity > 1 ? `${i.quantity} ${t("reader.units")}` : t("reader.oneUnit")}`)
      .join(". ");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "he-IL";
    utterance.rate = 0.9;
    utterance.onend = () => setReading(false);
    utterance.onerror = () => setReading(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setReading(true);
  };

  return (
    <button
      type="button"
      onClick={handleRead}
      disabled={items.filter(i => i.status !== "bought").length === 0}
      className={`${uiPill} inline-flex items-center gap-1.5 disabled:opacity-40`}
    >
      {reading ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {reading ? t("reader.stop") : t("reader.read")}
    </button>
  );
}