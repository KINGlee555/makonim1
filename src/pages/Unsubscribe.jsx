import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, MailX, RefreshCw, XCircle } from "lucide-react";
import { useT } from "@/lib/i18n";

const LOGO = "https://media.base44.com/images/public/69cfa62de4216044e8c1f14e/067697bc9_logo.png";

// עמוד ההסרה מדיוור — ציבורי, נגיש גם בלי התחברות, ומחוץ לניווט של האפליקציה.
export default function Unsubscribe() {
  const t = useT();
  const [state, setState] = useState("loading");

  const unsubscribe = useCallback(async () => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      setState("invalid");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/app-emails/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) setState("done");
      else if (res.status === 400) setState("invalid");
      else setState("error");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    unsubscribe();
  }, [unsubscribe]);

  const view =
    state === "done"
      ? { Icon: CheckCircle2, title: t("unsub.doneTitle"), body: t("unsub.doneBody") }
      : state === "invalid"
        ? { Icon: XCircle, title: t("unsub.invalidTitle"), body: t("unsub.invalidBody") }
        : state === "error"
          ? { Icon: XCircle, title: t("unsub.errorTitle"), body: t("unsub.errorBody") }
          : { Icon: MailX, title: t("unsub.title"), body: t("unsub.loading") };

  return (
    <div dir="rtl" className="pst-page pst-inner">
      <header className="pst-top">
        <div className="pst-topline">
          <span className="pst-brand">
            <span>MaKonim</span>
            <img src={LOGO} alt="MaKonim" />
          </span>
        </div>

        <h1>
          <MailX />
          {t("unsub.title")}
        </h1>
        <p>{t("unsub.subtitle")}</p>
      </header>

      <main className="pst-main">
        <div className="pst-panel">
          <div className="flex items-start gap-3">
            <view.Icon className="mt-0.5 h-7 w-7 flex-none" />
            <div className="min-w-0">
              <p className="text-lg font-black">{view.title}</p>
              <p className="mt-1 text-[15px] font-bold leading-relaxed opacity-80">{view.body}</p>
            </div>
          </div>

          {state === "loading" && (
            <div className="mt-5 flex items-center gap-2 text-sm font-bold opacity-70">
              <RefreshCw className="h-4 w-4 animate-refresh" />
              {t("unsub.loading")}
            </div>
          )}

          {state === "error" && (
            <button
              type="button"
              onClick={unsubscribe}
              className="pst-btn mt-5 inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("unsub.retry")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}