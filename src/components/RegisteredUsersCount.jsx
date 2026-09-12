import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

export default function RegisteredUsersCount() {
  const t = useT();
  const [count, setCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    base44.functions.invoke("registeredUsersCount", {})
      .then(response => { if (!cancelled) setCount(response.data?.count ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (count === null) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground">
      <Users className="h-5 w-5 text-primary" />
      <span className="text-sm font-semibold">{t("stats.registeredUsers", { count })}</span>
    </div>
  );
}