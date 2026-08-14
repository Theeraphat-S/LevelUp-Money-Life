import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowCounterClockwise,
  ArrowRight,
  Buildings,
  Check,
  CheckCircle,
  Coins,
  CurrencyCircleDollar,
  GearSix,
  Lightning,
  Plus,
  Receipt,
  Sparkle,
  Trash,
  UploadSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
  type Transaction,
  type TransactionCategory,
} from "../types";
import { parseSlipImage, type ParsedSlipResult } from "../services/slipScanner";
import { getSetting, saveSetting } from "../services/db";

export interface SlipQueueItem {
  id: string;
  source: File | string;
  previewUrl: string;
  status: "pending" | "analyzing" | "ready" | "saved" | "error";
  step: string;
  progress: number;
  result?: ParsedSlipResult;
  error?: string;
  // Form fields
  type: "expense" | "income";
  name: string;
  amountStr: string;
  date: string;
  category: TransactionCategory;
  cleared: boolean;
  notes: string;
}

interface SlipScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction, xpBonus: number) => void;
  onSaveBatch?: (txs: Transaction[], totalXpBonus: number) => void;
  initialFiles?: (File | string)[] | null;
}

export const SlipScanModal: React.FC<SlipScanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveBatch,
  initialFiles,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  // States
  const [queue, setQueue] = useState<SlipQueueItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // AI Configuration
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>("");
  const [apiKeySavedNotice, setApiKeySavedNotice] = useState<boolean>(false);

  // Load saved Gemini API Key on mount
  useEffect(() => {
    async function loadKey() {
      const savedKey = await getSetting<string>("gemini_api_key", "");
      if (savedKey) {
        setGeminiApiKey(savedKey);
        setTempApiKey(savedKey);
      }
    }
    loadKey();
  }, []);

  // Process a single queue item
  const processQueueItem = useCallback(
    async (item: SlipQueueItem) => {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "analyzing", step: t("slipScanner.analyzing"), progress: 10 } : q
        )
      );

      try {
        const result = await parseSlipImage(item.source, geminiApiKey, (stepText, progressPct) => {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, step: stepText, progress: progressPct } : q
            )
          );
        });

        setQueue((prev) =>
          prev.map((q) => {
            if (q.id === item.id) {
              return {
                ...q,
                status: "ready",
                result,
                type: result.transactionType,
                name: result.description,
                amountStr: result.amount > 0 ? result.amount.toFixed(2) : "",
                date: result.date,
                category: result.suggestedCategory,
                notes: result.notes || "",
                cleared: true,
              };
            }
            return q;
          })
        );
      } catch (err: unknown) {
        console.error("Slip parsing error:", err);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: "error",
                  error: err instanceof Error ? err.message : "Failed to analyze slip",
                }
              : q
          )
        );
      }
    },
    [geminiApiKey, t]
  );

  // Add multiple files to queue and begin processing
  const enqueueFiles = useCallback(
    (files: (File | string)[]) => {
      if (!files || files.length === 0) return;
      const today = new Date().toISOString().slice(0, 10);

      const newItems: SlipQueueItem[] = files.map((src) => {
        let preview = "";
        if (src instanceof File) {
          preview = URL.createObjectURL(src);
        } else {
          preview = src;
        }

        return {
          id: crypto.randomUUID(),
          source: src,
          previewUrl: preview,
          status: "pending",
          step: t("slipScanner.analyzing"),
          progress: 0,
          type: "expense",
          name: "",
          amountStr: "",
          date: today,
          category: "Food",
          cleared: true,
          notes: "",
        };
      });

      setQueue((prev) => {
        const next = [...prev, ...newItems];
        return next;
      });

      // Start processing each added item
      newItems.forEach((item) => {
        processQueueItem(item);
      });
    },
    [processQueueItem, t]
  );

  // Handle Initial Files passed as prop
  useEffect(() => {
    if (isOpen && initialFiles && initialFiles.length > 0) {
      setQueue([]);
      setActiveIndex(0);
      enqueueFiles(initialFiles);
    }
  }, [isOpen, initialFiles, enqueueFiles]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQueue([]);
      setActiveIndex(0);
      setFormError("");
      setIsSettingsOpen(false);
    }
  }, [isOpen]);

  // Handle Escape Key & Clipboard Paste inside Modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      if (pastedFiles.length > 0) {
        e.preventDefault();
        enqueueFiles(pastedFiles);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, onClose, enqueueFiles]);

  // Handle Dropzone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const f = e.dataTransfer.files[i];
        if (f.type.startsWith("image/")) {
          imageFiles.push(f);
        }
      }
      if (imageFiles.length > 0) {
        enqueueFiles(imageFiles);
      }
    }
  };

  // Handle File Input Change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      enqueueFiles(filesArr);
    }
  };

  // Save API Key
  const handleSaveApiKey = async () => {
    const trimmed = tempApiKey.trim();
    setGeminiApiKey(trimmed);
    await saveSetting("gemini_api_key", trimmed);
    setApiKeySavedNotice(true);
    setTimeout(() => {
      setApiKeySavedNotice(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  // Clear API Key
  const handleClearApiKey = async () => {
    setGeminiApiKey("");
    setTempApiKey("");
    await saveSetting("gemini_api_key", "");
    setApiKeySavedNotice(true);
    setTimeout(() => {
      setApiKeySavedNotice(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  // Current active queue item
  const currentItem = queue[activeIndex] || null;

  // Update active item form state
  const updateCurrentItem = (updates: Partial<SlipQueueItem>) => {
    if (!currentItem) return;
    setQueue((prev) =>
      prev.map((q, idx) => (idx === activeIndex ? { ...q, ...updates } : q))
    );
  };

  // Remove slip from queue
  const removeQueueItem = (indexToRemove: number) => {
    setQueue((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      if (filtered.length === 0) {
        setActiveIndex(0);
      } else if (activeIndex >= filtered.length) {
        setActiveIndex(filtered.length - 1);
      }
      return filtered;
    });
  };

  // Helper to convert queue item to Transaction
  const itemToTransaction = (item: SlipQueueItem): Transaction | null => {
    const rawAmount = parseFloat(item.amountStr);
    if (isNaN(rawAmount) || rawAmount <= 0) return null;
    const finalAmount = item.type === "income" ? Math.abs(rawAmount) : -Math.abs(rawAmount);
    const finalCategory: TransactionCategory = item.type === "income" ? "Income" : item.category;

    return {
      id: crypto.randomUUID(),
      name: (item.name || (item.type === "income" ? "Income Transfer" : "Bank Payment")).trim(),
      amount: finalAmount,
      date: item.date || new Date().toISOString().slice(0, 10),
      category: finalCategory,
      cleared: item.cleared,
      notes: item.notes.trim(),
    };
  };

  // Handle Save Current Slip & Next
  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    setFormError("");

    const tx = itemToTransaction(currentItem);
    if (!tx) {
      setFormError("Please enter a valid amount and description");
      return;
    }

    onSave(tx, 25);

    // Mark current item as saved
    setQueue((prev) =>
      prev.map((q, idx) => (idx === activeIndex ? { ...q, status: "saved" } : q))
    );

    // If more unsaved items exist, navigate to next unsaved
    const remainingUnsaved = queue.findIndex(
      (q, idx) => idx !== activeIndex && q.status !== "saved"
    );

    if (remainingUnsaved !== -1) {
      setActiveIndex(remainingUnsaved);
    } else {
      // All items saved!
      onClose();
    }
  };

  // Handle Save All Batch
  const handleSaveAllBatch = () => {
    setFormError("");
    const validTxs: Transaction[] = [];

    queue.forEach((item) => {
      if (item.status !== "saved") {
        const tx = itemToTransaction(item);
        if (tx) validTxs.push(tx);
      }
    });

    if (validTxs.length === 0) {
      setFormError("No valid slip items to save");
      return;
    }

    const totalXp = validTxs.length * 25;

    if (onSaveBatch) {
      onSaveBatch(validTxs, totalXp);
    } else {
      validTxs.forEach((tx) => onSave(tx, 25));
    }

    onClose();
  };

  const totalSlips = queue.length;
  const unsavedCount = queue.filter((q) => q.status !== "saved").length;
  const readyCount = queue.filter((q) => q.status === "ready" || q.status === "saved").length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-2xl z-10 flex flex-col my-auto"
          >
            {/* 1px Liquid Glass Highlight at top edge */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/10 z-20" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-5 sm:px-6 py-3.5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-xs">
                  <Receipt size={20} weight="duotone" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--color-ink)]">
                      {totalSlips > 1
                        ? t("slipScanner.batchQueueTitle", { count: totalSlips })
                        : t("slipScanner.title")}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      <Sparkle size={11} weight="fill" className="text-emerald-500" />
                      +{totalSlips > 1 ? unsavedCount * 25 : 25} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-ink-soft)] truncate max-w-[260px] sm:max-w-md">
                    {totalSlips > 1
                      ? t("slipScanner.batchCombo", { xp: unsavedCount * 25 })
                      : t("slipScanner.subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  title={t("slipScanner.engineSettings")}
                  className={`rounded-lg p-2 text-xs transition ${
                    isSettingsOpen
                      ? "bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-line)]"
                      : "text-[var(--color-ink-soft)] hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <GearSix
                    size={18}
                    weight={geminiApiKey ? "fill" : "regular"}
                    className={geminiApiKey ? "text-emerald-500" : ""}
                  />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* AI Settings Accordion Drawer */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)]/70 px-5 sm:px-6 py-4"
                >
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lightning size={16} weight="fill" className="text-amber-500" />
                        <span className="text-xs font-bold text-[var(--color-ink)]">
                          {t("slipScanner.geminiKeyLabel")}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-ink-soft)]">
                        {geminiApiKey ? `Active: ${geminiApiKey.slice(0, 6)}...` : t("slipScanner.useLocalOnly")}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-ink-soft)] leading-relaxed">
                      {t("slipScanner.geminiKeyHint")}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder={t("slipScanner.geminiKeyPlaceholder")}
                        className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 font-mono text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        className="rounded-xl bg-zinc-950 dark:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 transition hover:opacity-90 active:scale-[0.98]"
                      >
                        {t("slipScanner.saveKey")}
                      </button>
                      {geminiApiKey && (
                        <button
                          type="button"
                          onClick={handleClearApiKey}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                        >
                          {t("slipScanner.removeKey")}
                        </button>
                      )}
                    </div>
                    {apiKeySavedNotice && (
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ {t("slipScanner.keySaved")}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Multi-Slip Thumbnail Queue Strip (When 1 or more slips exist) */}
            {totalSlips > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)]/40 px-5 sm:px-6 py-2.5 shrink-0 no-scrollbar">
                <span className="text-[11px] font-bold text-[var(--color-ink-soft)] shrink-0 mr-1">
                  {t("slipScanner.queueTitle")}:
                </span>

                {queue.map((item, idx) => {
                  const isCurrent = idx === activeIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`group relative flex items-center gap-2 rounded-xl border p-1.5 transition-all cursor-pointer shrink-0 ${
                        isCurrent
                          ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                          : "border-[var(--color-line)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)]"
                      }`}
                    >
                      {/* Mini Thumbnail */}
                      <div className="h-9 w-7 rounded-md overflow-hidden bg-black/10 shrink-0 flex items-center justify-center">
                        <img
                          src={item.previewUrl}
                          alt="Thumbnail"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Info & Status Badge */}
                      <div className="text-left pr-1 min-w-[75px] max-w-[130px]">
                        <p className="text-[11px] font-bold text-[var(--color-ink)] truncate">
                          {item.amountStr ? `฿${item.amountStr}` : `Slip #${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-1">
                          {item.status === "analyzing" && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono animate-pulse">
                              {item.progress}%
                            </span>
                          )}
                          {item.status === "ready" && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                              <Check size={10} weight="bold" /> {item.result?.bankName ? "Ready" : "Ready"}
                            </span>
                          )}
                          {item.status === "saved" && (
                            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                              <CheckCircle size={11} weight="fill" /> Saved
                            </span>
                          )}
                          {item.status === "error" && (
                            <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                              <WarningCircle size={11} weight="bold" /> Review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQueueItem(idx);
                        }}
                        title={t("slipScanner.removeSlip")}
                        className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-[var(--color-ink-soft)] hover:bg-rose-500/10 hover:text-rose-500 transition"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  );
                })}

                {/* Add More Slips Button in Strip */}
                <input
                  ref={addMoreInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => addMoreInputRef.current?.click()}
                  className="flex items-center gap-1 rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-ink-soft)] hover:border-emerald-500 hover:text-emerald-600 transition shrink-0"
                >
                  <Plus size={14} weight="bold" />
                  <span>{t("slipScanner.addMore")}</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {totalSlips === 0 ? (
                /* Mode 1: Empty Upload Dropzone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-500/5 scale-[1.01]"
                      : "border-[var(--color-line)] bg-[var(--color-surface-subtle)]/40 hover:border-[var(--color-ink-soft)] hover:bg-[var(--color-surface-subtle)]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] group-hover:text-emerald-500 group-hover:scale-105 transition-all shadow-sm">
                    <UploadSimple size={32} weight="duotone" />
                  </div>

                  <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">
                    {t("slipScanner.dropzoneTitle")}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-soft)] max-w-sm mb-4">
                    {t("slipScanner.dropzoneHint")}
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 dark:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-950 shadow-xs transition hover:opacity-90 active:scale-[0.98]">
                    <UploadSimple size={15} weight="bold" />
                    <span>Browse Slip Images (Single or Multi-select)</span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[var(--color-ink-soft)]">
                    <span className="flex items-center gap-1">
                      <Check size={12} weight="bold" className="text-emerald-500" />
                      All Thai Banks (Krungthai, KBank, SCB, BBL, etc.)
                    </span>
                    <span className="flex items-center gap-1">
                      <Check size={12} weight="bold" className="text-emerald-500" />
                      Batch Upload Multiple Slips
                    </span>
                  </div>

                  <p className="mt-4 text-[10px] font-mono text-[var(--color-ink-soft)] opacity-75">
                    {t("slipScanner.pasteHint")}
                  </p>
                </div>
              ) : currentItem ? (
                /* Mode 2: Split Review & Confirmation View */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column (5 Cols): Image & Scan Status Card */}
                  <div className="lg:col-span-5 space-y-3.5">
                    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-2 shadow-xs group">
                      <div className="relative aspect-3/4 max-h-[380px] w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/20 flex items-center justify-center">
                        <img
                          src={currentItem.previewUrl}
                          alt="Slip Preview"
                          className="h-full w-full object-contain"
                        />

                        {/* Scanning Overlay State */}
                        <AnimatePresence>
                          {currentItem.status === "analyzing" && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs p-6 text-center text-white"
                            >
                              <div className="relative mb-3 flex h-12 w-12 items-center justify-center">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                  className="absolute inset-0 rounded-full border-2 border-emerald-400/30 border-t-emerald-400"
                                />
                                <Sparkle size={20} weight="fill" className="text-emerald-400 animate-pulse" />
                              </div>

                              <p className="text-xs font-bold tracking-tight text-white mb-1">
                                {t("slipScanner.analyzing")}
                              </p>
                              <p className="text-[11px] text-zinc-300 mb-3 font-mono">
                                {currentItem.step || "Extracting details..."}
                              </p>

                              {/* Progress bar */}
                              <div className="w-full max-w-[180px] h-1.5 rounded-full bg-white/20 overflow-hidden">
                                <motion.div
                                  className="h-full bg-emerald-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${currentItem.progress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Change image or remove */}
                      <div className="mt-2 flex items-center justify-between text-xs px-1">
                        <span className="font-mono text-[11px] text-[var(--color-ink-soft)]">
                          {t("slipScanner.slipIndex", { current: activeIndex + 1, total: totalSlips })}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeQueueItem(activeIndex)}
                          className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                        >
                          <Trash size={13} />
                          <span>{t("slipScanner.removeSlip")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Detected Slip Badges Card */}
                    {currentItem.result && currentItem.status !== "analyzing" && (
                      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)]/50 p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-1.5">
                          <span className="font-semibold text-[var(--color-ink-soft)]">
                            {t("slipScanner.detectedBank")}
                          </span>
                          <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                            <Buildings size={14} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                            {currentItem.result.bankName}
                          </span>
                        </div>

                        {currentItem.result.receiver && (
                          <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-1.5">
                            <span className="font-semibold text-[var(--color-ink-soft)]">
                              {t("slipScanner.detectedReceiver")}
                            </span>
                            <span className="font-semibold text-[var(--color-ink)] truncate max-w-[170px]">
                              {currentItem.result.receiver}
                            </span>
                          </div>
                        )}

                        {currentItem.result.refNumber && (
                          <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-1.5">
                            <span className="font-semibold text-[var(--color-ink-soft)]">
                              {t("slipScanner.detectedRef")}
                            </span>
                            <span className="font-mono text-[11px] text-[var(--color-ink-soft)]">
                              {currentItem.result.refNumber}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="font-semibold text-[var(--color-ink-soft)]">Engine</span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle size={12} weight="fill" />
                            {currentItem.result.engine === "gemini"
                              ? t("slipScanner.engineGemini")
                              : t("slipScanner.engineLocal")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column (7 Cols): Editable Transaction Form */}
                  <div className="lg:col-span-7">
                    <form onSubmit={handleSaveCurrent} className="space-y-3.5">
                      {/* Income vs Expense Toggle */}
                      <div>
                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-1">
                          <button
                            type="button"
                            onClick={() => {
                              updateCurrentItem({
                                type: "expense",
                                category: currentItem.category === "Income" ? "Food" : currentItem.category,
                              });
                            }}
                            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                              currentItem.type === "expense"
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 shadow-xs"
                                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                            }`}
                          >
                            <Receipt size={16} weight="duotone" />
                            {t("quickAdd.expenseType")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateCurrentItem({ type: "income", category: "Income" });
                            }}
                            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                              currentItem.type === "income"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-xs"
                                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                            }`}
                          >
                            <Coins size={16} weight="duotone" />
                            {t("quickAdd.incomeType")}
                          </button>
                        </div>
                      </div>

                      {/* Amount and Date Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                            {t("quickAdd.amountLabel")}
                          </label>
                          <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 focus-within:border-[var(--color-accent)] shadow-xs">
                            <span className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-400 mr-2">
                              ฿
                            </span>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              required
                              placeholder="0.00"
                              value={currentItem.amountStr}
                              onChange={(e) => updateCurrentItem({ amountStr: e.target.value })}
                              className="w-full bg-transparent font-mono text-lg font-bold text-[var(--color-ink)] outline-none"
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
                            value={currentItem.date}
                            onChange={(e) => updateCurrentItem({ date: e.target.value })}
                            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 font-mono text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Description / Name */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                          {t("quickAdd.nameLabel")}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={t("quickAdd.namePlaceholder")}
                          value={currentItem.name}
                          onChange={(e) => updateCurrentItem({ name: e.target.value })}
                          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] shadow-xs font-medium"
                        />
                      </div>

                      {/* Category Selection (If Expense) */}
                      {currentItem.type === "expense" && (
                        <div>
                          <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1.5">
                            {t("quickAdd.categoryLabel")}
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {EXPENSE_CATEGORIES.map((cat) => {
                              const isSelected = currentItem.category === cat;
                              const catColor = CATEGORY_COLORS[cat];
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => updateCurrentItem({ category: cat })}
                                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold shadow-xs"
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

                      {/* Notes / Reference */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">
                          {t("quickAdd.notesLabel")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("quickAdd.notesPlaceholder")}
                          value={currentItem.notes}
                          onChange={(e) => updateCurrentItem({ notes: e.target.value })}
                          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] font-mono"
                        />
                      </div>

                      {/* Cleared Checkbox */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="slipClearedCheckbox"
                          checked={currentItem.cleared}
                          onChange={(e) => updateCurrentItem({ cleared: e.target.checked })}
                          className="h-4 w-4 rounded-md accent-emerald-600 cursor-pointer"
                        />
                        <label
                          htmlFor="slipClearedCheckbox"
                          className="text-xs text-[var(--color-ink)] font-medium cursor-pointer"
                        >
                          {t("quickAdd.clearedLabel")}
                        </label>
                      </div>

                      {formError && (
                        <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300">
                          <WarningCircle size={16} weight="bold" className="shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      {/* Action Buttons: Save Single vs Batch Save All */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[var(--color-line)]">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-ink)] transition"
                        >
                          {t("quickAdd.cancel")}
                        </button>

                        <div className="flex items-center gap-2">
                          {totalSlips > 1 && (
                            <button
                              type="button"
                              onClick={handleSaveAllBatch}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs transition active:scale-[0.98]"
                            >
                              <Sparkle size={15} weight="fill" className="text-emerald-500" />
                              <span>{t("slipScanner.saveAll", { count: unsavedCount, xp: unsavedCount * 25 })}</span>
                            </button>
                          )}

                          <button
                            type="submit"
                            disabled={currentItem.status === "analyzing"}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 dark:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white dark:text-zinc-950 shadow-sm transition hover:bg-zinc-800 dark:hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
                          >
                            <span>{totalSlips > 1 ? t("slipScanner.saveNext") : t("slipScanner.confirmSave", { xp: 25 })}</span>
                            {totalSlips > 1 && <ArrowRight size={14} weight="bold" />}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
