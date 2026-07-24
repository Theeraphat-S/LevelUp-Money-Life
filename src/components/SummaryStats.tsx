import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Transaction } from "../types";

const categoryColors: Record<string, string> = {
  Food: "#003f5c",
  Transport: "#2f4b7c",
  Home: "#665191",
  Health: "#a05195",
  Learning: "#d45087",
  Fun: "#f95d6a",
  Debt: "#ff7c43",
  Savings: "#ffa600",
};

const formatter = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

export function SummaryStats({ transactions, month }: { transactions: Transaction[]; month: string }) {
  const rows = transactions.filter((row) => row.date.startsWith(month));
  const income = rows.filter((row) => row.amount > 0).reduce((sum, row) => sum + row.amount, 0);
  const expenses = Math.abs(rows.filter((row) => row.amount < 0).reduce((sum, row) => sum + row.amount, 0));
  const net = income - expenses;

  const breakdown = Object.entries(
    rows.filter((row) => row.amount < 0).reduce<Record<string, number>>((acc, row) => {
      acc[row.category] = (acc[row.category] ?? 0) + Math.abs(row.amount);
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Month-end Summary</h2>
        <p className="text-sm text-slate-600">สรุปเดือนนี้ใช้เงินไปกับอะไรบ้าง</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Income" value={formatter.format(income)} tone="text-emerald-700" />
        <Stat label="Expenses" value={formatter.format(expenses)} tone="text-rose-700" />
        <Stat label="Net" value={formatter.format(net)} tone={net >= 0 ? "text-blue-700" : "text-rose-700"} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2}>
                {breakdown.map((entry) => <Cell key={entry.name} fill={categoryColors[entry.name] ?? "#64748b"} />)}
              </Pie>
              <Tooltip formatter={(value) => formatter.format(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {breakdown.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีค่าใช้จ่ายในเดือนนี้</p> : breakdown.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-slate-700"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: categoryColors[item.name] ?? "#64748b" }} />{item.name}</span>
              <span className="font-semibold text-slate-950">{formatter.format(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className={`mt-1 text-xl font-bold ${tone}`}>{value}</div></div>;
}
