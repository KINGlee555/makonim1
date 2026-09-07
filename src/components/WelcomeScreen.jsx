import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadLocalName } from "@/lib/userName";
import { useT } from "@/lib/i18n";

export default function WelcomeScreen({ onNameSubmit }) {
  const t = useT();
  const [name, setName] = useState(loadLocalName());

  const handleSubmit = () => {
    if (!name.trim()) return;
    onNameSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background px-6 text-center">
      <div className="w-full max-w-sm">
        <img
          src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/2d1599b0e_IMG_0820.jpeg"
          alt="MaKonim"
          className="h-28 w-auto object-contain mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("welcome.title")}</h1>
        <p className="text-muted-foreground text-lg mb-8">{t("welcome.subtitle")}</p>

        <div className="space-y-4">
          <Input
            placeholder={t("welcome.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-14 rounded-2xl text-lg text-center"
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full h-14 rounded-2xl text-lg"
          >
            {t("welcome.start")}
          </Button>
        </div>
      </div>
    </div>
  );
}