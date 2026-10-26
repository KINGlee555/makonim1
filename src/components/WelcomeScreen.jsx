import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadLocalName } from "@/lib/userName";
import { Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import PosterPage from "@/components/poster/PosterPage";

const COLLAGE = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/41f073a97_generated_b58619a5.jpg";

// מסך הפתיחה בשפת כרזת השוק: פס צהוב עם שם האפליקציה, תמונת שוק,
// שלוש הבטחות קצרות ושדה שם — ומתחת הכול ממשיכים לרשימה.
export default function WelcomeScreen({ onNameSubmit }) {
  const t = useT();
  const [name, setName] = useState(loadLocalName());

  const handleSubmit = () => {
    if (!name.trim()) return;
    onNameSubmit(name.trim());
  };

  return (
    <PosterPage title={t("welcome.title")} subtitle={t("welcome.subtitle")} back="/" backLabel="MaKonim">
      <img src={COLLAGE} alt="" className="pst-collage" />

      <div className="pst-panel mx-auto mt-5 w-full max-w-md">
        <ul className="space-y-3">
          {[t("welcome.p1"), t("welcome.p2"), t("welcome.p3")].map(line => (
            <li key={line} className="flex items-start gap-3 text-[15px] font-bold leading-snug">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border-[3px] border-[#0B3A4D] bg-[#FFD400]">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0">{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-4">
          <Input
            placeholder={t("welcome.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-14 text-center text-lg"
            maxLength={64}
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={!name.trim()} className="h-14 w-full text-lg font-black">
            {t("welcome.start")}
          </Button>
        </div>
      </div>
    </PosterPage>
  );
}