import { Users } from "lucide-react";
import { useT } from "@/lib/i18n";
import { uiPill } from "@/lib/minimalUi";
import { isHere } from "@/hooks/useListPresence";

const MAX_CHIPS = 4;

// מי נמצא איתך ברשימה: מי שנכנס אליה לאחרונה, מי שהוזמן ועוד לא נכנס, ומי כאן עכשיו.
export default function SharedWithStrip({ list, members = [], myEmail, onOpen }) {
  const t = useT();
  const others = members
    .filter(member => member.user_email && member.user_email !== myEmail)
    .map(member => ({ ...member, name: member.user_name || member.user_email.split("@")[0], here: isHere(member), invited: false }));
  const invited = [
    ...(list?.shared_with || [])
      .filter(email => email !== myEmail && !members.some(member => member.user_email === email))
      .map(email => ({ user_email: email, name: email.split("@")[0], here: false, invited: true })),
    ...(list?.invited_phones || [])
      .filter(phone => !members.some(member => member.user_email === phone))
      .map(phone => ({ user_email: phone, name: phone, here: false, invited: true })),
  ];
  const people = [...others, ...invited];
  const shown = people.slice(0, MAX_CHIPS);
  const hidden = people.length - shown.length;

  return (
    <section className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-ui-line-soft py-2.5">
      <span className="flex items-center gap-1.5 text-[12px] text-ui-muted">
        <Users className="h-3.5 w-3.5" />{t("presence.title")}
      </span>

      {shown.map(person => (
        <span
          key={person.user_email}
          title={person.here ? t("presence.here") : person.invited ? t("presence.invited") : person.name}
          className="flex items-center gap-1.5 rounded-full bg-ui-surface px-2.5 py-1 text-[12px] text-ui-ink"
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${person.here ? "bg-ui-accent" : "bg-ui-line"}`} />
          <span className="max-w-[140px] truncate">{person.name}</span>
        </span>
      ))}
      {hidden > 0 && <span className="text-[12px] text-ui-muted">+{hidden}</span>}
      {people.length === 0 && <span className="text-[12px] text-ui-muted">{t("presence.alone")}</span>}

      <button type="button" onClick={onOpen} className={uiPill}>{t("presence.open")}</button>
    </section>
  );
}