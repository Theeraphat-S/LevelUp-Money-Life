import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MagicWand, Scales } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { Allocation } from "../types";

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function FinancialPlan({ income, setIncome, allocations, setAllocations }: { income: number; setIncome: (value: number) => void; allocations: Allocation[]; setAllocations: (value: Allocation[]) => void }) {
  const { t } = useTranslation();
  const data = allocations.map((item) => ({ ...item, label: t(`alloc.${item.label}`, item.label), amount: Math.round((income * item.percent) / 100) }));
  const total = allocations.reduce((s, a) => s + a.percent, 0);
  const balanced = total === 100;

  const updatePercent = (id: string, percent: number) => setAllocations(allocations.map((item) => (item.id === id ? { ...item, percent } : item)));

  const apply503020 = () => {
    setAllocations([
      { id: "needs", label: "Needs", percent: 50, color: "oklch(58% 0.13 165)" },
      { id: "wants", label: "Wants", percent: 30, color: "oklch(62% 0.11 230)" },
      { id: "savings", label: "Savings", percent: 20, color: "oklch(70% 0.14 80)" },
    ]);
  };

  const autoBalance = () => {
    if (total === 0) return;
    const factor = 100 / total;
    let currentSum = 0;
    const next = allocations.map((item, idx) => {
      if (idx === allocations.length - 1) {
        return { ...item, percent: Math.max(0, 100 - currentSum) };
      }
      const val = Math.round(item.percent * factor);
      currentSum += val;
      return { ...item, percent: val };
    });
    setAllocations(next);
  };

  return (
    <section className="rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-diffuse)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{t("plan.title")}</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">{t("plan.subtitle")}</p>
        </div>
        <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-soft)]">
          {t("plan.incomeLabel")}
          <div className="flex items-center gap-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-base)] px-3 py-2 focus-within:border-[var(--color-accent)]">
            <span className="font-mono text-sm text-[var(--color-ink-soft)]">฿</span>
            <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-32 bg-transparent font-mono text-sm font-semibold text-[var(--color-ink)] outline-none" />
          </div>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          {allocations.map((item) => (
            <div key={item.id}>
              <div className="mb-2.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {t(`alloc.${item.label}`, item.label)}
                </span>
                <span className="font-mono text-[var(--color-ink)]">{item.percent}% <span className="text-[var(--color-ink-soft)]">· ฿{thb.format((income * item.percent) / 100)}</span></span>
              </div>
              <input type="range" min="0" max="100" value={item.percent} onChange={(e) => updatePercent(item.id, Number(e.target.value))} className="w-full" />
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium ${balanced ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              <span>{balanced ? t("plan.balanced") : t("plan.unbalanced")}</span>
              <span className="font-mono font-bold">{total}%</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={apply503020}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-base)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-line)] active:translate-y-px"
              >
                <MagicWand size={14} className="text-[var(--color-accent)]" /> 50/30/20 Rule
              </button>
              {!balanced && (
                <button
                  onClick={autoBalance}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 active:translate-y-px"
                >
                  <Scales size={14} /> Auto-Balance
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-60 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={64} tickLine={false} axisLine={false} tick={{ fontSize: 12, fontFamily: "var(--font-sans)", fill: "#52525b" }} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} formatter={(value) => [`฿${thb.format(Number(value))}`, t("plan.allocated")]} contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", background: "#fff", fontSize: 12, fontFamily: "var(--font-mono)" }} />
              <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={24} stroke="rgba(0,0,0,0.10)" strokeWidth={1}>
                {data.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
