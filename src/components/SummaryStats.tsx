import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { CATEGORY_COLORS, type Transaction, type TransactionCategory } from "../types";

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function SummaryStats({ transactions, month }: { transactions: Transaction[]; month: string }) {
  const { t } = useTranslation();
  const rows = transactions.filter((row) => row.date.startsWith(month));
  const income = rows.filter((row) => row.amount > 0).reduce((s, r) => s + r.amount, 0);
  const expenses = Math.abs(rows.filter((row) => row.amount < 0).reduce((s, r) => s + r.amount, 0));
  const net = income - expenses;

  const breakdown = Object.entries(
    rows.filter((r) => r.amount < 0).reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + Math.abs(r.amount);
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name: name as TransactionCategory, value }));

  return (
    <section className="rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-diffuse)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{t("summary.title")}</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">{t("summary.subtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t("summary.income")} value={`+฿${thb.format(income)}`} tone="text-emerald-700" />
        <Stat label={t("summary.expenses")} value={`-฿${thb.format(expenses)}`} tone="text-rose-600" />
        <Stat label={t("summary.net")} value={`${net >= 0 ? "+" : ""}฿${thb.format(net)}`} tone={net >= 0 ? "text-emerald-700" : "text-rose-600"} />
      </div>

      <div className="mt-6 grid items-center gap-5 lg:grid-cols-[220px_1fr]">
        <div className="relative h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={2} stroke="none">
                {breakdown.map((entry) => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "oklch(60% 0.05 260)"} />)}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`฿${thb.format(Number(value))}`, t(`category.${name}`)]}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 12, fontFamily: "var(--font-mono)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-ink-soft)]">{t("summary.total")}</span>
            <span className="font-mono text-lg font-semibold text-[var(--color-ink)]">฿{thb.format(expenses)}</span>
          </div>
        </div>

        <div className="space-y-2">
          {breakdown.length === 0 ? (
            <p className="rounded-2xl bg-[var(--color-base)] px-4 py-5 text-sm text-[var(--color-ink-soft)]">{t("summary.empty")}</p>
          ) : (
            breakdown.map((item) => {
              const pct = expenses > 0 ? Math.round((item.value / expenses) * 100) : 0;
              const color = CATEGORY_COLORS[item.name] ?? "oklch(60% 0.05 260)";
              return (
                <div key={item.name} className="rounded-2xl bg-[var(--color-base)] px-3.5 py-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {t(`category.${item.name}`)}
                    </span>
                    <span className="font-mono text-[var(--color-ink)]">฿{thb.format(item.value)} <span className="text-[var(--color-ink-soft)]">· {pct}%</span></span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--color-line)]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
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

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {  return (
    <div className="rounded-2xl bg-[var(--color-base)] px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">{label}</div>
      <div className={`mt-1 font-mono text-xl font-semibold tracking-tight ${tone}`}>{value}</div>
    </div>
  );
}
