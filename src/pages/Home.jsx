import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import WelcomeScreen from "../components/WelcomeScreen";
import { loadLocalName, saveLocalName } from "@/lib/userName";
import { useT } from "@/lib/i18n";

export default function Home() {
  const navigate = useNavigate();
  const t = useT();
  const [status, setStatus] = useState("loading");

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      // TODO: Fetch current user from your new backend
      // Mocking user fetch for now. Change to a mock object (e.g., { email: "test@example.com", full_name: "Test" }) to test logged-in flow.
      const me = null;

      if (!me) {
        throw new Error("Not logged in");
      }

      if (!me.full_name) {
        const localName = loadLocalName();
        if (localName) {
          // TODO: Update user name in backend
          const restored = { ...me, full_name: localName };
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

    // TODO: Fetch shopping lists from your new backend
    // Mocking an empty list array
    const allLists = [];

    // My list: what's registered under my name, what I shared, or a list created before the owner was saved —
    // to always return to the same shared list instead of opening a new one every time.
    const myLists = allLists.filter(l =>
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

      // TODO: Create a new shopping list in your backend database
      const newList = {
        id: "mock-list-id",
        title: "הרשימה שלנו",
        shared_with: [],
        share_code: shareCode,
        ...(me.email ? { owner_email: me.email } : {})
      };

      navigate(`/list/${newList.id}`, { replace: true });
    }
  };

  const handleNameSubmit = async (name) => {
    saveLocalName(name);
    try {
      // TODO: Update user's name in your backend database
    } catch {}

    // TODO: Fetch updated user or use mock
    const me = { email: "", full_name: name };
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