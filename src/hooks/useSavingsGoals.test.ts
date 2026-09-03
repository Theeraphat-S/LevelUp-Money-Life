import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSavingsGoals } from "./useSavingsGoals";
import type { SavingsGoal } from "../types";

const getSampleGoals = (): SavingsGoal[] => [
  {
    id: "goal-test-1",
    title: "Emergency Fund",
    category: "emergency",
    targetAmount: 50000,
    currentAmount: 10000,
    targetDate: "2026-12-31",
    icon: "ShieldCheck",
    status: "active",
    milestonesReached: [],
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
];

vi.mock("../services/db", () => ({
  INITIAL_SAVINGS_GOALS: [
    {
      id: "goal-test-1",
      title: "Emergency Fund",
      category: "emergency",
      targetAmount: 50000,
      currentAmount: 10000,
      targetDate: "2026-12-31",
      icon: "ShieldCheck",
      status: "active",
      milestonesReached: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
  ],
  getSavingsGoals: vi.fn().mockImplementation(() => Promise.resolve(getSampleGoals())),
  saveSavingsGoal: vi.fn().mockResolvedValue(undefined),
  deleteSavingsGoal: vi.fn().mockResolvedValue(undefined),
  saveAllSavingsGoals: vi.fn().mockResolvedValue(undefined),
}));

describe("useSavingsGoals hook", () => {
  const mockAddTransaction = vi.fn();
  const mockAddXp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default goals and calculate metrics", async () => {
    const { result } = renderHook(() =>
      useSavingsGoals({
        onAddTransaction: mockAddTransaction,
        onAwardXp: mockAddXp,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.goals.length).toBe(1);
    expect(result.current.totalSaved).toBe(10000);
    expect(result.current.totalTarget).toBe(50000);
    expect(result.current.overallProgress).toBe(20);
  });

  it("should deposit money to a goal, sync with transactions, and award XP", async () => {
    const { result } = renderHook(() =>
      useSavingsGoals({
        onAddTransaction: mockAddTransaction,
        onAwardXp: mockAddXp,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      const res = await result.current.depositToGoal("goal-test-1", 15000);
      expect(res.newlyReachedMilestones).toContain(25);
      expect(res.newlyReachedMilestones).toContain(50);
      expect(res.xpEarned).toBeGreaterThan(0);
    });

    const updated = result.current.goals.find((g) => g.id === "goal-test-1");
    expect(updated?.currentAmount).toBe(25000);
    expect(updated?.milestonesReached).toEqual([25, 50]);

    // Verify transaction was synced
    expect(mockAddTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "Savings",
        amount: -15000,
      })
    );

    // Verify XP was awarded
    expect(mockAddXp).toHaveBeenCalled();
  });

  it("should withdraw money from a goal and sync transaction", async () => {
    const { result } = renderHook(() =>
      useSavingsGoals({
        onAddTransaction: mockAddTransaction,
        onAwardXp: mockAddXp,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.withdrawFromGoal("goal-test-1", 5000);
    });

    const updated = result.current.goals.find((g) => g.id === "goal-test-1");
    expect(updated?.currentAmount).toBe(5000);

    expect(mockAddTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "Savings",
        amount: 5000,
      })
    );
  });
});

