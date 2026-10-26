import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// המקום הממומן שמוצג כרגע ברשימות — לפי סדר העדיפות שנקבע בדף הניהול.
export default function useSponsoredSlot() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    base44.entities.SponsoredPlacement.filter({ active: true }, "-priority", 1)
      .then(rows => {
        const list = Array.isArray(rows) ? rows : rows.items || [];
        setSlot(list[0] || null);
      })
      .catch(() => {});
  }, []);

  return slot;
}