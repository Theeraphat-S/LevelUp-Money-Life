import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowsClockwise,
  Check,
  Command,
  GearSix,
  Info,
  Lightning,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkle,
  TrendUp,
  X,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import {
  CATEGORY_COLORS,
  type Allocation,
  type AutocompleteItem,
  type DailySafeToSpend,
  type ParsedQuickTransaction,
  type PresetItem,
  type Transaction,
} from "../types";
import { parseQuickInput } from "../utils/quickParser";
import { calculateDailySafeToSpend, getLocalTodayISO } from "../utils/safeToSpend";
import {
  getSmartSuggestedPresets,
  getAutocompleteSuggestions,
  incrementPresetUsage,
} from "../utils/presetManager";
import { PresetManagerModal } from "./PresetManagerModal";

const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

interface QuickCommandBarProps {
  transactions: Transaction[];
  allocations: Allocation[];
  income: number;
  activeMonth: string;
  presets: PresetItem[];
  setPresets: (presets: PresetItem[]) => void;
  onLogTransaction: (tx: Transaction) => void;
}

export const QuickCommandBar: React.FC<QuickCommandBarProps> = ({
  transactions,
  allocations,
  income,
  activeMonth,
  presets,
  setPresets,
  onLogTransaction,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [inputVal, setInputVal] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSafeInfoExpanded, setIsSafeInfoExpanded] = useState(false);

  const todayStr = useMemo(() => getLocalTodayISO(), []);

  // 1. Realtime Safe-to-Spend calculation
  const safeStats: DailySafeToSpend = useMemo(() => {
    return calculateDailySafeToSpend(
      transactions,
      allocations,
      income,
      activeMonth,
      todayStr
    );
  }, [transactions, allocations, income, activeMonth, todayStr]);

  // 2. Realtime Parsed Natural Language State
  const parsedTx: ParsedQuickTransaction = useMemo(() => {
    return parseQuickInput(inputVal);
  }, [inputVal]);

  // 3. Smart Top Presets for Quick Bar Chips
  const smartPresets = useMemo(() => {
    return getSmartSuggestedPresets(transactions, presets, 8);
  }, [transactions, presets]);

  // 4. Autocomplete Suggestions
  const autocompleteList: AutocompleteItem[] = useMemo(() => {
    if (!isFocused && !inputVal.trim()) return [];
    return getAutocompleteSuggestions(inputVal, transactions, presets, 5);
  }, [inputVal, isFocused, transactions, presets]);

  // Global Keyboard listener for '/' and 'N' shortcut to focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is composing with IME (e.g. Thai, Japanese, Chinese)
      if (e.isComposing) return;

      // Ignore if modifier keys are pressed (e.g. Ctrl+N, Cmd+N, Alt+N, Ctrl+/)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Ignore if a modal or popup is currently active in the DOM
      const hasOpenModal = document.querySelector('[role="dialog"], .fixed.inset-0');
      if (hasOpenModal) return;

      // Avoid stealing focus if user is typing in an existing input/textarea/select
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.tagName === "SELECT" ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (!isInputActive) {
        if (e.key === "/" || e.key === "n" || e.key === "N") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Click outside listener to blur and close autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when autocomplete list changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [autocompleteList]);

  // Handle Preset Click (1-Tap Fast Log)
  const handleTapPreset = (preset: PresetItem) => {
    const isIncome = preset.type === "income" || preset.category === "Income";
    const finalAmount = isIncome ? Math.abs(preset.amount) : -Math.abs(preset.amount);

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      name: preset.name,
      amount: finalAmount,
      date: todayStr,
      category: preset.category,
      cleared: true,
    };

    // Increment usage frequency
    const updatedPresets = incrementPresetUsage(preset.id, presets);
    setPresets(updatedPresets);

    onLogTransaction(newTx);
  };

  // Handle Submitting Text Input
  const handleCommitInput = () => {
    if (!parsedTx.isValid) return;

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      name: parsedTx.name,
      amount: parsedTx.amount,
      date: todayStr,
      category: parsedTx.category,
      cleared: true,
      notes: parsedTx.notes,
    };

    onLogTransaction(newTx);
    setInputVal("");
    setIsFocused(false);
    inputRef.current?.blur();
  };

  // Handle Keyboard Navigation in Autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        setHighlightedIndex(-1);
      } else if (inputVal) {
        setInputVal("");
      } else {
        setIsFocused(false);
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "Home" && highlightedIndex >= 0) {
      if (autocompleteList.length > 0) {
        e.preventDefault();
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === "End" && highlightedIndex >= 0) {
      if (autocompleteList.length > 0) {
        e.preventDefault();
        setHighlightedIndex(autocompleteList.length - 1);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      if (autocompleteList.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < autocompleteList.length - 1 ? prev + 1 : 0));
      }
      return;
    }

    if (e.key === "ArrowUp") {
      if (autocompleteList.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : autocompleteList.length - 1));
      }
      return;
    }

    if (e.key === "Tab" && highlightedIndex >= 0 && highlightedIndex < autocompleteList.length) {
      e.preventDefault();
      const item = autocompleteList[highlightedIndex];
      const newTx: Transaction = {
        id: crypto.randomUUID(),
        name: item.name,
        amount: item.amount,
        date: todayStr,
        category: item.category,
        cleared: true,
      };
      onLogTransaction(newTx);
      setInputVal("");
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < autocompleteList.length) {
        const item = autocompleteList[highlightedIndex];
        const newTx: Transaction = {
          id: crypto.randomUUID(),
          name: item.name,
          amount: item.amount,
          date: todayStr,
          category: item.category,
          cleared: true,
        };
        onLogTransaction(newTx);
        setInputVal("");
        setIsFocused(false);
        inputRef.current?.blur();
      } else if (parsedTx.isValid) {
        handleCommitInput();
      }
    }
  };

  const handleSelectAutocomplete = (item: AutocompleteItem) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      name: item.name,
      amount: item.amount,
      date: todayStr,
      category: item.category,
      cleared: true,
    };
    onLogTransaction(newTx);
    setInputVal("");
    setIsFocused(false);
  };

  // Safe to spend status tone
  const statusColorClass =
    safeStats.status === "comfortable"
      ? "text-[var(--jade-ink)] bg-[var(--jade-soft)] border-[var(--jade)]/30"
      : safeStats.status === "caution"
      ? "text-[var(--amber-ink)] bg-[var(--amber-soft)] border-[var(--amber)]/30"
      : "text-[var(--rose-ink)] bg-[var(--rose-soft)] border-[var(--rose)]/30";

  const statusDotClass =
    safeStats.status === "comfortable"
      ? "bg-[var(--jade)]"
      : safeStats.status === "caution"
      ? "bg-[var(--amber)]"
      : "bg-[var(--rose)]";

  return (
    <div
      ref={containerRef}
      className="relative mb-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-5 shadow-[var(--shadow-tile)] transition-all duration-300"
    >
      {/* 1px Inner Glass Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/10" />

      {/* Top Header Row: Title & Safe-to-Spend Realtime Metric */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-ink)] border border-[var(--primary)]/20 shadow-xs">
            <Lightning size={16} weight="fill" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center gap-1.5">
              <span>{t("quickBar.presets")}</span>
              <span className="font-mono text-[10px] font-normal text-[var(--color-ink-soft)] lowercase">
                · 1-tap logging
              </span>
            </h2>
          </div>
        </div>

        {/* Realtime Safe-to-Spend Badge & Expandable Detail */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSafeInfoExpanded((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition shadow-xs cursor-pointer ${statusColorClass}`}
            title="Click to toggle safe-to-spend breakdown"
            aria-expanded={isSafeInfoExpanded}
          >
            <span className={`h-2 w-2 rounded-full animate-pulse ${statusDotClass}`} />
            <span>
              {t("safeToSpend.badge", { amount: thb.format(safeStats.dailySafeToSpend) })}
            </span>
            <span className="text-[11px] font-normal opacity-90 hidden sm:inline">
              · {t("safeToSpend.todayLeft", { amount: thb.format(safeStats.todayRemaining) })}
            </span>
            <Info size={13} weight="bold" className="opacity-80" />
          </button>
        </div>
      </div>

      {/* Expandable Safe-to-Spend Details */}
      <AnimatePresence>
        {isSafeInfoExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-3.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-3 text-xs"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-[10px] font-semibold text-[var(--color-ink-soft)] uppercase">
                  {t("safeToSpend.monthBudget", { amount: "" }).replace(":", "")}
                </div>
                <div className="font-mono font-bold text-[var(--color-ink)]">
                  ฿{thb.format(safeStats.monthSpendableBudget)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[var(--color-ink-soft)] uppercase">
                  {t("safeToSpend.monthSpent", { amount: "" }).replace(":", "")}
                </div>
                <div className="font-mono font-bold text-[var(--rose-ink)]">
                  ฿{thb.format(safeStats.monthSpent)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[var(--color-ink-soft)] uppercase">
                  {t("safeToSpend.monthLeft", { amount: "" }).replace(":", "")}
                </div>
                <div className="font-mono font-bold text-[var(--jade-ink)]">
                  ฿{thb.format(safeStats.monthRemaining)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[var(--color-ink-soft)] uppercase">
                  {t("safeToSpend.daysLeft", { days: safeStats.daysRemainingInMonth })}
                </div>
                <div className="font-mono font-semibold text-[var(--color-ink-soft)]">
                  {safeStats.daysRemainingInMonth} / {safeStats.totalDaysInMonth} days
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Single-Line Natural Language Command Bar */}
      <div className="relative">
        <div
          className={`flex items-center rounded-2xl border bg-[var(--color-surface)] px-3.5 py-2.5 transition-all duration-200 shadow-xs ${
            isFocused
              ? "border-[var(--primary)] ring-3 ring-[var(--primary)]/15"
              : "border-[var(--color-line)] hover:border-[var(--color-line-subtle)]"
          }`}
        >
          <div className="flex items-center gap-2 mr-2 text-[var(--color-ink-soft)]">
            <Command size={18} weight="duotone" className="text-[var(--primary)] shrink-0" />
          </div>

          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isFocused && autocompleteList.length > 0}
            aria-controls="quick-bar-autocomplete-list"
            aria-activedescendant={
              highlightedIndex >= 0 && autocompleteList[highlightedIndex]
                ? `quick-option-${autocompleteList[highlightedIndex].id}`
                : undefined
            }
            value={inputVal}
            onChange={(e) => {
              // Sanitize pasted newlines/tabs to keep command input single-line
              const cleanVal = e.target.value.replace(/[\r\n\t]+/g, " ");
              setInputVal(cleanVal);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={t("quickBar.placeholder")}
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-soft)]/60"
          />

          {/* Right Action Icons in Input */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {inputVal ? (
              <button
                type="button"
                onClick={() => setInputVal("")}
                aria-label="Clear input"
                className="rounded-lg p-1 text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-ink)] transition"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-[var(--color-surface-subtle)] border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-ink-soft)] select-none">
                / or N
              </span>
            )}

            {/* Commit Enter Button if parsed transaction is valid */}
            {parsedTx.isValid && (
              <button
                type="button"
                onClick={handleCommitInput}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1C5954] text-[#FEFFFC] dark:bg-[#76AA9D] dark:text-[#071B1A] px-3 py-1.5 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <Sparkle size={13} weight="fill" />
                <span>{t("quickBar.enterToLog")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Parsing Preview Pill (Shown while typing when input is valid) */}
        {inputVal.trim() && parsedTx.isValid && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex flex-wrap items-center gap-2 text-xs"
          >
            <span className="text-[11px] font-semibold text-[var(--color-ink-soft)]">
              Preview:
            </span>
            <span className="font-bold text-[var(--color-ink)] bg-[var(--color-surface-subtle)] border border-[var(--color-line)] px-2.5 py-0.5 rounded-lg">
              {parsedTx.name}
            </span>
            <span
              className={`font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                parsedTx.type === "income"
                  ? "bg-[var(--jade-soft)] text-[var(--jade-ink)] border-[var(--jade)]/30"
                  : "bg-[var(--rose-soft)] text-[var(--rose-ink)] border-[var(--rose)]/30"
              }`}
            >
              {parsedTx.type === "income" ? "+" : "-"}฿{thb.format(Math.abs(parsedTx.amount))}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 font-medium border border-[var(--color-line)] bg-[var(--color-surface)] text-[11px]"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[parsedTx.category] }}
              />
              {t(`category.${parsedTx.category}`)}
            </span>
            {parsedTx.notes && (
              <span className="text-[10px] text-[var(--color-ink-soft)] italic">
                Note: {parsedTx.notes}
              </span>
            )}
          </motion.div>
        )}

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {isFocused && autocompleteList.length > 0 && (
            <motion.div
              id="quick-bar-autocomplete-list"
              role="listbox"
              aria-label="Transaction autocomplete suggestions"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-xl backdrop-blur-md"
            >
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)] flex items-center justify-between">
                <span>{t("quickBar.autocompleteHint")}</span>
                <span>{autocompleteList.length} matches</span>
              </div>

              <div className="space-y-1">
                {autocompleteList.map((item, index) => {
                  const isHighlighted = highlightedIndex === index;
                  const isPositive = item.amount >= 0;
                  const catColor = CATEGORY_COLORS[item.category] || "var(--primary)";

                  return (
                    <div
                      key={item.id}
                      id={`quick-option-${item.id}`}
                      role="option"
                      aria-selected={isHighlighted}
                      onClick={() => handleSelectAutocomplete(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                        isHighlighted
                          ? "bg-[var(--primary-soft)] text-[var(--primary-ink)] font-semibold"
                          : "hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{item.icon || "📝"}</span>
                        <span className="font-semibold truncate">{item.name}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-ink-soft)] font-normal border border-[var(--color-line)] rounded px-1.5 py-0.2 bg-[var(--color-surface)]">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                          {t(`category.${item.category}`)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span
                          className={`font-mono font-bold ${
                            isPositive ? "text-[var(--jade-ink)]" : "text-[var(--rose-ink)]"
                          }`}
                        >
                          {isPositive ? "+" : "-"}฿{thb.format(Math.abs(item.amount))}
                        </span>
                        {isHighlighted && (
                          <span className="rounded bg-[var(--color-surface)] border border-[var(--color-line)] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[var(--primary-ink)]">
                            ↵ Enter / Tab
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* One-Tap Preset Buttons Chips Bar (R1) */}
      <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {smartPresets.map((preset) => (
          <motion.button
            key={preset.id}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleTapPreset(preset)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] hover:border-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] shadow-xs transition-all cursor-pointer group"
          >
            <span className="text-sm group-hover:scale-110 transition-transform">
              {preset.icon}
            </span>
            <span className="truncate">{preset.name}</span>
            <span className="font-mono text-[11px] font-bold text-[var(--color-ink-soft)] group-hover:text-[var(--primary-ink)]">
              ฿{preset.amount}
            </span>
          </motion.button>
        ))}

        {/* Manage Presets Trigger Button */}
        <button
          type="button"
          onClick={() => setIsPresetModalOpen(true)}
          title={t("quickBar.managePresets")}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-ink)] transition shadow-xs cursor-pointer"
        >
          <GearSix size={14} weight="bold" />
          <span className="hidden sm:inline">{t("quickBar.managePresets")}</span>
        </button>
      </div>

      {/* Presets CRUD Manager Modal */}
      <PresetManagerModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        presets={presets}
        setPresets={setPresets}
      />
    </div>
  );
};
