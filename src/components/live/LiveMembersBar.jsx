import { MessageSquare, UserPlus } from "lucide-react";
import { useT } from "@/lib/i18n";
import { isHere } from "@/hooks/useListPresence";

// אות ראשונה לשם — העיגול הקטן שלצד כל משתתף
function initials(name) {
  const clean = String(name || "").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

// מי איתך ברשימה, למעלה ובברור: מי כאן עכשיו, מי הוזמן ועוד לא נכנס,
// עם כפתור הודעה לכל המשפחה וכפתור הזמנה למי שחסר.
export default function LiveMembersBar({ list, members = [], myEmail, myName, unread = 0, onOpenShare, onOpenMessages }) {
  const t = useT();
  const others = members
    .filter(member => member.user_email && member.user_email !== myEmail)
    .map(member => ({
      key: member.user_email,
      name: member.user_name || member.user_email.split("@")[0],
      here: isHere(member),
    }));
  const invited = [
    ...(list?.shared_with || [])
      .filter(email => email !== myEmail && !members.some(member => member.user_email === email))
      .map(email => ({ key: email, name: email.split("@")[0], here: false, invited: true })),
    ...(list?.invited_phones || [])
      .filter(phone => !members.some(member => member.user_email === phone))
      .map(phone => ({ key: phone, name: phone, here: false, invited: true })),
  ];
  const people = [
    ...others.sort((a, b) => Number(b.here) - Number(a.here)),
    ...invited,
  ];
  const online = people.filter(person => person.here).length + (myEmail ? 1 : 0);

  return (
    <section className="pst-live" aria-label={t("live.title")}>
      <div className="pst-live-top">
        <span className="pst-live-dot" aria-hidden="true" />
        <span className="pst-live-title">
          {people.length === 0
            ? t("live.alone")
            : online === 1
              ? t("live.countOne", { total: people.length })
              : t("live.count", { online, total: people.length })}
        </span>
        <div className="pst-live-actions">
          <button type="button" onClick={onOpenMessages} className="pst-live-btn pst-live-btn-solid">
            <MessageSquare className="h-4 w-4" />
            {t("live.message")}
            {unread > 0 && <span className="pst-live-badge">{unread > 9 ? "9+" : unread}</span>}
          </button>
          <button type="button" onClick={onOpenShare} className="pst-live-btn">
            <UserPlus className="h-4 w-4" />
            {t("live.invite")}
          </button>
        </div>
      </div>

      <div className="pst-live-row">
        {myEmail && (
          <span className="pst-live-chip pst-live-me">
            <span className="pst-live-av">{initials(myName || t("live.you"))}</span>
            <span className="pst-live-nm">{myName || t("live.you")}</span>
          </span>
        )}
        {people.map(person => (
          <span
            key={person.key}
            className="pst-live-chip"
            data-here={person.here ? "true" : "false"}
            title={person.here ? t("presence.here") : person.invited ? t("presence.invited") : person.name}
          >
            <span className="pst-live-av">{initials(person.name)}</span>
            <span className="pst-live-nm">{person.name}</span>
            {person.here && <span className="pst-live-here" aria-hidden="true" />}
          </span>
        ))}
        <button type="button" onClick={onOpenShare} className="pst-live-invite">
          + {t("live.invite")}
        </button>
      </div>
    </section>
  );
}