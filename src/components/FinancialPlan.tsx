import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Allocation } from "../types";

const formatter = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

export function FinancialPlan({ income, setIncome, allocations, setAllocations }: { income: number; setIncome: (value: number) => void; allocations: Allocation[]; setAllocations: (value: Allocation[]) => void }) {
  const data = allocations.map((item) => ({ ...item, amount: Math.round((income * item.percent) / 100) }));

  const updatePercent = (id: string, percent: number) => {
    setAllocations(allocations.map((item) => (item.id === id ? { ...item, percent } : item)));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Financial Plan</h2>
          <p className="text-sm text-slate-600">จัดสรรเงินเดือนเข้าแต่ละแผน</p>
        </div>
        <label className="text-sm font-medium text-slate-700">
          Monthly income
          <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="ml-2 w-36 rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-950 outline-none focus:border-blue-500" />
        </label>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          {allocations.map((item) => (
            <div key={item.id}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">{item.label}</span>
                <span className="text-slate-600">{item.percent}% · {formatter.format((income * item.percent) / 100)}</span>
              </div>
              <input type="range" min="0" max="100" value={item.percent} onChange={(e) => updatePercent(item.id, Number(e.target.value))} className="w-full accent-blue-700" />
            </div>
          ))}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 18, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={78} tick={{ fontSize: 12, fill: "#475569" }} />
              <Tooltip formatter={(value) => formatter.format(Number(value))} />
              <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={22}>
                {data.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
