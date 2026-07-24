import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function SummaryStats({ transactions, month }: { transactions: import("../types").Transaction[]; month: string }) {
  const rows = transactions.filter((row) => row.date.startsWith(month));
  const income = rows.filter((row) => row.amount > 0).reduce((s, r) => s + r.amount, 0);
  const expenses = Math.abs(rows.filter((row) => row.amount < 0).reduce((s, r) => s + r.amount, 0));
  const net = income - expenses;

  const breakdown = Object.entries(
    rows.filter((r) => r.amount < 0).reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + Math.abs(r.amount);
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <section className="rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-diffuse)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">Month-end summary</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">Where the money went this month.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Income" value={`฿${thb.format(income)}`} tone="text-[var(--color-accent-ink)]" />
        <Stat label="Expenses" value={`฿${thb.format(expenses)}`} tone="text-[oklch(48%_0.16_25)]" />
        <Stat label="Net" value={`฿${thb.format(net)}`} tone={net >= 0 ? "text-[var(--color-accent-ink)]" : "text-[oklch(48%_0.16_25)]"} />
      </div>

      <div className="mt-6 grid items-center gap-5 lg:grid-cols-[220px_1fr]">
        <div className="relative h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={2} stroke="none">
                {breakdown.map((entry) => <Cell key={entry.name} fill={categoryColors[entry.name] ?? "#94a3b8"} />)}
              </Pie>
              <Tooltip
                formatter={(value) => [`฿${thb.format(Number(value))}`, "Spent"]}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-line)", background: "var(--color-surface)", fontSize: 12, fontFamily: "var(--font-mono)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-ink-soft)]">Total</span>
            <span className="font-mono text-lg font-semibold text-[var(--color-ink)]">฿{thb.format(expenses)}</span>
          </div>
        </div>

        <div className="space-y-2">
          {breakdown.length === 0 ? (
            <p className="rounded-2xl bg-[var(--color-base)] px-4 py-5 text-sm text-[var(--color-ink-soft)]">No expenses logged this month yet.</p>
          ) : (
            breakdown.map((item) => {
              const pct = expenses > 0 ? Math.round((item.value / expenses) * 100) : 0;
              return (
                <div key={item.name} className="rounded-2xl bg-[var(--color-base)] px-3.5 py-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[item.name] ?? "#94a3b8" }} />
                      {item.name}
                    </span>
                    <span className="font-mono text-[var(--color-ink)]">฿{thb.format(item.value)} <span className="text-[var(--color-ink-soft)]">· {pct}%</span></span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--color-line)]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: categoryColors[item.name] ?? "#94a3b8" }} />
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
