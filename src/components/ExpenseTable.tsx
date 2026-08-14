import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Funnel, MagnifyingGlass, Plus, Trash, ArrowUUpLeft } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { Dispatch, SetStateAction } from "react";
import { EXPENSE_CATEGORIES, TRANSACTION_CATEGORIES, type Transaction, type TransactionCategory } from "../types";

export function ExpenseTable({ transactions, setTransactions }: { transactions: Transaction[]; setTransactions: Dispatch<SetStateAction<Transaction[]>> }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);

  const addExpenseRow = () => {
    setTransactions((rows) => [
      { id: crypto.randomUUID(), name: t("expense.expenseType"), amount: -100, date: new Date().toISOString().slice(0, 10), category: "Food", cleared: false },
      ...rows,
    ]);
  };

  const addIncomeRow = () => {
    setTransactions((rows) => [
      { id: crypto.randomUUID(), name: t("expense.incomeType"), amount: 1000, date: new Date().toISOString().slice(0, 10), category: "Income", cleared: false },
      ...rows,
    ]);
  };

  const updateRow = (id: string, patch: Partial<Transaction>) => setTransactions((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const toggleRowType = (row: Transaction, isIncome: boolean) => {
    const absAmount = Math.abs(row.amount) || (isIncome ? 1000 : 100);
    if (isIncome) {
      updateRow(row.id, { amount: absAmount, category: "Income" });
    } else {
      const nextCat = row.category === "Income" ? "Food" : row.category;
      updateRow(row.id, { amount: -absAmount, category: nextCat });
    }
  };

  const deleteRow = (row: Transaction) => {
    setLastDeleted(row);
    setTransactions((rows) => rows.filter((r) => r.id !== row.id));
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    setTransactions((rows) => [lastDeleted, ...rows.filter((r) => r.id !== lastDeleted.id)]);
    setLastDeleted(null);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
  };

  const filteredTransactions = transactions.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || row.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-tile)]">
      <div className="flex flex-col gap-4 border-b border-[var(--color-line)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[var(--color-ink)]">{t("expense.title")}</h2>
          <p className="text-xs text-[var(--color-ink-soft)]">{t("expense.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={addExpenseRow}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 transition hover:bg-zinc-800 dark:hover:bg-emerald-400 shadow-xs"
          >
            <Plus size={14} weight="bold" /> {t("expense.addExpense")}
          </button>
          <button
            onClick={addIncomeRow}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] shadow-xs"
          >
            <Plus size={14} weight="bold" /> {t("expense.addIncome")}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {lastDeleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-6 py-2.5 text-xs text-amber-900 dark:text-amber-200"
          >
            <span>{t("expense.deleted")}</span>
            <button
              onClick={undoDelete}
              className="inline-flex items-center gap-1 font-semibold text-amber-950 dark:text-amber-300 underline hover:no-underline"
            >
              <ArrowUUpLeft size={14} /> {t("expense.undo")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[var(--color-base)] px-6 py-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 focus-within:border-[var(--color-accent)]">
          <MagnifyingGlass size={16} className="text-[var(--color-ink-soft)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("expense.searchPlaceholder")}
            aria-label={t("expense.searchPlaceholder")}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Funnel size={15} className="text-[var(--color-ink-soft)]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label={t("expense.category")}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]"
          >
            <option value="ALL">{t("expense.allCategories")}</option>
            {TRANSACTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`category.${c}`)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-soft)] whitespace-nowrap">
              <th className="px-6 py-3 font-semibold">{t("expense.name")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.type")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.amount")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.category")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.cleared")}</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filteredTransactions.map((row) => {
                const positive = row.amount >= 0;
                return (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="group border-t border-[var(--color-line)] transition-colors hover:bg-[var(--color-base)]"
                  >
                    <td className="px-6 py-3">
                      <input
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        aria-label={t("expense.nameFor", { name: row.name || "entry" })}
                        className="w-48 rounded-lg border border-[var(--color-line)]/50 bg-[var(--color-surface)] px-2.5 py-1.5 text-[var(--color-ink)] transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="inline-flex rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-0.5" role="group" aria-label={t("expense.type")}>
                        <button
                          type="button"
                          onClick={() => toggleRowType(row, false)}
                          aria-pressed={!positive}
                          className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold transition ${!positive ? "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300" : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"}`}
                        >
                          {t("expense.expenseType")}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRowType(row, true)}
                          aria-pressed={positive}
                          className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold transition ${positive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"}`}
                        >
                          {t("expense.incomeType")}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-xs font-bold ${positive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" : "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300"}`}>
                            {positive ? "+฿" : "-฿"}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={Math.abs(row.amount)}
                            onChange={(e) => {
                              const val = Math.abs(Number(e.target.value));
                              updateRow(row.id, { amount: positive ? val : -val });
                            }}
                            aria-label={t("expense.amountFor", { name: row.name || "entry" })}
                            className={`w-28 rounded-lg border border-[var(--color-line)]/50 bg-[var(--color-surface)] px-2 py-1.5 font-mono font-medium transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none ${positive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(row.id, { date: e.target.value })}
                        aria-label={t("expense.dateFor", { name: row.name || "entry" })}
                        className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1.5 font-mono text-xs text-[var(--color-ink-soft)] outline-none transition focus:border-[var(--color-accent)]"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {positive ? (
                        <span className="whitespace-nowrap inline-flex rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          {t("category.Income")}
                        </span>
                      ) : (
                        <select
                          value={row.category}
                          onChange={(e) => updateRow(row.id, { category: e.target.value as TransactionCategory })}
                          aria-label={t("expense.categoryFor", { name: row.name || "entry" })}
                          className="whitespace-nowrap cursor-pointer rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]"
                        >
                          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={row.cleared}
                        onChange={(e) => updateRow(row.id, { cleared: e.target.checked })}
                        className="h-4 w-4 cursor-pointer accent-[var(--color-accent)]"
                        aria-label={t("expense.markCleared", { name: row.name })}
                      />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteRow(row)}
                        className="rounded-lg p-2 text-zinc-400 dark:text-zinc-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 focus:outline-none focus-visible:shadow-[var(--ring-accent)]"
                        aria-label={t("expense.delete")}
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="px-6 py-10 text-center">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">{t("expense.emptyTitle")}</h3>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{t("expense.emptyHint")}</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={addExpenseRow}
                className="rounded-full bg-zinc-950 dark:bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-emerald-400"
              >
                {t("expense.addExpense")}
              </button>
              <button
                type="button"
                onClick={addIncomeRow}
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-base)]"
              >
                {t("expense.addIncome")}
              </button>
            </div>
          </div>
        )}
        {transactions.length > 0 && filteredTransactions.length === 0 && (
          <div className="px-6 py-10 text-center">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">{t("expense.noResultsTitle")}</h3>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{t("expense.noResultsHint")}</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-base)]"
            >
              {t("expense.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
