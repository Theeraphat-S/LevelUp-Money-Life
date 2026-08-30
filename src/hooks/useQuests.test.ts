import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuests } from "./useQuests";

vi.mock("../services/db", () => ({
  saveAllQuests: vi.fn().mockResolvedValue(undefined),
}));

describe("useQuests hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize quests and allow toggling", () => {
    const { result } = renderHook(() => useQuests());
    const onAwardXp = vi.fn();

    act(() => {
      result.current.initQuests([
        { id: "q1", title: "Log expense", date: "2026-08-30", xp: 15, done: false },
        { id: "q2", title: "Review budget", date: "2026-08-30", xp: 20, done: true },
      ]);
    });

    expect(result.current.quests.length).toBe(2);

    // Toggle q1 from false to true -> should award 15 XP
    act(() => {
      result.current.toggleQuest("q1", onAwardXp);
    });

    expect(result.current.quests[0].done).toBe(true);
    expect(onAwardXp).toHaveBeenCalledWith(15);
  });

  it("should auto complete logging quest q1", () => {
    const { result } = renderHook(() => useQuests());
    const onAwardXp = vi.fn();

    act(() => {
      result.current.initQuests([
        { id: "q1", title: "Log expense", date: "2026-08-30", xp: 15, done: false },
      ]);
    });

    act(() => {
      result.current.autoCompleteLoggingQuest(onAwardXp);
    });

    expect(result.current.quests[0].done).toBe(true);
    expect(onAwardXp).toHaveBeenCalledWith(15);
  });
});
