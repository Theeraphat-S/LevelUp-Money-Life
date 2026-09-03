import { describe, it, expect } from "vitest";
import {
  calculateSavingsPace,
  calculateEmergencyFundTarget,
  checkGoalMilestones,
  SAVINGS_MILESTONE_XP,
} from "./savingsGoals";
import type { SavingsGoal } from "../types";

describe("Savings Goals Utilities", () => {
  const baseGoal: SavingsGoal = {
    id: "goal-1",
    title: "Emergency Fund",
    category: "emergency",
    targetAmount: 100000,
    currentAmount: 20000,
    targetDate: "2026-12-31",
    icon: "ShieldCheck",
    status: "active",
    milestonesReached: [],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  it("should calculate correct savings pace with target date", () => {
    const pace = calculateSavingsPace(baseGoal, "2026-10-01");
    expect(pace.progressPercent).toBe(20);
    expect(pace.remainingAmount).toBe(80000);
    expect(pace.daysRemaining).toBe(91);
    expect(pace.monthsRemaining).toBe(3);
    expect(pace.requiredPerMonth).toBeGreaterThan(0);
    expect(pace.requiredPerDay).toBeGreaterThan(0);
    expect(pace.status).toBe("on_track");
  });

  it("should handle goals without target dates", () => {
    const noDeadlineGoal: SavingsGoal = {
      ...baseGoal,
      targetDate: undefined,
    };
    const pace = calculateSavingsPace(noDeadlineGoal);
    expect(pace.progressPercent).toBe(20);
    expect(pace.daysRemaining).toBeNull();
    expect(pace.monthsRemaining).toBeNull();
    expect(pace.status).toBe("no_deadline");
  });

  it("should mark goal completed when target is met", () => {
    const completedGoal: SavingsGoal = {
      ...baseGoal,
      currentAmount: 120000,
    };
    const pace = calculateSavingsPace(completedGoal, "2026-10-01");
    expect(pace.progressPercent).toBe(100);
    expect(pace.remainingAmount).toBe(0);
    expect(pace.status).toBe("completed");
  });

  it("should calculate emergency fund target accurately for 3 and 6 months", () => {
    expect(calculateEmergencyFundTarget(25000, 3)).toBe(75000);
    expect(calculateEmergencyFundTarget(25000, 6)).toBe(150000);
  });

  it("should detect new milestones and calculate total XP correctly", () => {
    // Going from 20k to 55k on a 100k target reaches both 25% and 50%
    const result = checkGoalMilestones(20000, 55000, 100000, []);
    expect(result.newlyReached).toEqual([25, 50]);
    expect(result.xpEarned).toBe(SAVINGS_MILESTONE_XP[25] + SAVINGS_MILESTONE_XP[50]);

    // Already reached 25%, now going from 55k to 80k reaches 75%
    const nextResult = checkGoalMilestones(55000, 80000, 100000, [25, 50]);
    expect(nextResult.newlyReached).toEqual([75]);
    expect(nextResult.xpEarned).toBe(SAVINGS_MILESTONE_XP[75]);

    // Completing to 100%
    const finalResult = checkGoalMilestones(80000, 100000, 100000, [25, 50, 75]);
    expect(finalResult.newlyReached).toEqual([100]);
    expect(finalResult.xpEarned).toBe(SAVINGS_MILESTONE_XP[100]);
  });
});
