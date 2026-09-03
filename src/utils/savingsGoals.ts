import type { SavingsGoal } from "../types";

export const SAVINGS_MILESTONES = [25, 50, 75, 100] as const;

export const SAVINGS_MILESTONE_XP: Record<number, number> = {
  25: 50,
  50: 100,
  75: 150,
  100: 300,
};

export const XP_PER_SAVINGS_DEPOSIT = 15;

export type SavingsPaceResult = {
  progressPercent: number;
  remainingAmount: number;
  daysRemaining: number | null;
  monthsRemaining: number | null;
  requiredPerMonth: number;
  requiredPerDay: number;
  status: "completed" | "on_track" | "overdue" | "no_deadline";
};

/**
 * Calculates pace and remaining requirements to achieve a savings goal.
 */
export function calculateSavingsPace(goal: SavingsGoal, referenceDate?: string): SavingsPaceResult {
  const target = Math.max(1, goal.targetAmount);
  const current = Math.max(0, goal.currentAmount);
  const progressPercent = Math.min(100, Math.round((current / target) * 100));
  const remainingAmount = Math.max(0, target - current);

  if (progressPercent >= 100) {
    return {
      progressPercent: 100,
      remainingAmount: 0,
      daysRemaining: 0,
      monthsRemaining: 0,
      requiredPerMonth: 0,
      requiredPerDay: 0,
      status: "completed",
    };
  }

  if (!goal.targetDate) {
    return {
      progressPercent,
      remainingAmount,
      daysRemaining: null,
      monthsRemaining: null,
      requiredPerMonth: 0,
      requiredPerDay: 0,
      status: "no_deadline",
    };
  }

  const todayStr = referenceDate || new Date().toISOString().slice(0, 10);
  const today = new Date(todayStr);
  const targetDate = new Date(goal.targetDate);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

  if (diffDays <= 0) {
    return {
      progressPercent,
      remainingAmount,
      daysRemaining: diffDays,
      monthsRemaining: 0,
      requiredPerMonth: remainingAmount,
      requiredPerDay: remainingAmount,
      status: "overdue",
    };
  }

  // Months remaining (averaging ~30.4 days/month)
  const monthsRemaining = Math.max(1, Math.ceil(diffDays / 30.4375));
  const requiredPerMonth = Math.round(remainingAmount / monthsRemaining);
  const requiredPerDay = Math.round(remainingAmount / diffDays);

  return {
    progressPercent,
    remainingAmount,
    daysRemaining: diffDays,
    monthsRemaining,
    requiredPerMonth,
    requiredPerDay,
    status: "on_track",
  };
}

/**
 * Calculates recommended Emergency Fund target based on average monthly expenses.
 */
export function calculateEmergencyFundTarget(monthlyAverageExpense: number, months: 3 | 6): number {
  return Math.round(Math.max(0, monthlyAverageExpense) * months);
}

/**
 * Checks if new milestones are crossed after a deposit and computes XP earned.
 */
export function checkGoalMilestones(
  previousAmount: number,
  newAmount: number,
  targetAmount: number,
  alreadyReached: number[]
): { newlyReached: number[]; xpEarned: number } {
  if (targetAmount <= 0) return { newlyReached: [], xpEarned: 0 };

  const prevPercent = (previousAmount / targetAmount) * 100;
  const newPercent = (newAmount / targetAmount) * 100;

  const newlyReached: number[] = [];
  let xpEarned = 0;

  for (const m of SAVINGS_MILESTONES) {
    if (newPercent >= m && prevPercent < m && !alreadyReached.includes(m)) {
      newlyReached.push(m);
      xpEarned += SAVINGS_MILESTONE_XP[m] || 0;
    }
  }

  return { newlyReached, xpEarned };
}
