import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingCart } from "lucide-react";
import WelcomeScreen from "../components/WelcomeScreen";

export default function Home() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | welcome | redirecting

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const me = await base44.auth.me();
      if (!me.full_name) {
        setStatus("welcome");
      } else {
        await goToList(me);
      }
    } catch {
      setStatus("welcome");
    }
  };

  const goToList = async (me) => {
    setStatus("redirecting");
    const allLists = await base44.entities.ShoppingList.list("-created_date", 50);
    const myLists = allLists.filter(
      l => l.created_by === me.email || (l.shared_with || []).includes(me.email)
    );

    if (myLists.length > 0) {
      navigate(`/list/${myLists[0].id}`, { replace: true });
    } else {
      const shareCode = Math.random().toString(36).substring(2, 10);
      const newList = await base44.entities.ShoppingList.create({
        title: "הרשימה שלנו",
        shared_with: [],
        share_code: shareCode
      });
      navigate(`/list/${newList.id}`, { replace: true });
    }
  };

  const handleNameSubmit = async (name) => {
    try {
      await base44.auth.updateMe({ full_name: name });
    } catch {}
    const me = await base44.auth.me().catch(() => ({ email: "", full_name: name }));
    await goToList(me);
  };

  if (status === "welcome") {
    return <WelcomeScreen onNameSubmit={handleNameSubmit} />;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-primary-foreground animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground">טוען...</p>
      </div>
    </div>
  );
}