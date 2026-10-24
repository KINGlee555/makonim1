import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Loader2, Mail, Phone, Plus, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { buildInvitationEmailBody, INVITATION_SUBJECT } from "@/lib/invitationEmail";
import { useT } from "@/lib/i18n";
import ParticipantRow from "./ParticipantRow";

// הרשימה מוגבלת לחמישה משתתפים (לא כולל המזמין) — כמו בהצטרפות דרך הקישור
const MAX_MEMBERS = 5;

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^\+?\d[\d\s-]{7,}$/.test(v);

// וואטסאפ צריך ספרות בלבד בפורמט בינלאומי: 050-1234567 → 972501234567
function whatsappNumber(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

// בעל הרשימה (המזמין) מנהל את המשתתפים — מוסיף ומסיר לפי מייל גוגל או מספר טלפון
export default function ParticipantsDialog({ open, onOpenChange, list, currentUser, onUpdated }) {
  const t = useT();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState({});

  useEffect(() => {
    if (!open) return;
    base44.entities.User.list().then(users => {
      const map = {};
      users.forEach(user => { map[user.email] = user.full_name || ""; });
      setNames(map);
    }).catch(() => {});
  }, [open]);

  const emails = list?.shared_with || [];
  const phones = list?.invited_phones || [];
  const memberCount = emails.length + phones.length;
  const isFull = memberCount >= MAX_MEMBERS;
  const shareLink = `${window.location.origin}/join/${list?.share_code}`;
  const ownerLabel = (!list?.created_by || list.created_by === "anonymous")
    ? t("participants.owner")
    : (names[list.created_by] || list.created_by);

  const persist = async (patch) => {
    await base44.entities.ShoppingList.update(list.id, patch);
    onUpdated?.(patch);
  };

  const sendInvite = (email) => base44.integrations.Core.SendEmail({
    to: email,
    subject: INVITATION_SUBJECT,
    body: buildInvitationEmailBody({ shareLink, senderName: currentUser?.full_name || "", listTitle: list?.title }),
    from_name: "מה קונים?",
  }).catch(() => {});

  const handleAdd = async () => {
    const trimmed = value.trim();
    if (!trimmed || isFull) return;
    setBusy(true);
    try {
      if (isEmail(trimmed)) {
        const email = trimmed.toLowerCase();
        if (emails.includes(email)) {
          toast({ title: t("participants.exists"), duration: 2500 });
        } else {
          await persist({ shared_with: [...emails, email] });
          sendInvite(email);
          toast({ title: t("participants.emailAdded", { email }), duration: 3000 });
        }
      } else if (isPhone(trimmed)) {
        if (phones.includes(trimmed)) {
          toast({ title: t("participants.exists"), duration: 2500 });
        } else {
          await persist({ invited_phones: [...phones, trimmed] });
          const text = `${list?.title || "רשימת קניות"} - ${shareLink}`;
          window.open(`https://wa.me/${whatsappNumber(trimmed)}?text=${encodeURIComponent(text)}`, "_blank");
          toast({ title: t("participants.phoneAdded"), duration: 3000 });
        }
      } else {
        toast({ title: t("participants.invalid"), variant: "destructive", duration: 3000 });
        setBusy(false);
        return;
      }
      setValue("");
    } catch (e) {
      toast({ title: t("participants.failed"), variant: "destructive", duration: 3000 });
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (kind, item) => {
    try {
      if (kind === "email") await persist({ shared_with: emails.filter(email => email !== item) });
      else await persist({ invited_phones: phones.filter(phone => phone !== item) });
      toast({ title: t("participants.removed"), duration: 2000 });
    } catch (e) {
      toast({ title: t("participants.failed"), variant: "destructive", duration: 3000 });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-start">{t("participants.title")}</DialogTitle>
        </DialogHeader>

        <p className="text-start text-sm text-muted-foreground">
          {t("participants.count", { count: memberCount, max: MAX_MEMBERS })}
        </p>

        <div className="max-h-64 space-y-2 overflow-y-auto pe-1">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-market-yellow bg-market-surface px-3 py-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-market-yellow-soft text-market-yellow-deep">
              <Crown className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 text-start">
              <p className="truncate text-[16px] font-extrabold text-market-ink">{ownerLabel}</p>
              <span className="block truncate text-xs font-bold text-market-ink/60">{t("participants.ownerBadge")}</span>
            </div>
          </div>

          {emails.map(email => (
            <ParticipantRow key={email} icon={<Mail className="h-4 w-4" />}
              label={names[email] || email} sub={email}
              onRemove={() => handleRemove("email", email)} removeLabel={t("participants.remove")} />
          ))}

          {phones.map(phone => (
            <ParticipantRow key={phone} icon={<Phone className="h-4 w-4" />}
              label={phone} sub={t("participants.byPhone")}
              onRemove={() => handleRemove("phone", phone)} removeLabel={t("participants.remove")} />
          ))}

          {memberCount === 0 && (
            <p className="py-3 text-center text-sm font-bold text-muted-foreground">{t("participants.empty")}</p>
          )}
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <label className="flex items-center gap-2 text-base font-medium text-foreground">
            <UserPlus className="h-4 w-4 text-market-blue" />
            {t("participants.addLabel")}
          </label>
          <div className="flex gap-2">
            <Input dir="ltr" value={value} disabled={isFull}
              placeholder={t("participants.addPlaceholder")}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && handleAdd()}
              className="h-12 rounded-xl text-sm" />
            <Button onClick={handleAdd} disabled={busy || isFull || !value.trim()} className="h-12 flex-shrink-0 gap-1 rounded-xl">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("participants.add")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isFull ? t("participants.full") : t("participants.addNote")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}