import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadLocalName } from "@/lib/userName";
import { useT } from "@/lib/i18n";
import AppFooter from "@/components/AppFooter";
import WelcomeMosaic from "@/components/WelcomeMosaic";

export default function WelcomeScreen({ onNameSubmit }) {
  const t = useT();
  const [name, setName] = useState(loadLocalName());

  const handleSubmit = () => {
    if (!name.trim()) return;
    onNameSubmit(name.trim());
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#F4EFE7]">
      <div className="relative min-h-full">
        <WelcomeMosaic />

        <div className="relative flex min-h-full flex-col justify-end px-3 pb-6 pt-[46vh]">
          <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white px-6 py-8 text-center shadow-2xl shadow-[#0F3D3E]/25">
            <h1 className="text-3xl font-extrabold leading-tight text-[#0F3D3E]">{t("welcome.title")}</h1>
            <p className="mx-auto mt-3 max-w-sm text-lg leading-relaxed text-[#0F3D3E]/60">{t("welcome.subtitle")}</p>

            <div className="mt-7 space-y-4">
              <Input
                placeholder={t("welcome.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="h-14 rounded-2xl border-2 border-[#23BFB0]/25 bg-white text-center text-lg shadow-none placeholder:text-[#0F3D3E]/40"
                maxLength={64}
                autoFocus
              />
              <Button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="h-14 w-full rounded-2xl bg-[#23BFB0] text-lg font-bold text-white shadow-lg shadow-[#23BFB0]/30 hover:bg-[#1FAEA0]"
              >
                {t("welcome.start")}
              </Button>
            </div>

            <AppFooter />
          </div>
        </div>
      </div>
    </div>
  );
}