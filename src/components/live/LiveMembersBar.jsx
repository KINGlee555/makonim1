import { MessageSquare, UserPlus } from "lucide-react";
import { useT } from "@/lib/i18n";
import { isHere } from "@/hooks/useListPresence";
import PriceSyncButton from "@/components/live/PriceSyncButton";

// אות ראשונה לשם — העיגול הקטן שלצד כל משתתף
function initials(name) {
  const clean = String(name || "").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

// שורת הלייב בראש הרשימה: הרשימה פתוחה עכשיו, מי צופה בה ברגע זה,
// מי כבר נכנס בעבר (אופליין) ומי עוד לא נכנס — ולצדם סנכרון המחירים.
export default function LiveMembersBar({
  list, members = [], myEmail, myName, unread = 0, items = [], onSynced, onOpenShare, onOpenMessages,
}) {
  const t = useT();

  const others = members
    .filter(member => member.user_email && member.user_email !== myEmail)
    .map(member => ({
      key: member.user_email,
      name: member.user_name || member.user_email.split("@")[0],
      online: isHere(member),
    }));
  const invited = [
    ...(list?.shared_with || [])
      .filter(email => email !== myEmail && !members.some(member => member.user_email === email))
      .map(email => ({ key: email, name: email.split("@")[0], online: false, invited: true })),
    ...(list?.invited_phones || [])
      .filter(phone => !members.some(member => member.user_email === phone))
      .map(phone => ({ key: phone, name: phone, online: false, invited: true })),
  ];
  const people = [
    ...others.sort((a, b) => Number(b.online) - Number(a.online)),
    ...invited,
  ];
  const online = others.filter(person => person.online).length + (myEmail ? 1 : 0);

  const stateOf = person => (person.invited ? "invited" : person.online ? "online" : "offline");
  const labelOf = person =>
    person.invited ? t("live.invitedShort") : person.online ? t("live.online") : t("live.offline");

  return (
    <section className="pst-live pst-live-line" aria-label={t("live.title")}>
      <div className="pst-live-top">
        <span className="pst-live-dot" aria-hidden="true" />
        <span className="pst-live-title">{t("live.live")}</span>
        <span className="pst-live-count" title={t("live.count", { online, total: people.length + (myEmail ? 1 : 0) })}>
          {online}
        </span>
      </div>

      <div className="pst-live-row">
        {myEmail && (
          <span className="pst-live-chip pst-live-me" data-here="true">
            <span className="pst-live-av pst-live-av-on">{initials(myName || t("live.you"))}</span>
            <span className="pst-live-nm">{myName || t("live.you")}</span>
            <span className="pst-live-flag pst-live-flag-online">{t("live.online")}</span>
          </span>
        )}
        {people.map(person => {
          const state = stateOf(person);
          const label = labelOf(person);
          return (
            <span
              key={person.key}
              className="pst-live-chip"
              data-here={state === "online" ? "true" : "false"}
              title={`${person.name} · ${label}`}
              aria-label={`${person.name} · ${label}`}
            >
              <span className={`pst-live-av ${state === "online" ? "pst-live-av-on" : "pst-live-av-off"}`}>
                {initials(person.name)}
              </span>
              <span className={`pst-live-nm ${state === "online" ? "" : "pst-live-nm-off"}`}>{person.name}</span>
              <span className={`pst-live-flag pst-live-flag-${state}`}>{label}</span>
            </span>
          );
        })}
      </div>

      <div className="pst-live-actions">
        <PriceSyncButton items={items} onSynced={onSynced} />
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
    </section>
  );
}