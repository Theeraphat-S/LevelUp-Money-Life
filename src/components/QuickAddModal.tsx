import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Coins,
  Receipt,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
  type Transaction,
  type TransactionCategory,
} from "../types";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  defaultDate?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultDate,
}) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<"expense" | "income">("expense");
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState(defaultDate || today);
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [cleared, setCleared] = useState(true);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setAmountStr("");
      setDate(defaultDate || today);
      setCategory(type === "income" ? "Income" : "Food");
      setCleared(true);
      setNotes("");
      setError("");
    }
  }, [isOpen, defaultDate, type, today]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(amountStr);
    if (!name.trim()) {
      setError("Please provide a description");
      return;
    }
    if (isNaN(rawAmount) || rawAmount <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }

    const finalAmount = type === "income" ? Math.abs(rawAmount) : -Math.abs(rawAmount);
    const finalCategory: TransactionCategory = type === "income" ? "Income" : category;

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: finalAmount,
      date,
      category: finalCategory,
      cleared,
      notes: notes.trim(),
    };

    onSave(newTx);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-2xl z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-6 py-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-[var(--color-ink)]">
                  {t("quickAdd.title")}
                </h2>
                <p className="text-xs text-[var(--color-ink-soft)]">
                  {t("quickAdd.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setType("expense");
                    if (category === "Income") setCategory("Food");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                    type === "expense"
                      ? "bg-rose-500/10 text-rose-700 border border-rose-500/20 shadow-xs"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <Receipt size={16} weight="duotone" />
                  {t("quickAdd.expenseType")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    setCategory("Income");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                    type === "income"
                      ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shadow-xs"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <Coins size={16} weight="duotone" />
                  {t("quickAdd.incomeType")}
                </button>
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                    {t("quickAdd.amountLabel")}
                  </label>
                  <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 focus-within:border-[var(--color-accent)] shadow-xs">
                    <span className="font-mono text-sm font-bold text-[var(--color-ink-soft)] mr-2">
                      ฿
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      autoFocus
                      required
                      placeholder="0.00"
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      className="w-full bg-transparent font-mono text-base font-bold text-[var(--color-ink)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                    {t("quickAdd.dateLabel")}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 font-mono text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] shadow-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                  {t("quickAdd.nameLabel")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("quickAdd.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] shadow-xs"
                />
              </div>

              {/* Category (If Expense) */}
              {type === "expense" && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1.5">
                    {t("quickAdd.categoryLabel")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {EXPENSE_CATEGORIES.map((cat) => {
                      const isSelected = category === cat;
                      const catColor = CATEGORY_COLORS[cat];
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold shadow-xs"
                              : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-subtle)]"
                          }`}
                        >
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                          />
                          <span className="truncate">{t(`category.${cat}`)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                  {t("quickAdd.notesLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("quickAdd.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {/* Cleared Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="clearedCheckbox"
                  checked={cleared}
                  onChange={(e) => setCleared(e.target.checked)}
                  className="h-4 w-4 rounded-md accent-emerald-600 cursor-pointer"
                />
                <label
                  htmlFor="clearedCheckbox"
                  className="text-xs text-[var(--color-ink)] font-medium cursor-pointer"
                >
                  {t("quickAdd.clearedLabel")}
                </label>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--color-line)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-ink)] transition"
                >
                  {t("quickAdd.cancel")}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 active:scale-[0.98]"
                >
                  <Sparkle size={15} weight="fill" className="text-emerald-400" />
                  <span>{t("quickAdd.submit", { xp: 15 })}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
