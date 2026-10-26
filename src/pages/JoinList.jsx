import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import PosterPage from "@/components/poster/PosterPage";
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
      window.location.href = '/register?returnTo=' + encodeURIComponent(currentPath);
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
    <PosterPage
      icon={Users}
      title="הצטרפות לרשימה"
      subtitle={listTitle ? `הרשימה: ${listTitle}` : t("join.searching")}
      back="/"
    >
      <div className="pst-panel mx-auto w-full max-w-md text-center">
        {(status === "loading" || status === "joining") && (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-[19px] font-black">
              {status === "loading" ? t("join.searching") : t("join.joining")}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12" />
            <h2 className="text-[24px] font-black leading-tight">{t("join.success")}</h2>
            <p className="mt-2 text-[17px] font-bold text-[#0B3A4D]/70">
              {t("join.joinedToList", { title: listTitle })}
            </p>
          </>
        )}

        {status === "already" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12" />
            <h2 className="text-[24px] font-black leading-tight">{t("join.alreadyIn")}</h2>
            <p className="mt-2 text-[17px] font-bold text-[#0B3A4D]/70">
              {t("join.movingTo", { title: listTitle })}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-[24px] font-black leading-tight">{t("join.notFound")}</h2>
            <p className="mt-2 text-[16px] font-bold text-[#0B3A4D]/70">{t("join.notFoundDesc")}</p>
            <Button onClick={() => navigate("/")} className="mt-6 h-14 px-8 text-lg font-black">
              {t("join.backHome")}
            </Button>
            <div className="mt-4">
              <Link to="/demo" className="font-black text-[#0B3A4D] underline decoration-[#FF3B5D] decoration-[3px]">
                {t("join.seeDemo")}
              </Link>
            </div>
          </>
        )}

        {status === "full" && (
          <>
            <h2 className="text-[24px] font-black leading-tight">{t("join.full")}</h2>
            <p className="mt-2 text-[16px] font-bold text-[#0B3A4D]/70">{t("join.fullDesc")}</p>
            <Button onClick={() => navigate("/")} className="mt-6 h-14 px-8 text-lg font-black">
              {t("join.backHome")}
            </Button>
          </>
        )}
      </div>
    </PosterPage>
  );
}