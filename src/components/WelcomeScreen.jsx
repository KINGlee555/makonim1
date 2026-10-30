import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { loadLocalName } from "@/lib/userName";
import { useLanguage } from "@/lib/i18n";
import welcomeCopy from "@/lib/locales/welcomeCopy";
import SkipLink from "@/components/SkipLink";
import DarkModeToggle from "@/components/DarkModeToggle";
import SkinToggle from "@/components/SkinToggle";
import AppFooter from "@/components/AppFooter";
import CatalogTrust from "@/components/CatalogTrust";
import "@/styles/welcome.css";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/067697bc9_logo.png";

// מסך הפתיחה: שורה אחת של כותרת, תיבת שם גדולה וכפתור אחד.
// כל מה שלא הכרחי כדי להתחיל לקנות — לא נמצא כאן.
export default function WelcomeScreen({ onNameSubmit }) {
  const { lang } = useLanguage();
  const copy = welcomeCopy[lang] || welcomeCopy.he;
  const [name, setName] = useState(loadLocalName());

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    onNameSubmit(name.trim());
  };

  return (
    <div dir="rtl" className="pst-page pst-inner welcome-page">
      <SkipLink />

      <header className="welcome-top">
        <span className="welcome-logo">
          <img src={LOGO} alt="MaKonim" />
          <span>MaKonim</span>
        </span>
        <div className="welcome-top-acts">
          <SkinToggle className="pst-back" />
          <DarkModeToggle className="pst-back" />
        </div>
      </header>

      <main id="main-content" className="welcome-main">
        <p className="welcome-eyebrow fun-rise">
          <Sparkles className="h-3.5 w-3.5" />
          {copy.eyebrow}
        </p>

        <h1 className="welcome-title fun-rise fun-d1">
          {copy.title1}
          <br />
          <em>{copy.title2}</em>
        </h1>
        <p className="welcome-sub">{copy.sub}</p>

        <form className="welcome-card fun-pop-in fun-d2" onSubmit={handleSubmit}>
          <input
            className="welcome-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.placeholder}
            maxLength={64}
            autoFocus
          />
          <button type="submit" className="welcome-cta" disabled={!name.trim()}>
            {copy.cta}
            <ArrowLeft className="h-5 w-5" />
          </button>
        </form>

        <div className="welcome-chips fun-stagger">
          {copy.chips.map((chip) => (
            <span key={chip} className="welcome-chip">{chip}</span>
          ))}
        </div>

        <div className="welcome-trust">
          <CatalogTrust compact />
        </div>

        <div className="mt-auto pt-6">
          <AppFooter />
        </div>
      </main>
    </div>
  );
}