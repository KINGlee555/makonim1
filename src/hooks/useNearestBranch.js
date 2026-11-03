import { useEffect, useState } from "react";
import { nearbyBranches } from "@/lib/branches";

// הסניף הקרוב של הרשת שהמשתמש בחר. אם אין סניף שלה בסביבה — הקרוב ביותר מכל רשת.
export default function useNearestBranch(storeName) {
  const [status, setStatus] = useState("idle");
  const [branch, setBranch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("locating");
    nearbyBranches()
      .then(list => {
        if (cancelled) return;
        const own = list.find(item => `${item.brand} ${item.name}`.includes(storeName));
        setBranch(own || list[0] || null);
        setStatus("done");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => { cancelled = true; };
  }, [storeName]);

  return { branch, status };
}