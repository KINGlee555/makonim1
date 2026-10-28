// זהות אחת לכל משתמש: שם ייחודי שמשויך לרשימה אחת, עם מייל לסנכרון וטלפון לתזכורות.
// שם או מייל שכבר משויכים לרשימה אחרת לא נגררים בשקט — נדרש אישור מפורש של המשתמש.
import { base44 } from "@/api/base44Client";

export function nameKey(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function emailIsValid(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail(value));
}

// מספר ישראלי בפורמט בינלאומי — מוכן לשליחה בוואטסאפ
export function cleanPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

export function phoneIsValid(value) {
  return !value || /^972\d{8,9}$/.test(cleanPhone(value));
}

function toRows(result) {
  return Array.isArray(result) ? result : result?.items || [];
}

async function identityByName(name) {
  const key = nameKey(name);
  if (!key) return null;
  const found = await base44.entities.MemberIdentity.filter({ name_key: key }, "-created_date", 1);
  return toRows(found)[0] || null;
}

async function identityByEmail(email) {
  const mail = cleanEmail(email);
  if (!mail) return null;
  const found = await base44.entities.MemberIdentity.filter({ email: mail }, "-created_date", 1);
  return toRows(found)[0] || null;
}

export async function findIdentity({ name, email }) {
  const byEmail = await identityByEmail(email);
  if (byEmail) return byEmail;
  return identityByName(name);
}

export function identityListIds(identity) {
  if (!identity) return [];
  return [identity.list_id, ...(identity.extra_list_ids || [])].filter(Boolean);
}

export function belongsToList(identity, listId) {
  return identityListIds(identity).includes(listId);
}

// משייכים את השם לרשימה. אם השם (או המייל) כבר שייך לרשימה אחרת —
// מחזירים conflict, והמשתמש הוא זה שמאשר אם להוסיף אותו גם כאן.
export async function attachToList({ name, email, phone, listId, listTitle }) {
  if (!listId) return { identity: null, conflict: null };
  const mail = cleanEmail(email);
  const tel = cleanPhone(phone);
  const existing = await findIdentity({ name, email: mail });

  if (!existing) {
    const identity = await base44.entities.MemberIdentity.create({
      name: String(name || mail || "").trim(),
      name_key: nameKey(name || mail),
      email: mail,
      phone: tel,
      list_id: listId,
      list_title: listTitle || "",
      extra_list_ids: [],
    });
    return { identity, conflict: null };
  }

  // ממלאים רק מה שחסר — לא דורסים פרטים שהמשתמש שמר בעצמו
  const patch = {};
  if (mail && !existing.email) patch.email = mail;
  if (tel && !existing.phone) patch.phone = tel;

  // רשומת מייל שהוזמן מראש (לפני שנרשם) מקבלת עכשיו את השם האמיתי
  const isPlaceholder = existing.name_key === nameKey(existing.email);
  if (isPlaceholder && nameKey(name) && nameKey(name) !== existing.name_key) {
    const taken = await identityByName(name);
    if (!taken) {
      patch.name = String(name).trim();
      patch.name_key = nameKey(name);
    }
  }

  const identity = Object.keys(patch).length
    ? await base44.entities.MemberIdentity.update(existing.id, patch)
    : existing;

  if (belongsToList(identity, listId)) return { identity, conflict: null };
  return { identity, conflict: identity };
}

// אישור מפורש של המשתמש להוסיף את השם שלו גם לרשימה הזו
export async function approveJoin(identity, listId) {
  if (!identity?.id || !listId) return null;
  const extra = Array.from(new Set([...(identity.extra_list_ids || []), listId]));
  return base44.entities.MemberIdentity.update(identity.id, { extra_list_ids: extra });
}

// שמירת המייל והטלפון של השם — לסנכרון בין מכשירים ולתזכורות בוואטסאפ
export async function saveContact({ name, email, phone, listId, listTitle, whatsappReminders }) {
  const mail = cleanEmail(email);
  const tel = cleanPhone(phone);
  const existing = await findIdentity({ name, email: mail });
  const patch = {
    email: mail,
    phone: tel,
    whatsapp_reminders: !!whatsappReminders,
  };

  if (existing) return base44.entities.MemberIdentity.update(existing.id, patch);

  return base44.entities.MemberIdentity.create({
    name: String(name || mail).trim(),
    name_key: nameKey(name || mail),
    list_id: listId || "",
    list_title: listTitle || "",
    extra_list_ids: [],
    ...patch,
  });
}

// הזמנה במייל "תופסת" את הכתובת לרשימה — כדי שתמיד נחזור לאותה רשימה
export async function reserveEmailForList({ email, listId, listTitle }) {
  const mail = cleanEmail(email);
  if (!mail || !listId) return { ok: true };
  const existing = await identityByEmail(mail);
  if (!existing) {
    try {
      await base44.entities.MemberIdentity.create({
        name: mail,
        name_key: nameKey(mail),
        email: mail,
        list_id: listId,
        list_title: listTitle || "",
        extra_list_ids: [],
      });
    } catch {}
    return { ok: true };
  }
  if (belongsToList(existing, listId)) return { ok: true };
  return { ok: false, listTitle: existing.list_title || "" };
}