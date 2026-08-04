import { useState } from "react";
import { Cell, Pie, PieChart, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { ChartPie, ChartBar } from "@phosphor-icons/react";
import { CATEGORY_COLORS, type Transaction, type TransactionCategory } from "../types";

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function SummaryStats({ transactions, month }: { transactions: Transaction[]; month: string }) {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<"donut" | "bar">("donut");

  const rows = transactions.filter((row) => row.date.startsWith(month));
  const income = rows.filter((row) => row.amount > 0).reduce((s, r) => s + r.amount, 0);
  const expenses = Math.abs(rows.filter((row) => row.amount < 0).reduce((s, r) => s + r.amount, 0));
  const net = income - expenses;

  const breakdown = Object.entries(
    rows.filter((r) => r.amount < 0).reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + Math.abs(r.amount);
      return acc;
    }, {}),
  ).map(([name, value]) => ({
    name: name as TransactionCategory,
    displayName: t(`category.${name}`),
    value,
    color: CATEGORY_COLORS[name as TransactionCategory] ?? "oklch(60% 0.05 260)",
  }));

  breakdown.sort((a, b) => b.value - a.value);

  const topCategory = breakdown.length > 0 ? breakdown[0] : null;
  const topPct = topCategory && expenses > 0 ? Math.round((topCategory.value / expenses) * 100) : 0;

  return (
    <section className="rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-diffuse)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{t("summary.title")}</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">{t("summary.subtitle")}</p>
        </div>
        <div className="flex gap-1 bg-[var(--color-base)] p-1 rounded-xl self-start sm:self-auto border border-[var(--color-line)]">
          <button
            type="button"
            onClick={() => setChartType("donut")}
            aria-pressed={chartType === "donut"}
            aria-label={t("summary.viewDonutAria")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              chartType === "donut"
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            <ChartPie size={14} />
            {t("summary.viewDonut")}
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            aria-pressed={chartType === "bar"}
            aria-label={t("summary.viewBarAria")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              chartType === "bar"
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-xs"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            <ChartBar size={14} />
            {t("summary.viewBar")}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t("summary.income")} value={`+฿${thb.format(income)}`} tone="text-emerald-700" />
        <Stat label={t("summary.expenses")} value={`-฿${thb.format(expenses)}`} tone="text-rose-600" />
        <Stat label={t("summary.net")} value={`${net >= 0 ? "+" : ""}฿${thb.format(net)}`} tone={net >= 0 ? "text-emerald-700" : "text-rose-600"} />
      </div>

      {topCategory && (
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-base)] px-4 py-2.5 text-xs font-medium text-[var(--color-ink)]">
          {t("summary.topCategory", {
            category: topCategory.displayName,
            amount: thb.format(topCategory.value),
            pct: topPct,
          })}
        </div>
      )}

      <div className="mt-6 grid items-center gap-5 lg:grid-cols-[240px_1fr]">
        <div className="relative h-56">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "donut" ? (
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={2} stroke="none">
                  {breakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`฿${thb.format(Number(value))}`, t(`category.${name}`)]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 12, fontFamily: "var(--font-mono)" }}
                />
              </PieChart>
            ) : (
              <BarChart data={breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="displayName" stroke="var(--color-ink-soft)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--color-ink-soft)" fontSize={10} tickLine={false} tickFormatter={(v) => `฿${v}`} />
                <Tooltip
                  formatter={(value, name) => [`฿${thb.format(Number(value))}`, t(`category.${name}`)]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 12, fontFamily: "var(--font-mono)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {breakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
          {chartType === "donut" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] uppercase tracking-wider text-[var(--color-ink-soft)]">{t("summary.total")}</span>
              <span className="font-mono text-lg font-semibold text-[var(--color-ink)]">฿{thb.format(expenses)}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {breakdown.length === 0 ? (
            <div className="rounded-2xl bg-[var(--color-base)] px-4 py-5 text-center">
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t("summary.emptyTitle")}</h3>
              <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{t("summary.emptyHint")}</p>
            </div>
          ) : (
            breakdown.map((item) => {
              const pct = expenses > 0 ? Math.round((item.value / expenses) * 100) : 0;
              return (
                <div key={item.name} className="rounded-2xl bg-[var(--color-base)] px-3.5 py-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {t(`category.${item.name}`)}
                    </span>
                    <span className="font-mono text-[var(--color-ink)]">฿{thb.format(item.value)} <span className="text-[var(--color-ink-soft)]">· {pct}%</span></span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--color-line)]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-[var(--color-base)] px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">{label}</div>
      <div className={`mt-1 font-mono text-xl font-semibold tracking-tight ${tone}`}>{value}</div>
    </div>
  );
}
