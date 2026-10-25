import { useT } from "@/lib/i18n";
import { isHere } from "@/hooks/useListPresence";
import { bigCard, bigChip, bigNote, bigPill, bigSection, bigTitle } from "@/lib/bigUi";

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
  const hereCount = people.filter(person => person.here).length;

  return (
    <section className={bigSection}>
      <h3 className={bigTitle}>{t("presence.open")}</h3>
      <div className={bigCard}>
        <div className="flex flex-wrap items-center gap-3">
          {shown.map(person => (
            <span key={person.user_email} className={bigChip}
              title={person.here ? t("presence.here") : person.invited ? t("presence.invited") : person.name}>
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${person.here ? "bg-big-accent" : "bg-big-line"}`} />
              <span className="max-w-[160px] truncate">{person.name}</span>
            </span>
          ))}
          {hidden > 0 && <span className={bigNote}>+{hidden}</span>}
          {people.length === 0 && <span className={bigChip}>{t("presence.alone")}</span>}
        </div>

        {people.length > 0 && (
          <p className={`mt-2.5 ${bigNote}`}>{hereCount > 0 ? t("presence.here") : t("presence.invited")}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={onOpen} className={bigPill}>{t("participants.button")}</button>
        </div>
      </div>
    </section>
  );
}