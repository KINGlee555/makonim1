import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// המנוי נמכר ידנית (Bit / העברה) ומופעל על ידי בעל האפליקציה,
// ולכן הבדיקה היא מול רשומת המנוי של המשתמש המחובר.
export function memberIsActive(member) {
  if (!member || member.active === false || !member.paid_until) return false;
  return new Date(`${member.paid_until}T23:59:59`).getTime() >= Date.now();
}

export function daysLeft(member) {
  if (!member?.paid_until) return 0;
  return Math.ceil((new Date(`${member.paid_until}T23:59:59`).getTime() - Date.now()) / 86400000);
}

export default function usePremium() {
  const [state, setState] = useState({ loading: true, isPremium: false, member: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me?.email) {
          if (!cancelled) setState({ loading: false, isPremium: false, member: null });
          return;
        }
        // עם אפשרויות הבקשה חוזרת כ"עמוד" ולכן קוראים את items
        const page = await base44.entities.PremiumMember.filter(
          { user_email: me.email, active: true },
          { sort: "-created_date", limit: 1 }
        );
        const member = (page?.items || [])[0] || null;
        const active = memberIsActive(member);
        if (!cancelled) setState({ loading: false, isPremium: active, member: active ? member : null });
      } catch {
        if (!cancelled) setState({ loading: false, isPremium: false, member: null });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}