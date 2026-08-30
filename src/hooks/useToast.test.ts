import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "./useToast";

describe("useToast hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show and auto hide toast after duration", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toastNotice.visible).toBe(false);

    act(() => {
      result.current.showToast("Test Toast", 2000);
    });

    expect(result.current.toastNotice.visible).toBe(true);
    expect(result.current.toastNotice.message).toBe("Test Toast");

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.toastNotice.visible).toBe(false);
  });
});
