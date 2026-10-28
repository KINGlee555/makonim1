import { useEffect, useState } from "react";
import { Mail, Phone, Loader2, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import {
  findIdentity, saveContact, cleanPhone, phoneIsValid, emailIsValid,
} from "@/lib/memberIdentity";
import { loadLocalName } from "@/lib/userName";

// בהגדרות: המייל שמסנכרן את השם בין המכשירים, והטלפון לתזכורות בוואטסאפ.
// השם עצמו הוא הזהות — ולכן תמיד חוזרים לאותה רשימה.
export default function ContactSyncBlock({ list }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reminders, setReminders] = useState(false);
  const [linkedTitle, setLinkedTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      const displayName = me?.full_name || loadLocalName();
      const identity = await findIdentity({ name: displayName, email: me?.email }).catch(() => null);
      if (cancelled) return;
      setName(identity?.name || displayName || "");
      setEmail(identity?.email || me?.email || "");
      setPhone(identity?.phone || "");
      setReminders(!!identity?.whatsapp_reminders);
      setLinkedTitle(identity?.list_id && identity.list_id !== list?.id ? identity.list_title || "רשימה أخرى" : "");
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [list?.id]);

  const handleSave = async () => {
    if (!emailIsValid(email)) {
      toast({ title: "כתובת המייל לא תקינה", variant: "destructive", duration: 2500 });
      return;
    }
    if (!phoneIsValid(phone)) {
      toast({ title: "מספר הטלפון לא תקין", variant: "destructive", duration: 2500 });
      return;
    }
    setSaving(true);
    try {
      await saveContact({
        name: name || email,
        email,
        phone: cleanPhone(phone),
        listId: list?.id,
        listTitle: list?.title,
        whatsappReminders: reminders,
      });
      toast({ title: "הפרטים נשמרו", duration: 2500 });
    } catch {
      toast({ title: "לא הצלחתי לשמור, נסו שוב", variant: "destructive", duration: 3000 });
    }
    setSaving(false);
  };

  return (
    <div className="bg-muted/50 rounded-2xl p-4 animate-slide-up stagger-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Link2 className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">מייל וטלפון שלי</p>
          <p className="text-sm text-muted-foreground">
            {loading ? "טוען…" : "המייל מסנכרן את השם בין המכשירים, הטלפון ישמש לתזכורות בוואטסאפ"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 flex-none text-primary" />
          <Input
            type="email"
            dir="ltr"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-xl text-sm"
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 flex-none text-primary" />
          <Input
            type="tel"
            dir="ltr"
            inputMode="tel"
            placeholder="050-000-0000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="h-11 rounded-xl text-sm"
            disabled={loading}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[13px] font-bold leading-snug text-muted-foreground">
          לקבל תזכורות קנייה בוואטסאפ
        </p>
        <Switch checked={reminders} onCheckedChange={setReminders} disabled={loading} />
      </div>

      {linkedTitle && (
        <p className="mt-2 text-[13px] font-bold leading-snug text-muted-foreground">
          {`השם הזה משויך לרשימה «${linkedTitle}» — להוסיף אותו גם לרשימה הזו אפשר באישור שיופיע במסך הרשימה.`}
        </p>
      )}

      <Button onClick={handleSave} disabled={loading || saving} className="mt-3 h-11 w-full rounded-xl font-bold">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "שמור פרטים"}
      </Button>
    </div>
  );
}