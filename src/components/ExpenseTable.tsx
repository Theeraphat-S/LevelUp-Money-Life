import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { Dispatch, SetStateAction } from "react";
import type { Transaction, TransactionCategory } from "../types";

const categories: TransactionCategory[] = ["Income", "Food", "Transport", "Home", "Health", "Learning", "Fun", "Debt", "Savings"];

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function ExpenseTable({ transactions, setTransactions }: { transactions: Transaction[]; setTransactions: Dispatch<SetStateAction<Transaction[]>> }) {
  const { t } = useTranslation();
  const addRow = () => {
    setTransactions((rows) => [
      { id: crypto.randomUUID(), name: "New entry", amount: -100, date: new Date().toISOString().slice(0, 10), category: "Food", cleared: false },
      ...rows,
    ]);
  };
  const updateRow = (id: string, patch: Partial<Transaction>) => setTransactions((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const deleteRow = (id: string) => setTransactions((rows) => rows.filter((row) => row.id !== id));

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-diffuse)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{t("expense.title")}</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">{t("expense.subtitle")}</p>
        </div>
        <button
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition-[transform,box-shadow] duration-200 hover:shadow-[var(--shadow-tile)] active:translate-y-px active:shadow-[var(--shadow-press)] focus:outline-none focus-visible:shadow-[var(--ring-accent)]"
        >
          <Plus size={16} weight="bold" /> {t("expense.add")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
              <th className="px-6 py-3 font-semibold">{t("expense.name")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.amount")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.category")}</th>
              <th className="px-4 py-3 font-semibold">{t("expense.cleared")}</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {transactions.map((row) => {
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
                      <input value={row.name} onChange={(e) => updateRow(row.id, { name: e.target.value })} className="w-56 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-base)]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className={`font-mono text-xs font-semibold ${positive ? "text-emerald-600" : "text-red-500"}`}>฿</span>
                        <input
                          type="number"
                          value={row.amount}
                          onChange={(e) => updateRow(row.id, { amount: Number(e.target.value) })}
                          className={`w-28 rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-mono font-medium outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-base)] ${positive ? "text-emerald-700" : "text-red-600"}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input type="date" value={row.date} onChange={(e) => updateRow(row.id, { date: e.target.value })} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-base)] px-2 py-1.5 font-mono text-xs text-[var(--color-ink-soft)] outline-none transition focus:border-[var(--color-accent)]" />
                    </td>
                    <td className="px-4 py-3">
                      <select value={row.category} onChange={(e) => updateRow(row.id, { category: e.target.value as TransactionCategory })} className="cursor-pointer rounded-lg border border-[var(--color-line)] bg-[var(--color-base)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]">
                        {categories.map((c) => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={row.cleared} onChange={(e) => updateRow(row.id, { cleared: e.target.checked })} className="h-4 w-4 cursor-pointer accent-[var(--color-accent)]" aria-label={t("expense.markCleared", { name: row.name })} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => deleteRow(row.id)} className="rounded-lg p-2 text-[var(--color-ink-soft)] opacity-0 transition hover:bg-[oklch(94%_0.04_25)] hover:text-[oklch(50%_0.18_25)] focus:opacity-100 group-hover:opacity-100 focus:outline-none focus-visible:shadow-[var(--ring-accent)]" aria-label={t("expense.delete")}>
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
          <div className="px-6 py-12 text-center text-sm text-[var(--color-ink-soft)]">{t("expense.empty")}</div>
        )}
      </div>
    </section>
  );
}
