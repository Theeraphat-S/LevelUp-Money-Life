import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransactions } from "./useTransactions";
import type { Transaction } from "../types";

vi.mock("../services/db", () => ({
  saveAllTransactions: vi.fn().mockResolvedValue(undefined),
}));

describe("useTransactions hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log quick transaction and update lastLoggedTx", () => {
    const { result } = renderHook(() => useTransactions());
    const onAwardXp = vi.fn();
    const onAfterLogged = vi.fn();

    const sampleTx: Transaction = {
      id: "tx-99",
      name: "Coffee",
      amount: -85,
      date: "2026-08-30",
      category: "Food",
      cleared: true,
    };

    act(() => {
      result.current.logQuickTransaction(sampleTx, { onAwardXp, onAfterLogged });
    });

    expect(result.current.transactions.length).toBe(1);
    expect(result.current.transactions[0].id).toBe("tx-99");
    expect(result.current.lastLoggedTx).toEqual(sampleTx);
    expect(onAwardXp).toHaveBeenCalledWith(15);
    expect(onAfterLogged).toHaveBeenCalledWith(sampleTx);
  });

  it("should undo transaction and clear lastLoggedTx", () => {
    const { result } = renderHook(() => useTransactions());
    const onDeductXp = vi.fn();

    const sampleTx: Transaction = {
      id: "tx-99",
      name: "Coffee",
      amount: -85,
      date: "2026-08-30",
      category: "Food",
      cleared: true,
    };

    act(() => {
      result.current.logQuickTransaction(sampleTx);
    });

    expect(result.current.transactions.length).toBe(1);

    act(() => {
      result.current.undoTransaction(sampleTx, { onDeductXp });
    });

    expect(result.current.transactions.length).toBe(0);
    expect(result.current.lastLoggedTx).toBeNull();
    expect(onDeductXp).toHaveBeenCalledWith(15);
  });
});
