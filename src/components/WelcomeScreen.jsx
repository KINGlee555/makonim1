import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadLocalName } from "@/lib/userName";
import { useT } from "@/lib/i18n";
import PosterPage from "@/components/poster/PosterPage";
import CatalogTrust from "@/components/CatalogTrust";

// מסך הפתיחה בשפת כרזת השוק: שלוש הבטחות בכרטיסי כרזה ממוספרים,
// ומתחת כרטיס עם השם — ומשם ממשיכים ישר לרשימה.
export default function WelcomeScreen({ onNameSubmit }) {
  const t = useT();
  const [name, setName] = useState(loadLocalName());

  const handleSubmit = () => {
    if (!name.trim()) return;
    onNameSubmit(name.trim());
  };

  return (
    <PosterPage title={t("welcome.title")} subtitle={t("welcome.subtitle")} back="/" backLabel="MaKonim">
      <CatalogTrust />

      <h2 className="pst-h2">{t("welcome.band")}</h2>
      <div className="pst-cards">
        {[t("welcome.p1"), t("welcome.p2"), t("welcome.p3")].map((line, index) => (
          <div key={line} className="pst-why">
            <span className="pst-why-n">{index + 1}</span>
            <p className="min-w-0">{line}</p>
          </div>
        ))}
      </div>

      <div className="pst-panel mx-auto mt-7 w-full max-w-md">
        <Input
          placeholder={t("welcome.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="h-14 text-center text-lg"
          maxLength={64}
          autoFocus
        />
        <Button onClick={handleSubmit} disabled={!name.trim()} className="mt-4 h-14 w-full text-lg font-black">
          {t("welcome.start")}
        </Button>
      </div>
    </PosterPage>
  );
}