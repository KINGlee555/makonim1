import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadLocalName } from "@/lib/userName";
import { useT } from "@/lib/i18n";
import AppFooter from "@/components/AppFooter";

export default function WelcomeScreen({ onNameSubmit }) {
  const t = useT();
  const [name, setName] = useState(loadLocalName());

  const handleSubmit = () => {
    if (!name.trim()) return;
    onNameSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-secondary/30 px-6 py-10 text-center">
      <div className="min-h-full flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-card border border-primary/15 rounded-3xl p-7 sm:p-9 shadow-xl shadow-primary/10">
            <img
              src="https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/2d1599b0e_IMG_0820.jpeg"
              alt="MaKonim"
              className="h-24 w-auto object-contain mx-auto mb-5"
            />
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("welcome.title")}</h1>
            <p className="text-muted-foreground text-lg mb-7 leading-relaxed">{t("welcome.subtitle")}</p>
            <div className="space-y-4">
              <Input
                placeholder={t("welcome.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="h-14 rounded-2xl border-primary/20 bg-secondary/30 text-lg text-center shadow-none"
                maxLength={64}
                autoFocus
              />
              <Button onClick={handleSubmit} disabled={!name.trim()} className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20">
                {t("welcome.start")}
              </Button>
            </div>
          </div>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}