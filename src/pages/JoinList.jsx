import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppFooter from "../components/AppFooter";
import { useT } from "@/lib/i18n";

export default function JoinList() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const [status, setStatus] = useState("loading");
  const [listTitle, setListTitle] = useState("");

  useEffect(() => {
    joinList();
  }, [shareCode]);

  const joinList = async () => {
    let me;
    try {
      me = await base44.auth.me();
    } catch {
      // Not authenticated — redirect to login with returnTo so we come back here
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = '/login?returnTo=' + encodeURIComponent(currentPath);
      return;
    }

    let allLists;
    try {
      allLists = await base44.entities.ShoppingList.list("-created_date", 100);
    } catch {
      setStatus("error");
      return;
    }

    const lists = allLists.filter(l => l.share_code === shareCode);

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
    try {
      await base44.entities.ShoppingList.update(list.id, { shared_with: updated });
    } catch {
      setStatus("error");
      return;
    }
    setStatus("success");
    setTimeout(() => navigate(`/list/${list.id}`), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-primary-foreground" />
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">{t("join.searching")}</p>
          </>
        )}

        {status === "joining" && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">{t("join.joining")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("join.success")}</h2>
            <p className="text-xl text-muted-foreground">{t("join.joinedToList", { title: listTitle })}</p>
          </>
        )}

        {status === "already" && (
          <>
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("join.alreadyIn")}</h2>
            <p className="text-xl text-muted-foreground">{t("join.movingTo", { title: listTitle })}</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("join.notFound")}</h2>
            <p className="text-lg text-muted-foreground mb-6">{t("join.notFoundDesc")}</p>
            <Button onClick={() => navigate("/")} className="h-14 px-8 rounded-2xl text-lg">
              {t("join.backHome")}
            </Button>
          </>
        )}

        {status === "full" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("join.full")}</h2>
            <p className="text-lg text-muted-foreground mb-6">{t("join.fullDesc")}</p>
            <Button onClick={() => navigate("/")} className="h-14 px-8 rounded-2xl text-lg">
              {t("join.backHome")}
            </Button>
          </>
        )}
      </div>
      <AppFooter />
    </div>
  );
}