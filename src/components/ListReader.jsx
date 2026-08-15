import { useState, useRef } from "react";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRead}
      className="gap-2 text-muted-foreground"
      disabled={items.filter(i => i.status !== "bought").length === 0}
    >
      {reading ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      {reading ? t("reader.stop") : t("reader.read")}
    </Button>
  );
}