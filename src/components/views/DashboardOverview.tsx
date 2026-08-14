import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  Circle,
  Coins,
  PiggyBank,
  Receipt,
  Scales,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { BentoCard } from "../common/BentoCard";
import { MetricTile } from "../common/MetricTile";
import {
  CATEGORY_BUCKET_MAP,
  CATEGORY_COLORS,
  type Allocation,
  type Quest,
  type Transaction,
  type ViewTab,
} from "../../types";

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

interface DashboardOverviewProps {
  transactions: Transaction[];
  allocations: Allocation[];
  quests: Quest[];
  income: number;
  activeMonth: string;
  setActiveTab: (tab: ViewTab) => void;
  onToggleQuest: (id: string) => void;
  onOpenQuickAdd: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  allocations,
  quests,
  income,
  activeMonth,
  setActiveTab,
  onToggleQuest,
  onOpenQuickAdd,
}) => {
  const { t } = useTranslation();

  // Filter transactions for the selected month
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(activeMonth));
  const monthIncome = monthTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthExpenses = Math.abs(
    monthTransactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );
  const netCashFlow = monthIncome - monthExpenses;
  const clearedCount = monthTransactions.filter((tx) => tx.cleared).length;
  const totalCount = monthTransactions.length;

  const savingsRate =
    monthIncome > 0
      ? Math.max(0, Math.round(((monthIncome - monthExpenses) / monthIncome) * 100))
      : 0;

  // Compute actual spent per bucket
  const bucketActuals: Record<"Needs" | "Wants" | "Savings", number> = {
    Needs: 0,
    Wants: 0,
    Savings: 0,
  };

  monthTransactions
    .filter((tx) => tx.amount < 0)
    .forEach((tx) => {
      if (tx.category !== "Income") {
        const bucket = CATEGORY_BUCKET_MAP[tx.category] || "Wants";
        bucketActuals[bucket] += Math.abs(tx.amount);
      }
    });

  const recentTransactions = [...monthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const completedQuests = quests.filter((q) => q.done).length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={<ChartLineUp size={18} weight="duotone" />}
          label={t("metric.net")}
          value={`${netCashFlow >= 0 ? "+" : ""}฿${thb.format(netCashFlow)}`}
          subtext={netCashFlow >= 0 ? "Positive cash flow" : "Net deficit"}
          tone={netCashFlow >= 0 ? "emerald" : "rose"}
        />
        <MetricTile
          icon={<Coins size={18} weight="duotone" />}
          label={t("metric.income")}
          value={`฿${thb.format(monthIncome)}`}
          subtext={`Budget baseline: ฿${thb.format(income)}`}
          tone="emerald"
        />
        <MetricTile
          icon={<Receipt size={18} weight="duotone" />}
          label={t("metric.spent")}
          value={`฿${thb.format(monthExpenses)}`}
          subtext={`${totalCount} total entries logged`}
          tone="rose"
        />
        <MetricTile
          icon={<PiggyBank size={18} weight="duotone" />}
          label={t("metric.savingsRate")}
          value={`${savingsRate}%`}
          subtext={`Cleared logs: ${clearedCount}/${totalCount}`}
          tone={savingsRate >= 20 ? "emerald" : "amber"}
        />
      </div>

      {/* Bento Row 1: Budget Health & Daily Quests */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Budget Health Card (7 cols) */}
        <BentoCard
          className="lg:col-span-7"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scales size={18} weight="duotone" className="text-emerald-600" />
                <h3 className="text-sm font-bold tracking-tight text-[var(--color-ink)]">
                  {t("plan.title")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("budget")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
              >
                <span>{t("tabs.budget")}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {(["Needs", "Wants", "Savings"] as const).map((bucketKey) => {
              const alloc = allocations.find((a) => a.label.toLowerCase().includes(bucketKey.toLowerCase()));
              const percent = alloc ? alloc.percent : bucketKey === "Needs" ? 50 : bucketKey === "Wants" ? 30 : 20;
              const plannedBudget = Math.round((income * percent) / 100);
              const actual = bucketActuals[bucketKey];
              const consumedPct = plannedBudget > 0 ? Math.min(100, Math.round((actual / plannedBudget) * 100)) : 0;
              const isOver = actual > plannedBudget && plannedBudget > 0;

              return (
                <div key={bucketKey} className="rounded-xl border border-[var(--color-line)] p-3.5 bg-[var(--color-surface-subtle)]">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[var(--color-ink)]">
                      {t(`alloc.${bucketKey}`)} ({percent}%)
                    </span>
                    <span className="font-mono text-[var(--color-ink)]">
                      ฿{thb.format(actual)}{" "}
                      <span className="text-[var(--color-ink-soft)] font-normal">
                        / ฿{thb.format(plannedBudget)}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? "bg-rose-500"
                          : bucketKey === "Needs"
                          ? "bg-emerald-500"
                          : bucketKey === "Wants"
                          ? "bg-indigo-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${consumedPct}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--color-ink-soft)]">
                    <span>{consumedPct}% used</span>
                    <span className={isOver ? "font-bold text-rose-600" : ""}>
                      {isOver
                        ? t("plan.overBudget", { amount: thb.format(actual - plannedBudget) })
                        : `฿${thb.format(plannedBudget - actual)} ${t("plan.remaining")}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Daily Quests Widget (5 cols) */}
        <BentoCard
          className="lg:col-span-5"
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkle size={18} weight="fill" className="text-amber-500" />
                <h3 className="text-sm font-bold tracking-tight text-[var(--color-ink)]">
                  {t("quests.title")}
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-700 border border-emerald-500/20">
                {completedQuests}/{quests.length}
              </span>
            </div>
          }
        >
          <div className="space-y-2.5">
            {quests.slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                onClick={() => onToggleQuest(quest.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                  quest.done
                    ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-400"
                    : "border-[var(--color-line)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {quest.done ? (
                    <CheckCircle size={20} weight="fill" className="text-emerald-600 shrink-0" />
                  ) : (
                    <Circle size={20} weight="duotone" className="text-zinc-400 shrink-0" />
                  )}
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        quest.done ? "line-through text-zinc-400" : "text-[var(--color-ink)]"
                      }`}
                    >
                      {quest.title}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-ink-soft)]">
                      {quest.date}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                  +{quest.xp} XP
                </span>
              </div>
            ))}

            {quests.length === 0 && (
              <div className="rounded-xl bg-[var(--color-surface-subtle)] p-4 text-center text-xs text-[var(--color-ink-soft)]">
                {t("quests.empty")}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--color-line)] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("quests")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
              <span>{t("tabs.quests")}</span>
              <ArrowRight size={13} />
            </button>
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition shadow-xs"
            >
              + {t("header.quickAdd")}
            </button>
          </div>
        </BentoCard>
      </div>

      {/* Bento Row 2: Recent Activity Ledger Feed */}
      <BentoCard
        header={
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[var(--color-ink)]">
                {t("expense.title")} · {activeMonth}
              </h3>
              <p className="text-xs text-[var(--color-ink-soft)]">
                {t("expense.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("ledger")}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition shadow-xs"
            >
              <span>{t("tabs.ledger")}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">
                <th className="py-2.5 px-3">{t("expense.name")}</th>
                <th className="py-2.5 px-3">{t("expense.category")}</th>
                <th className="py-2.5 px-3">{t("expense.date")}</th>
                <th className="py-2.5 px-3 text-right">{t("expense.amount")}</th>
                <th className="py-2.5 px-3 text-center">{t("expense.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {recentTransactions.map((row) => {
                const isPositive = row.amount >= 0;
                const catColor = CATEGORY_COLORS[row.category] || "oklch(60% 0.1 260)";
                return (
                  <tr key={row.id} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-ink)]">
                      <div className="flex items-center gap-2">
                        <span>{row.name}</span>
                        {row.notes && (
                          <span className="rounded-sm bg-zinc-100 px-1 py-0.2 text-[9px] text-zinc-600 font-normal">
                            {row.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium border border-[var(--color-line)] bg-[var(--color-surface)] text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        {t(`category.${row.category}`)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--color-ink-soft)] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right whitespace-nowrap">
                      <span className={isPositive ? "text-emerald-700" : "text-rose-600"}>
                        {isPositive ? "+" : "-"}฿{thb.format(Math.abs(row.amount))}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {row.cleared ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-500/20">
                          <ShieldCheck size={12} weight="fill" />
                          {t("expense.cleared")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-500/20">
                          {t("expense.pending")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recentTransactions.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--color-ink-soft)]">
              {t("expense.emptyTitle")}
            </div>
          )}
        </div>
      </BentoCard>
    </div>
  );
};
