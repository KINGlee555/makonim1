import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useT } from "@/lib/i18n";

const COLORS = ["#3d8c97", "#f5c98a", "#b5f59c", "#d1f2f3", "#e8888a"];

export default function PriceHistoryChart({ records }) {
  const t = useT();

  const { chartData, topItems } = useMemo(() => {
    const freq = {};
    records.forEach(r => { freq[r.item_name] = (freq[r.item_name] || 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
    if (top.length === 0) return { chartData: [], topItems: [] };
    const byDate = {};
    records.forEach(r => {
      if (!top.includes(r.item_name)) return;
      const d = new Date(r.created_date);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
      if (!byDate[dateKey]) byDate[dateKey] = { date: label };
      byDate[dateKey][r.item_name] = r.price;
    });
    const sortedKeys = Object.keys(byDate).sort();
    return { chartData: sortedKeys.map(k => byDate[k]), topItems: top };
  }, [records]);

  if (chartData.length < 2) {
    return <p className="text-center text-muted-foreground py-4">{t("priceHistory.noData")}</p>;
  }

  return (
    <div className="bg-card border border-primary/10 rounded-3xl p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {topItems.map((name, idx) => (
            <Line key={name} type="monotone" dataKey={name} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}