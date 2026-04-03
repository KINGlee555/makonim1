import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JoinList() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, joining, success, error, already
  const [listTitle, setListTitle] = useState("");

  useEffect(() => {
    joinList();
  }, [shareCode]);

  const joinList = async () => {
    const me = await base44.auth.me();
    const lists = await base44.entities.ShoppingList.filter({ share_code: shareCode });
    
    if (lists.length === 0) {
      setStatus("error");
      return;
    }

    const list = lists[0];
    setListTitle(list.title);

    // Check if already a member
    if (list.created_by === me.email || (list.shared_with || []).includes(me.email)) {
      setStatus("already");
      setTimeout(() => navigate(`/list/${list.id}`), 1500);
      return;
    }

    // Check if list is full
    if ((list.shared_with || []).length >= 5) {
      setStatus("full");
      return;
    }

    setStatus("joining");
    const updated = [...(list.shared_with || []), me.email];
    await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    setStatus("success");
    setTimeout(() => navigate(`/list/${list.id}`), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-primary-foreground" />
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">מחפש את הרשימה...</p>
          </>
        )}

        {status === "joining" && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">מצטרף לרשימה...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">הצטרפת בהצלחה!</h2>
            <p className="text-xl text-muted-foreground">לרשימה "{listTitle}"</p>
          </>
        )}

        {status === "already" && (
          <>
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">את/ה כבר ברשימה!</h2>
            <p className="text-xl text-muted-foreground">מעביר לרשימה "{listTitle}"...</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">הרשימה לא נמצאה</h2>
            <p className="text-lg text-muted-foreground mb-6">ייתכן שהקישור שגוי</p>
            <Button onClick={() => navigate("/")} className="h-14 px-8 rounded-2xl text-lg">
              חזרה לדף הבית
            </Button>
          </>
        )}

        {status === "full" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">הרשימה מלאה</h2>
            <p className="text-lg text-muted-foreground mb-6">ניתן לשתף עד 5 אנשים</p>
            <Button onClick={() => navigate("/")} className="h-14 px-8 rounded-2xl text-lg">
              חזרה לדף הבית
            </Button>
          </>
        )}
      </div>
    </div>
  );
}