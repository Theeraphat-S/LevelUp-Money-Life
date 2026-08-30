import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGamification } from "./useGamification";

// Mock services/db
vi.mock("../services/db", () => ({
  saveSetting: vi.fn().mockResolvedValue(undefined),
}));

describe("useGamification hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useGamification());
    expect(result.current.totalXp).toBe(180);
    expect(result.current.gamification.level).toBe(2);
    expect(result.current.streakDays).toBe(1);
    expect(result.current.levelUpModal.isOpen).toBe(false);
  });

  it("should increment XP accurately and handle consecutive awards without race conditions", () => {
    const { result } = renderHook(() => useGamification());

    act(() => {
      result.current.addXp(15);
      result.current.addXp(25);
      result.current.addXp(40);
    });

    // 180 + 15 + 25 + 40 = 260
    expect(result.current.totalXp).toBe(260);
    expect(result.current.gamification.level).toBe(3); // 250 XP is Level 3
    expect(result.current.levelUpModal.isOpen).toBe(true);
    expect(result.current.levelUpModal.level).toBe(3);
  });

  it("should allow closing level up modal", () => {
    const { result } = renderHook(() => useGamification());

    act(() => {
      result.current.addXp(100); // Triggers level up
    });

    expect(result.current.levelUpModal.isOpen).toBe(true);

    act(() => {
      result.current.closeLevelUpModal();
    });

    expect(result.current.levelUpModal.isOpen).toBe(false);
  });
});
