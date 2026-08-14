import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUUpLeft,
  CheckCircle,
  Circle,
  Funnel,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  Trash,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { BentoCard } from "../common/BentoCard";
import {
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  TRANSACTION_CATEGORIES,
  type SortField,
  type SortOrder,
  type Transaction,
  type TransactionCategory,
} from "../../types";

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

interface TransactionLedgerProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  activeMonth: string;
  onOpenQuickAdd: () => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  setTransactions,
  activeMonth,
  onOpenQuickAdd,
}) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CLEARED" | "PENDING">("ALL");
  const [isMonthScoped, setIsMonthScoped] = useState(true);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const updateRow = (id: string, patch: Partial<Transaction>) => {
    setTransactions((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
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
    setStatusFilter("ALL");
  };

  // Filter Transactions
  const filtered = transactions.filter((row) => {
    if (isMonthScoped && !row.date.startsWith(activeMonth)) return false;

    const matchesSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      (row.notes && row.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      categoryFilter === "ALL" || row.category === categoryFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CLEARED" && row.cleared) ||
      (statusFilter === "PENDING" && !row.cleared);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort Transactions
  const sorted = [...filtered].sort((a, b) => {
    let result = 0;
    if (sortField === "date") {
      result = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "amount") {
      result = Math.abs(a.amount) - Math.abs(b.amount);
    } else if (sortField === "name") {
      result = a.name.localeCompare(b.name);
    } else if (sortField === "category") {
      result = a.category.localeCompare(b.category);
    }
    return sortOrder === "asc" ? result : -result;
  });

  // Totals in current view
  const viewIncome = sorted
    .filter((r) => r.amount > 0)
    .reduce((s, r) => s + r.amount, 0);
  const viewExpense = Math.abs(
    sorted.filter((r) => r.amount < 0).reduce((s, r) => s + r.amount, 0)
  );
  const viewNet = viewIncome - viewExpense;

  return (
    <BentoCard
      noPadding
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-[var(--color-ink)]">
                {t("expense.title")}
              </h2>
              <span className="rounded-full bg-[var(--color-line)] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-ink-soft)]">
                {t("expense.totalEntries", { count: sorted.length })}
              </span>
            </div>
            <p className="text-xs text-[var(--color-ink-soft)]">
              {t("expense.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Month Scope Toggle */}
            <button
              type="button"
              onClick={() => setIsMonthScoped((prev) => !prev)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isMonthScoped
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`}
            >
              {isMonthScoped ? `${activeMonth}` : t("header.allMonths")}
            </button>

            {/* Quick Log Action */}
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 dark:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 transition hover:bg-zinc-800 dark:hover:bg-emerald-400 shadow-xs"
            >
              <Plus size={14} weight="bold" className="text-emerald-400 dark:text-zinc-950" />
              <span>{t("header.quickAdd")}</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Undo Delete Banner */}
      <AnimatePresence>
        {lastDeleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-6 py-2.5 text-xs text-amber-900 dark:text-amber-200"
          >
            <span>{t("expense.deleted")}</span>
            <button
              type="button"
              onClick={undoDelete}
              className="inline-flex items-center gap-1 font-bold text-amber-950 dark:text-amber-300 underline hover:no-underline"
            >
              <ArrowUUpLeft size={14} /> {t("expense.undo")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-6 py-3">
        {/* Search */}
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 shadow-xs focus-within:border-[var(--color-accent)]">
          <MagnifyingGlass size={15} className="text-[var(--color-ink-soft)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("expense.searchPlaceholder")}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <Funnel size={14} className="text-[var(--color-ink-soft)]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)] outline-none shadow-xs transition focus:border-[var(--color-accent)]"
          >
            <option value="ALL">{t("expense.allCategories")}</option>
            {TRANSACTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`category.${c}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "CLEARED" | "PENDING")}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)] outline-none shadow-xs transition focus:border-[var(--color-accent)]"
          >
            <option value="ALL">{t("expense.allStatus")}</option>
            <option value="CLEARED">{t("expense.onlyCleared")}</option>
            <option value="PENDING">{t("expense.onlyPending")}</option>
          </select>
        </div>
      </div>

      {/* Summary Band */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-base)] px-6 py-2 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="text-[var(--color-ink-soft)]">
            In: <span className="font-bold text-emerald-700 dark:text-emerald-400">+฿{thb.format(viewIncome)}</span>
          </span>
          <span className="text-[var(--color-ink-soft)]">
            Out: <span className="font-bold text-rose-600 dark:text-rose-400">-฿{thb.format(viewExpense)}</span>
          </span>
          <span className="text-[var(--color-ink-soft)]">
            Net:{" "}
            <span className={`font-bold ${viewNet >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {viewNet >= 0 ? "+" : ""}฿{thb.format(viewNet)}
            </span>
          </span>
        </div>
        {(search || categoryFilter !== "ALL" || statusFilter !== "ALL") && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[11px] font-sans font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {t("expense.clearFilters")}
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">
              <th
                onClick={() => toggleSort("name")}
                className="cursor-pointer px-6 py-3 hover:text-[var(--color-ink)]"
              >
                <div className="flex items-center gap-1">
                  <span>{t("expense.name")}</span>
                  {sortField === "name" && (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th
                onClick={() => toggleSort("category")}
                className="cursor-pointer px-4 py-3 hover:text-[var(--color-ink)]"
              >
                <div className="flex items-center gap-1">
                  <span>{t("expense.category")}</span>
                  {sortField === "category" && (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th
                onClick={() => toggleSort("date")}
                className="cursor-pointer px-4 py-3 hover:text-[var(--color-ink)]"
              >
                <div className="flex items-center gap-1">
                  <span>{t("expense.date")}</span>
                  {sortField === "date" && (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th
                onClick={() => toggleSort("amount")}
                className="cursor-pointer px-4 py-3 text-right hover:text-[var(--color-ink)]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t("expense.amount")}</span>
                  {sortField === "amount" && (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </div>
              </th>
              <th className="px-4 py-3 text-center">{t("expense.status")}</th>
              <th className="px-6 py-3 text-right">{t("expense.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            <AnimatePresence initial={false}>
              {sorted.map((row) => {
                const isPositive = row.amount >= 0;
                const catColor = CATEGORY_COLORS[row.category] || "oklch(60% 0.1 260)";

                return (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group transition-colors hover:bg-[var(--color-surface-subtle)]"
                  >
                    {/* Name & Notes */}
                    <td className="px-6 py-3">
                      <div>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateRow(row.id, { name: e.target.value })}
                          className="w-full bg-transparent font-medium text-[var(--color-ink)] outline-none focus:rounded-md focus:bg-[var(--color-surface)] focus:px-1.5 focus:py-0.5 focus:ring-1 focus:ring-emerald-500"
                        />
                        {row.notes && (
                          <div className="text-[10px] text-[var(--color-ink-soft)]">
                            {row.notes}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isPositive ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-800 dark:text-emerald-300 text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          {t("category.Income")}
                        </span>
                      ) : (
                        <select
                          value={row.category}
                          onChange={(e) =>
                            updateRow(row.id, { category: e.target.value as TransactionCategory })
                          }
                          className="cursor-pointer rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-ink)] outline-none hover:border-[var(--color-accent)]"
                        >
                          {EXPENSE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {t(`category.${c}`)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(row.id, { date: e.target.value })}
                        className="rounded-md bg-transparent font-mono text-xs text-[var(--color-ink-soft)] outline-none focus:bg-[var(--color-surface)] focus:px-1 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <span
                          className={`font-mono text-xs font-bold ${
                            isPositive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : "-"}฿
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={Math.abs(row.amount)}
                          onChange={(e) => {
                            const val = Math.abs(parseFloat(e.target.value) || 0);
                            updateRow(row.id, { amount: isPositive ? val : -val });
                          }}
                          className={`w-24 text-right bg-transparent font-mono text-xs font-bold outline-none focus:rounded-md focus:bg-[var(--color-surface)] focus:px-1 focus:ring-1 focus:ring-emerald-500 ${
                            isPositive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        />
                      </div>
                    </td>

                    {/* Cleared Toggle */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => updateRow(row.id, { cleared: !row.cleared })}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition ${
                          row.cleared
                            ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {row.cleared ? (
                          <>
                            <ShieldCheck size={12} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                            <span>{t("expense.cleared")}</span>
                          </>
                        ) : (
                          <span>{t("expense.pending")}</span>
                        )}
                      </button>
                    </td>

                    {/* Delete Action */}
                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => deleteRow(row)}
                        className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                        aria-label={t("expense.delete")}
                      >
                        <Trash size={15} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="py-12 text-center">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">
              {t("expense.noResultsTitle")}
            </h3>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
              {t("expense.noResultsHint")}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]"
            >
              {t("expense.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </BentoCard>
  );
};
