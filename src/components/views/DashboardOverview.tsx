import React, { useState } from "react";
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
import { TactileButton } from "../common/TactileButton";
import { FloatingReward, type FloatingRewardItem } from "../common/FloatingReward";
import {
  CATEGORY_BUCKET_MAP,
  CATEGORY_COLORS,
  type Allocation,
  type Quest,
  type SavingsGoal,
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
  savingsGoals?: SavingsGoal[];
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
  savingsGoals,
}) => {
  const { t } = useTranslation();
  const [floatingRewards, setFloatingRewards] = useState<FloatingRewardItem[]>([]);

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

  const handleQuestClick = (quest: Quest, e: React.MouseEvent) => {
    if (!quest.done) {
      const newReward: FloatingRewardItem = {
        id: `${quest.id}-${Date.now()}`,
        text: `+${quest.xp} XP Completed!`,
        x: e.clientX,
        y: e.clientY,
      };
      setFloatingRewards((prev) => [...prev, newReward]);
    }
    onToggleQuest(quest.id);
  };

  return (
    <div className="space-y-6">
      <FloatingReward
        rewards={floatingRewards}
        onComplete={(id) => {
          setFloatingRewards((prev) => prev.filter((r) => r.id !== id));
        }}
      />

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={<ChartLineUp size={18} weight="duotone" />}
          label={t("metric.net")}
          numericValue={netCashFlow}
          prefix="฿"
          showSign={true}
          subtext={netCashFlow >= 0 ? "Positive cash flow" : "Net deficit"}
          tone={netCashFlow >= 0 ? "jade" : "rose"}
        />
        <MetricTile
          icon={<Coins size={18} weight="duotone" />}
          label={t("metric.income")}
          numericValue={monthIncome}
          prefix="฿"
          subtext={`Budget baseline: ฿${thb.format(income)}`}
          tone="jade"
        />
        <MetricTile
          icon={<Receipt size={18} weight="duotone" />}
          label={t("metric.spent")}
          numericValue={monthExpenses}
          prefix="฿"
          subtext={`${totalCount} total entries logged`}
          tone="rose"
        />
        <MetricTile
          icon={<PiggyBank size={18} weight="duotone" />}
          label={t("metric.savingsRate")}
          numericValue={savingsRate}
          suffix="%"
          subtext={`Cleared logs: ${clearedCount}/${totalCount}`}
          tone={savingsRate >= 20 ? "jade" : "amber"}
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
                <Scales size={18} weight="duotone" className="text-[var(--primary)]" />
                <h3 className="text-sm font-bold tracking-tight text-[var(--color-ink)]">
                  {t("plan.title")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("budget")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary-ink)] hover:underline transition"
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
                          ? "bg-[var(--rose)]"
                          : bucketKey === "Needs"
                          ? "bg-[var(--primary)]"
                          : bucketKey === "Wants"
                          ? "bg-[var(--moss)]"
                          : "bg-[var(--jade)]"
                      }`}
                      style={{ width: `${consumedPct}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--color-ink-soft)]">
                    <span>{consumedPct}% used</span>
                    <span className={isOver ? "font-bold text-[var(--rose-ink)]" : ""}>
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
                <Sparkle size={18} weight="fill" className="text-[var(--amber)]" />
                <h3 className="text-sm font-bold tracking-tight text-[var(--color-ink)]">
                  {t("quests.title")}
                </h3>
              </div>
              <span className="rounded-full bg-[var(--jade-soft)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--jade-ink)] border border-[var(--jade)]/30">
                {completedQuests}/{quests.length}
              </span>
            </div>
          }
        >
          <div className="space-y-2.5">
            {quests.slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                onClick={(e) => handleQuestClick(quest, e)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                  quest.done
                    ? "border-[var(--jade)]/30 bg-[var(--jade-soft)]/50 text-[var(--color-ink-soft)]"
                    : "border-[var(--color-line)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {quest.done ? (
                    <CheckCircle size={20} weight="fill" className="text-[var(--jade)] shrink-0" />
                  ) : (
                    <Circle size={20} weight="duotone" className="text-[var(--color-ink-soft)] shrink-0" />
                  )}
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        quest.done ? "line-through text-[var(--color-ink-soft)] opacity-70" : "text-[var(--color-ink)]"
                      }`}
                    >
                      {quest.title}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-ink-soft)]">
                      {quest.date}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--jade-ink)] bg-[var(--jade-soft)] px-2 py-0.5 rounded-md border border-[var(--jade)]/25 shrink-0">
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
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary-ink)] hover:underline transition"
            >
              <span>{t("tabs.quests")}</span>
              <ArrowRight size={13} />
            </button>
            <TactileButton
              type="button"
              onClick={onOpenQuickAdd}
              className="rounded-lg bg-[#1C5954] text-[#FEFFFC] dark:bg-[#76AA9D] dark:text-[#071B1A] px-3 py-1.5 text-xs font-bold hover:opacity-90 transition shadow-xs"
            >
              + {t("header.quickAdd")}
            </TactileButton>
          </div>
        </BentoCard>
      </div>

      {/* Bento Row 2: Active Savings Goals Widget */}
      {savingsGoals && savingsGoals.length > 0 && (
        <BentoCard
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank size={18} weight="fill" className="text-[var(--jade)]" />
                <h3 className="text-sm font-bold tracking-tight text-[var(--color-ink)]">
                  {t("tabs.savings")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("savings")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary-ink)] hover:underline transition"
              >
                <span>{t("tabs.savings")}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savingsGoals.slice(0, 3).map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / Math.max(1, goal.targetAmount)) * 100));
              return (
                <div
                  key={goal.id}
                  onClick={() => setActiveTab("savings")}
                  className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)]/60 p-3 hover:bg-[var(--color-surface-subtle)] cursor-pointer transition"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--color-ink)] mb-1">
                    <span className="truncate">{goal.title}</span>
                    <span className="font-mono text-[var(--jade-ink)]">{pct}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1C5954] to-[#4D8E75] dark:from-[#76AA9D] dark:to-[#8BB999]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[var(--color-ink-soft)]">
                    <span>฿{thb.format(goal.currentAmount)}</span>
                    <span>฿{thb.format(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>
      )}

      {/* Bento Row 3: Recent Activity Ledger Feed */}
      <BentoCard
        header={
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-sm sm:text-base font-bold tracking-tight"
                style={{ color: 'var(--ink)' }}
              >
                {t("expense.title")} · {activeMonth}
              </h3>
              <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
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
                const catColor = CATEGORY_COLORS[row.category] || "var(--color-line)";
                return (
                  <tr key={row.id} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-ink)]">
                      <div className="flex items-center gap-2">
                        <span>{row.name}</span>
                        {row.notes && (
                          <span className="rounded-sm bg-[var(--color-surface-subtle)] px-1 py-0.2 text-[9px] text-[var(--color-ink-soft)] font-normal border border-[var(--color-line)]">
                            {row.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-medium border border-[var(--color-line)] bg-[var(--color-surface)] text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        {t(`category.${row.category}`)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--color-ink-soft)] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right whitespace-nowrap">
                      <span className={isPositive ? "text-[var(--jade-ink)]" : "text-[var(--rose-ink)]"}>
                        {isPositive ? "+" : "-"}฿{thb.format(Math.abs(row.amount))}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {row.cleared ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--jade-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--jade-ink)] border border-[var(--jade)]/30">
                          <ShieldCheck size={12} weight="fill" />
                          {t("expense.cleared")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--amber-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--amber-ink)] border border-[var(--amber)]/30">
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
