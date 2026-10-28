import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { useT } from "@/lib/i18n";

// הודעה לכל מי שאיתי ברשימה: כותבים, שולחים, וכל המשתתפים רואים מיד.
export default function ListMessagesDialog({ open, onOpenChange, messages = [], onSend, myEmail }) {
  const t = useT();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const quick = [t("messages.n1"), t("messages.n2"), t("messages.n3")];

  useEffect(() => {
    if (!open) return;
    setError("");
    const timer = window.setTimeout(() => endRef.current?.scrollIntoView({ block: "end" }), 60);
    return () => window.clearTimeout(timer);
  }, [open, messages.length]);

  const submit = async (value) => {
    const body = String(value ?? text).trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      await onSend(body);
      setText("");
    } catch {
      setError(t("messages.failed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto flex max-h-[88vh] w-[calc(100%-1rem)] max-w-md flex-col overflow-hidden bg-market-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start text-xl text-market-ink">
            <MessageSquare className="h-5 w-5 text-market-blue" />
            {t("messages.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-1">
          {messages.length === 0 && (
            <p className="py-8 text-center text-[15px] font-bold text-market-ink/60">{t("messages.empty")}</p>
          )}
          {messages.map(message => {
            const mine = message.from_email && message.from_email === myEmail;
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? "bg-market-blue text-white" : "border-2 border-market-ink/15 bg-market-surface text-market-ink"}`}>
                  {!mine && <p className="text-[12px] font-black opacity-70">{message.from_name || t("live.you")}</p>}
                  <p className="text-[15px] font-bold leading-snug [overflow-wrap:anywhere]">{message.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quick.map(label => (
            <button
              key={label}
              type="button"
              onClick={() => submit(label)}
              disabled={sending}
              className="rounded-full bg-market-track px-3 py-1 text-[13px] font-black text-market-ink"
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="text-[13px] font-bold text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Input
            value={text}
            onChange={event => setText(event.target.value)}
            onKeyDown={event => event.key === "Enter" && submit()}
            placeholder={t("messages.placeholder")}
            maxLength={240}
            className="h-11 rounded-xl"
          />
          <button
            type="button"
            onClick={() => submit()}
            disabled={sending || !text.trim()}
            className="flex h-11 flex-none items-center gap-1.5 rounded-xl bg-market-blue px-4 text-[15px] font-black text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {t("messages.send")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}