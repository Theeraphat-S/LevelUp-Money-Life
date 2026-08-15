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
import { CustomDatePicker } from "./common/CustomDatePicker";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  onOpenScanSlip?: () => void;
  defaultDate?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onOpenScanSlip,
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
            {/* 1px Inner Liquid Glass Highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/10" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-6 py-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {t("quickAdd.title")}
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
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
              {/* Slip Scan Shortcut Trigger */}
              {onOpenScanSlip && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenScanSlip();
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-dashed border-[var(--primary)]/40 bg-[var(--primary-soft)] hover:opacity-95 px-3.5 py-2 text-xs text-[var(--primary-ink)] transition group cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <Receipt size={16} weight="duotone" className="text-[var(--primary)] group-hover:scale-110 transition" />
                    <span>{t("quickAdd.scanSlipTab")}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--jade-ink)]">
                    <Sparkle size={12} weight="fill" className="text-[var(--jade)]" />
                    <span>Auto-fill from image</span>
                  </span>
                </button>
              )}

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setType("expense");
                    if (category === "Income") setCategory("Food");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition group ${
                    type === "expense"
                      ? "bg-[var(--rose-soft)] text-[var(--rose-ink)] border border-[var(--rose)]/30 shadow-xs"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <Receipt
                    size={16}
                    weight="duotone"
                    className="text-[var(--rose)] transition group-hover:scale-110"
                  />
                  <span>{t("quickAdd.expenseType")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    setCategory("Income");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition group ${
                    type === "income"
                      ? "bg-[var(--jade-soft)] text-[var(--jade-ink)] border border-[var(--jade)]/30 shadow-xs"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <Coins
                    size={16}
                    weight="duotone"
                    className="text-[var(--jade)] transition group-hover:scale-110"
                  />
                  <span>{t("quickAdd.incomeType")}</span>
                </button>
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                    {t("quickAdd.amountLabel")}
                  </label>
                  <div
                    className={`flex items-center rounded-xl border bg-[var(--color-surface)] px-3.5 py-2 transition shadow-xs ${
                      type === "expense"
                        ? "border-[var(--color-line)] focus-within:border-[var(--rose)] focus-within:ring-2 focus-within:ring-[var(--rose)]/20"
                        : "border-[var(--color-line)] focus-within:border-[var(--jade)] focus-within:ring-2 focus-within:ring-[var(--jade)]/20"
                    }`}
                  >
                    <span
                      className={`font-mono text-base font-bold mr-2 select-none transition-colors ${
                        type === "expense"
                          ? "text-[var(--amount-icon-rose)]"
                          : "text-[var(--amount-icon-jade)]"
                      }`}
                    >
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
                      className={`w-full bg-transparent font-mono text-xl font-bold outline-none transition-colors ${
                        type === "expense"
                          ? "text-[var(--rose-ink)] placeholder:text-[var(--rose-ink)]/35"
                          : "text-[var(--jade-ink)] placeholder:text-[var(--jade-ink)]/35"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                    {t("quickAdd.dateLabel")}
                  </label>
                  <CustomDatePicker
                    value={date}
                    onChange={setDate}
                    ariaLabel={t("quickAdd.dateLabel")}
                    className="w-full"
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
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--primary)] shadow-xs"
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
                              ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-ink)] font-semibold shadow-xs"
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
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Cleared Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="clearedCheckbox"
                  checked={cleared}
                  onChange={(e) => setCleared(e.target.checked)}
                  className="h-4 w-4 rounded cursor-pointer accent-[var(--primary)] transition-transform hover:scale-105"
                />
                <label
                  htmlFor="clearedCheckbox"
                  className="text-xs text-[var(--color-ink)] font-medium cursor-pointer select-none hover:text-[var(--primary)] transition-colors"
                >
                  {t("quickAdd.clearedLabel")}
                </label>
              </div>

              {error && (
                <div className="rounded-xl border border-[var(--rose)]/30 bg-[var(--rose-soft)] px-3 py-2 text-xs font-medium text-[var(--rose-ink)]">
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1C5954] text-[#FEFFFC] dark:bg-[#76AA9D] dark:text-[#071B1A] px-4 py-2 text-xs font-semibold shadow-xs transition hover:opacity-90 active:scale-[0.98]"
                >
                  <Sparkle size={15} weight="fill" />
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
