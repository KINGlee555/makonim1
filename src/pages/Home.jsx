import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingCart } from "lucide-react";
import WelcomeScreen from "../components/WelcomeScreen";
import { loadLocalName, saveLocalName } from "@/lib/userName";
import { findIdentity } from "@/lib/memberIdentity";
import { lastListId } from "@/lib/lastList";
import { useT } from "@/lib/i18n";

export default function Home() {
  const navigate = useNavigate();
  const t = useT();
  const [status, setStatus] = useState("loading");

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const me = await base44.auth.me();
      if (!me.full_name) {
        const localName = loadLocalName();
        if (localName) {
          await base44.auth.updateMe({ full_name: localName });
          const restored = await base44.auth.me();
          await goToList(restored);
        } else {
          setStatus("welcome");
        }
      } else {
        saveLocalName(me.full_name);
        await goToList(me);
      }
    } catch {
      setStatus("welcome");
    }
  };

  const goToList = async (me) => {
    setStatus("redirecting");
    // קודם כל הרשימה שנשמרה במכשיר הזה — כך תמיד חוזרים לאותה רשימה,
    // גם בלי חשבון, וכל אחד מקבל רשימה משלו.
    const savedId = lastListId();
    if (savedId) {
      try {
        await base44.entities.ShoppingList.get(savedId);
        navigate(`/list/${savedId}`, { replace: true });
        return;
      } catch {}
    }
    // הזהות: שם אחד תמיד חוזר לאותה רשימה — גם במכשיר חדש, וגם ממייל שהוזמן לרשימה
    const identity = await findIdentity({
      name: me.full_name || loadLocalName(),
      email: me.email,
    }).catch(() => null);
    if (identity?.list_id) {
      try {
        await base44.entities.ShoppingList.get(identity.list_id);
        navigate(`/list/${identity.list_id}`, { replace: true });
        return;
      } catch {}
    }
    const allLists = await base44.entities.ShoppingList.list("-created_date", 50);
    // הרשימה שלי: מה שרשום על שמי, מה ששיתפתי, או רשימה שנוצרה לפני שנשמר הבעלים —
    // כדי לחזור תמיד לאותה רשימה משותפת במקום לפתוח רשימה חדשה בכל כניסה
    const myLists = !me.email ? [] : allLists.filter(l =>
      l.owner_email === me.email ||
      l.created_by === me.email ||
      (l.shared_with || []).includes(me.email) ||
      !l.created_by || l.created_by === "anonymous"
    );
    if (myLists.length > 0) {
      const favoriteList = myLists.find(l => l.is_favorite);
      const ownedList = myLists.find(l => l.owner_email === me.email || l.created_by === me.email);
      const targetList = favoriteList || ownedList || myLists[0];
      navigate(`/list/${targetList.id}`, { replace: true });
    } else {
      const shareCode = Math.random().toString(36).substring(2, 10);
      const newList = await base44.entities.ShoppingList.create({
        title: "הרשימה שלנו",
        shared_with: [],
        share_code: shareCode,
        ...(me.email ? { owner_email: me.email } : {})
      });
      navigate(`/list/${newList.id}`, { replace: true });
    }
  };

  const handleNameSubmit = async (name) => {
    saveLocalName(name);
    try { await base44.auth.updateMe({ full_name: name }); } catch {}
    const me = await base44.auth.me().catch(() => ({ email: "", full_name: name }));
    await goToList(me);
  };

  if (status === "welcome") return <WelcomeScreen onNameSubmit={handleNameSubmit} />;

  return (
    <div dir="rtl" className="pst-page pst-inner flex min-h-screen items-center justify-center px-4">
      <div className="pst-panel flex items-center gap-4">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full border border-pst-ink bg-pst-yellow">
          <ShoppingCart className="h-7 w-7 animate-pulse" />
        </span>
        <p className="text-lg font-black">{t("app.loading")}</p>
      </div>
    </div>
  );
}