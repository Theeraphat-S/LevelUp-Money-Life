import { describe, it, expect } from "vitest";
import { calculateLevelFromTotalXp, updateStreak } from "./gamification";

describe("Gamification Engine Logic", () => {
  it("should calculate correct level progression from total XP", () => {
    // Level 1: 0 - 99 XP
    const stats0 = calculateLevelFromTotalXp(0);
    expect(stats0.level).toBe(1);
    expect(stats0.currentLevelXp).toBe(0);
    expect(stats0.xpForNextLevel).toBe(100);
    expect(stats0.titleRankKey).toBe("rank.novice");

    // Level 2: 100 - 249 XP (100 required for Lv1 -> Lv2)
    const stats100 = calculateLevelFromTotalXp(120);
    expect(stats100.level).toBe(2);
    expect(stats100.currentLevelXp).toBe(20);
    expect(stats100.xpForNextLevel).toBe(150);
    expect(stats100.titleRankKey).toBe("rank.novice");

    // Level 3: 250 XP (100 + 150)
    const stats250 = calculateLevelFromTotalXp(250);
    expect(stats250.level).toBe(3);
    expect(stats250.titleRankKey).toBe("rank.tactician");

    // Level 6+: Strategist
    const stats6 = calculateLevelFromTotalXp(1000);
    expect(stats6.level).toBeGreaterThanOrEqual(6);
    expect(stats6.titleRankKey).toBe("rank.strategist");
  });

  it("should update streak correctly across days", () => {
    // Same day: streak remains unchanged
    const today = "2026-08-30";
    const sameDayResult = updateStreak(today, 5);
    expect(sameDayResult.newStreak).toBe(5);

    // Consecutive day: if last active was yesterday, streak increments by 1
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const consecutiveResult = updateStreak(yesterday, 3);
    expect(consecutiveResult.newStreak).toBe(4);

    // Long gap (e.g. 5 days ago): streak resets to 1
    const oldDate = "2026-01-01";
    const resetResult = updateStreak(oldDate, 10);
    expect(resetResult.newStreak).toBe(1);
  });
});
