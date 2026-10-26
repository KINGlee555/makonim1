import { useEffect, useState } from "react";

// The subscription is sold manually (Bit / Bank transfer) and activated by the app owner,
// so the check is against the connected user's subscription record.
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
        // TODO: Fetch the current user from your new backend (e.g., supabase.auth.getUser())
        // Mocking user as null for now. To test premium flow, change this to an object with an email.
        const mockMe = null;

        if (!mockMe?.email) {
          if (!cancelled) setState({ loading: false, isPremium: false, member: null });
          return;
        }

        // TODO: Fetch the PremiumMember record for this email from your new backend
        // Simulating a network request for now
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mocking the result as an empty array (meaning no active premium subscription)
        const page = { items: [] };

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