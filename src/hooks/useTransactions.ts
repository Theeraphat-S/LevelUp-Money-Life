import { useState, useCallback } from "react";
import { saveAllTransactions } from "../services/db";
import { DEFAULT_PRESETS, saveStoredPresets } from "../utils/presetManager";
import type { PresetItem, Transaction } from "../types";

export function useTransactions() {
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [presets, setPresetsState] = useState<PresetItem[]>(DEFAULT_PRESETS);
  const [lastLoggedTx, setLastLoggedTx] = useState<Transaction | null>(null);

  const setTransactions = useCallback(
    (value: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
      setTransactionsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        saveAllTransactions(next).catch(console.error);
        return next;
      });
    },
    []
  );

  const setPresets = useCallback(
    (value: PresetItem[] | ((prev: PresetItem[]) => PresetItem[])) => {
      setPresetsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        saveStoredPresets(next).catch(console.error);
        return next;
      });
    },
    []
  );

  const logQuickTransaction = useCallback(
    (
      newTx: Transaction,
      hooks?: {
        onAwardXp?: (xp: number) => void;
        onAfterLogged?: (newTx: Transaction) => void;
      }
    ) => {
      setTransactions((prev) => [newTx, ...prev]);
      setLastLoggedTx(newTx);
      if (hooks?.onAwardXp) {
        hooks.onAwardXp(15);
      }
      if (hooks?.onAfterLogged) {
        hooks.onAfterLogged(newTx);
      }
    },
    [setTransactions]
  );

  const undoTransaction = useCallback(
    (
      tx: Transaction,
      hooks?: {
        onDeductXp?: (xp: number) => void;
        onToast?: (message: string) => void;
        undoNoticeMessage?: string;
      }
    ) => {
      setTransactions((prev) => prev.filter((item) => item.id !== tx.id));
      setLastLoggedTx(null);
      if (hooks?.onDeductXp) {
        hooks.onDeductXp(15);
      }
      if (hooks?.onToast && hooks?.undoNoticeMessage) {
        hooks.onToast(hooks.undoNoticeMessage);
      }
    },
    [setTransactions]
  );

  // Alias for semantic clarity when saving from QuickAddModal
  const saveQuickTransaction = logQuickTransaction;

  const saveSlipTransaction = useCallback(
    (
      newTx: Transaction,
      xpBonus = 25,
      hooks?: {
        onAwardXp?: (xp: number) => void;
        onAfterLogged?: (newTx: Transaction) => void;
        onToast?: (message: string) => void;
        toastMessage?: string;
      }
    ) => {
      setTransactions((prev) => [newTx, ...prev]);
      if (hooks?.onAwardXp) {
        hooks.onAwardXp(xpBonus);
      }
      if (hooks?.onAfterLogged) {
        hooks.onAfterLogged(newTx);
      }
      if (hooks?.onToast && hooks?.toastMessage) {
        hooks.onToast(hooks.toastMessage);
      }
    },
    [setTransactions]
  );

  const saveBatchSlipTransactions = useCallback(
    (
      newTxs: Transaction[],
      totalXpBonus: number,
      hooks?: {
        onAwardXp?: (xp: number) => void;
        onAfterLoggedBatch?: (newTxs: Transaction[]) => void;
        onToast?: (message: string) => void;
        toastMessage?: string;
      }
    ) => {
      if (!newTxs || newTxs.length === 0) return;
      setTransactions((prev) => [...newTxs, ...prev]);
      if (hooks?.onAwardXp) {
        hooks.onAwardXp(totalXpBonus);
      }
      if (hooks?.onAfterLoggedBatch) {
        hooks.onAfterLoggedBatch(newTxs);
      }
      if (hooks?.onToast && hooks?.toastMessage) {
        hooks.onToast(hooks.toastMessage);
      }
    },
    [setTransactions]
  );

  const importTransactions = useCallback(
    (
      imported: Transaction[],
      hooks?: {
        onAwardXp?: (xp: number) => void;
      }
    ) => {
      setTransactions((prev) => [...imported, ...prev]);
      if (hooks?.onAwardXp) {
        hooks.onAwardXp(imported.length * 10);
      }
    },
    [setTransactions]
  );

  const initTransactions = useCallback(
    (initialTxs: Transaction[], initialPresets: PresetItem[]) => {
      setTransactionsState(initialTxs);
      setPresetsState(initialPresets);
    },
    []
  );

  return {
    transactions,
    setTransactions,
    setTransactionsState,
    presets,
    setPresets,
    setPresetsState,
    lastLoggedTx,
    setLastLoggedTx,
    logQuickTransaction,
    undoTransaction,
    saveQuickTransaction,
    saveSlipTransaction,
    saveBatchSlipTransactions,
    importTransactions,
    initTransactions,
  };
}
