import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowCounterClockwise,
  Buildings,
  Check,
  CheckCircle,
  Coins,
  CurrencyCircleDollar,
  GearSix,
  Lightning,
  Receipt,
  Sparkle,
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

interface SlipScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction, xpBonus: number) => void;
  initialFileOrUrl?: File | string | null;
}

export const SlipScanModal: React.FC<SlipScanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFileOrUrl,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ParsedSlipResult | null>(null);
  const [error, setError] = useState<string>("");

  // Form Fields
  const [type, setType] = useState<"expense" | "income">("expense");
  const [name, setName] = useState<string>("");
  const [amountStr, setAmountStr] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [cleared, setCleared] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");

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

  // Process Slip Image
  const processImage = useCallback(
    async (source: File | string) => {
      setError("");
      setIsAnalyzing(true);
      setScanResult(null);

      // Generate preview URL
      let previewUrl = "";
      if (source instanceof File) {
        previewUrl = URL.createObjectURL(source);
      } else {
        previewUrl = source;
      }
      setImagePreviewUrl(previewUrl);

      try {
        const result = await parseSlipImage(source, geminiApiKey, (stepText, progressPct) => {
          setAnalysisStep(stepText);
          setAnalysisProgress(progressPct);
        });

        setScanResult(result);
        setType(result.transactionType);
        setName(result.description);
        setAmountStr(result.amount > 0 ? result.amount.toFixed(2) : "");
        setDate(result.date);
        setCategory(result.suggestedCategory);
        setNotes(result.notes || "");
      } catch (err: unknown) {
        console.error("Slip parsing failed:", err);
        setError(err instanceof Error ? err.message : "Failed to parse slip image");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [geminiApiKey]
  );

  // Handle Initial File passed as prop
  useEffect(() => {
    if (isOpen && initialFileOrUrl) {
      processImage(initialFileOrUrl);
    }
  }, [isOpen, initialFileOrUrl, processImage]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setImagePreviewUrl(null);
      setScanResult(null);
      setError("");
      setIsAnalyzing(false);
      setIsSettingsOpen(false);
    }
  }, [isOpen]);

  // Handle Escape Key & Global Paste inside Modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImage(file);
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, onClose, processImage]);

  // Handle Dropzone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        processImage(file);
      }
    }
  };

  // Handle File Input Change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processImage(file);
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

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(amountStr);

    if (!name.trim()) {
      setError("Please specify a description for this transaction");
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

    // 25 XP bonus for scanning a bank slip!
    onSave(newTx, 25);
    onClose();
  };

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
                      {t("slipScanner.title")}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      <Sparkle size={11} weight="fill" className="text-emerald-500" />
                      +25 XP
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-ink-soft)] truncate max-w-[280px] sm:max-w-md">
                    {t("slipScanner.subtitle")}
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
                  <GearSix size={18} weight={geminiApiKey ? "fill" : "regular"} className={geminiApiKey ? "text-emerald-500" : ""} />
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

            {/* Modal Body: Two Modes (Dropzone vs Review Form) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {!imagePreviewUrl ? (
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
                    <span>Browse Slip Image</span>
                  </div>

                  <div className="mt-6 flex items-center gap-4 text-[11px] text-[var(--color-ink-soft)]">
                    <span className="flex items-center gap-1">
                      <Check size={12} weight="bold" className="text-emerald-500" />
                      All Thai Banks (KTB, KBank, SCB, BBL, etc.)
                    </span>
                    <span className="flex items-center gap-1">
                      <Check size={12} weight="bold" className="text-emerald-500" />
                      PromptPay & Wallets
                    </span>
                  </div>

                  <p className="mt-4 text-[10px] font-mono text-[var(--color-ink-soft)] opacity-75">
                    {t("slipScanner.pasteHint")}
                  </p>
                </div>
              ) : (
                /* Mode 2: Split Review & Confirmation View */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column (5 Cols): Image & Scan Status Card */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-2 shadow-xs group">
                      <div className="relative aspect-3/4 max-h-[380px] w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/20 flex items-center justify-center">
                        <img
                          src={imagePreviewUrl}
                          alt="Slip Preview"
                          className="h-full w-full object-contain"
                        />

                        {/* Scanning Overlay State */}
                        <AnimatePresence>
                          {isAnalyzing && (
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
                                {analysisStep || "Extracting details..."}
                              </p>

                              {/* Progress bar */}
                              <div className="w-full max-w-[180px] h-1.5 rounded-full bg-white/20 overflow-hidden">
                                <motion.div
                                  className="h-full bg-emerald-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${analysisProgress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Action to change slip image */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-2 text-xs font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition"
                      >
                        <ArrowCounterClockwise size={14} weight="bold" />
                        <span>{t("slipScanner.scanNewSlip")}</span>
                      </button>
                    </div>

                    {/* Detected Slip Badges Card */}
                    {scanResult && !isAnalyzing && (
                      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)]/50 p-4 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-2">
                          <span className="font-semibold text-[var(--color-ink-soft)]">
                            {t("slipScanner.detectedBank")}
                          </span>
                          <span className="font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                            <Buildings size={14} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                            {scanResult.bankName}
                          </span>
                        </div>

                        {scanResult.receiver && (
                          <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-2">
                            <span className="font-semibold text-[var(--color-ink-soft)]">
                              {t("slipScanner.detectedReceiver")}
                            </span>
                            <span className="font-semibold text-[var(--color-ink)] truncate max-w-[170px]">
                              {scanResult.receiver}
                            </span>
                          </div>
                        )}

                        {scanResult.refNumber && (
                          <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-2">
                            <span className="font-semibold text-[var(--color-ink-soft)]">
                              {t("slipScanner.detectedRef")}
                            </span>
                            <span className="font-mono text-[11px] text-[var(--color-ink-soft)]">
                              {scanResult.refNumber}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="font-semibold text-[var(--color-ink-soft)]">
                            Engine
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle size={12} weight="fill" />
                            {scanResult.engine === "gemini" ? t("slipScanner.engineGemini") : t("slipScanner.engineLocal")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column (7 Cols): Editable Transaction Form */}
                  <div className="lg:col-span-7">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Income vs Expense Toggle */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1.5">
                          Transaction Type
                        </label>
                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-1">
                          <button
                            type="button"
                            onClick={() => {
                              setType("expense");
                              if (category === "Income") setCategory("Food");
                            }}
                            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                              type === "expense"
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
                              setType("income");
                              setCategory("Income");
                            }}
                            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                              type === "income"
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
                              value={amountStr}
                              onChange={(e) => setAmountStr(e.target.value)}
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
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
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
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] shadow-xs font-medium"
                        />
                      </div>

                      {/* Category Selection (If Expense) */}
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
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] font-mono"
                        />
                      </div>

                      {/* Cleared Checkbox */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="slipClearedCheckbox"
                          checked={cleared}
                          onChange={(e) => setCleared(e.target.checked)}
                          className="h-4 w-4 rounded-md accent-emerald-600 cursor-pointer"
                        />
                        <label
                          htmlFor="slipClearedCheckbox"
                          className="text-xs text-[var(--color-ink)] font-medium cursor-pointer"
                        >
                          {t("quickAdd.clearedLabel")}
                        </label>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300">
                          <WarningCircle size={16} weight="bold" className="shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Submit Actions */}
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
                          disabled={isAnalyzing}
                          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 dark:bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white dark:text-zinc-950 shadow-sm transition hover:bg-zinc-800 dark:hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
                        >
                          <Sparkle size={16} weight="fill" className="text-emerald-400 dark:text-zinc-950" />
                          <span>{t("slipScanner.confirmSave", { xp: 25 })}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
