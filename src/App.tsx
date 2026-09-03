import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDots, Sparkle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

// Components & Modals
import { HeaderCommandDeck } from "./components/HeaderCommandDeck";
import { QuickCommandBar } from "./components/QuickCommandBar";
import { UndoToast } from "./components/UndoToast";
import { QuickAddModal } from "./components/QuickAddModal";
import { SlipScanModal } from "./components/SlipScanModal";
import { DataManagerModal } from "./components/DataManagerModal";
import { LevelUpCelebration } from "./components/LevelUpCelebration";

// Views
import { DashboardOverview } from "./components/views/DashboardOverview";
import { TransactionLedger } from "./components/views/TransactionLedger";
import { BudgetPlanner } from "./components/views/BudgetPlanner";
import { SavingsGoalsView } from "./components/views/SavingsGoalsView";
import { TaxPlannerView } from "./components/views/TaxPlannerView";
import { AnalyticsHub } from "./components/views/AnalyticsHub";
import { QuestsGrowth } from "./components/views/QuestsGrowth";

// Domain Hooks
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { useGamification } from "./hooks/useGamification";
import { useTransactions } from "./hooks/useTransactions";
import { useBudgetAllocations } from "./hooks/useBudgetAllocations";
import { useQuests } from "./hooks/useQuests";
import { useTaxProfile } from "./hooks/useTaxProfile";
import { useBankSlipListener } from "./hooks/useBankSlipListener";
import { useSavingsGoals } from "./hooks/useSavingsGoals";

// Services, Constants & Types
import {
  getTransactions,
  saveAllTransactions,
  getAllocations,
  saveAllocations,
  getQuests,
  saveAllQuests,
  getSetting,
  saveSetting,
  getTaxProfile as getSavedTaxProfile,
  saveAllSavingsGoals,
  INITIAL_SAVINGS_GOALS,
} from "./services/db";
import { evaluateAchievements } from "./services/gamification";
import { DEFAULT_PRESETS, getStoredPresets, saveStoredPresets } from "./utils/presetManager";
import {
  SAMPLE_TRANSACTIONS,
  SAMPLE_ALLOCATIONS,
  SAMPLE_QUESTS,
  getInitialDates,
} from "./constants/sampleData";
import type { BackupData } from "./services/exportImport";
import type { Transaction, ViewTab } from "./types";

const { today, currentMonthISO } = getInitialDates();

export default function App() {
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = useTheme();
  const [loading, setLoading] = useState(true);

  // Navigation & Modals
  const [activeMonth, setActiveMonth] = useState<string>(currentMonthISO);
  const [activeTab, setActiveTab] = useState<ViewTab>("dashboard");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState<boolean>(false);

  // Domain Hooks
  const { toastNotice, showToast } = useToast();
  const {
    isSlipScanOpen,
    setIsSlipScanOpen,
    slipInitialFiles,
    setSlipInitialFiles,
    openSlipScan,
  } = useBankSlipListener();

  const {
    gamification,
    levelUpModal,
    addXp,
    checkAchievements,
    setTotalXp,
    setStreakDays,
    setUnlockedAchievementIds,
    closeLevelUpModal,
    initGamification,
    totalXp,
    streakDays,
    unlockedAchievementIds,
  } = useGamification();

  const {
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
  } = useTransactions();

  const {
    allocations,
    setAllocations,
    setAllocationsState,
    income,
    setIncome,
    setIncomeState,
    initAllocations,
  } = useBudgetAllocations();

  const {
    quests,
    setQuests,
    setQuestsState,
    toggleQuest,
    autoCompleteLoggingQuest,
    initQuests,
  } = useQuests();

  const {
    taxProfile,
    setTaxProfile,
    setTaxProfileState,
    initTaxProfile,
  } = useTaxProfile();

  const {
    goals: savingsGoals,
    isLoading: isSavingsLoading,
    totalSaved,
    totalTarget: savingsTotalTarget,
    overallProgress: savingsOverallProgress,
    activeGoalsCount: savingsActiveCount,
    completedGoalsCount: savingsCompletedCount,
    createGoal: handleCreateSavingsGoal,
    updateGoal: handleUpdateSavingsGoal,
    deleteGoal: handleDeleteSavingsGoal,
    depositToGoal: handleDepositToSavingsGoal,
    withdrawFromGoal: handleWithdrawFromSavingsGoal,
    setAllGoals: setSavingsGoals,
  } = useSavingsGoals({
    onAddTransaction: (tx) => {
      const newTx: Transaction = {
        ...tx,
        id: crypto.randomUUID(),
      };
      setTransactions((prev) => {
        const next = [newTx, ...prev];
        checkAchievements(next, quests, allocations, savingsGoals);
        return next;
      });
    },
    onAwardXp: (amount) => {
      addXp(amount);
    },
  });

  // Evaluate Active Achievements
  const { allAchievements } = useMemo(() => {
    return evaluateAchievements(
      transactions,
      quests,
      allocations,
      streakDays,
      unlockedAchievementIds,
      savingsGoals
    );
  }, [transactions, quests, allocations, streakDays, unlockedAchievementIds, savingsGoals]);

  // Sync achievements when savings goals or allocations change
  useEffect(() => {
    if (!loading && savingsGoals.length > 0) {
      checkAchievements(transactions, quests, allocations, savingsGoals);
    }
  }, [savingsGoals, loading, checkAchievements, transactions, quests, allocations]);

  // Initial Load from DB / Storage
  useEffect(() => {
    async function loadData() {
      try {
        let txs = await getTransactions();
        if (txs.length === 0) {
          txs = SAMPLE_TRANSACTIONS;
          await saveAllTransactions(txs);
        }

        let allocs = await getAllocations();
        if (allocs.length === 0) {
          allocs = SAMPLE_ALLOCATIONS;
          await saveAllocations(allocs);
        }

        let qsts = await getQuests();
        if (qsts.length === 0) {
          qsts = SAMPLE_QUESTS;
          await saveAllQuests(qsts);
        }

        const inc = await getSetting<number>("income", 48000);
        const savedTax = await getSavedTaxProfile();
        const savedXp = await getSetting<number>("totalXp", 180);
        const savedStreak = await getSetting<number>("streakDays", 1);
        const savedLastDate = await getSetting<string>("lastActiveDate", today);
        const savedAchievements = await getSetting<string[]>("unlockedAchievements", [
          "first_log",
        ]);
        const savedPresets = await getStoredPresets();

        initTransactions(txs, savedPresets);
        initAllocations(allocs, inc);
        initQuests(qsts);
        initTaxProfile(savedTax);
        initGamification(savedXp, savedStreak, savedLastDate, savedAchievements);
      } catch (err) {
        console.error("Database initialization failed, fallback loaded:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initTransactions, initAllocations, initQuests, initTaxProfile, initGamification]);

  // Handle Quick Command Bar / Preset Transaction Logging
  const handleLogQuickTransaction = (newTx: Transaction) => {
    logQuickTransaction(newTx, {
      onAwardXp: addXp,
      onAfterLogged: (tx) => {
        autoCompleteLoggingQuest(addXp);
        checkAchievements([tx, ...transactions], quests, allocations, savingsGoals);
      },
    });
  };

  // Handle Undo Transaction Revert
  const handleUndoTransaction = (tx: Transaction) => {
    undoTransaction(tx, {
      onDeductXp: (amount) => setTotalXp((prev) => Math.max(0, prev - amount)),
      onToast: showToast,
      undoNoticeMessage: t("quickBar.toastUndone", { name: tx.name }),
    });
  };

  // Handle Quick Add Save
  const handleSaveQuickTransaction = (newTx: Transaction) => {
    saveQuickTransaction(newTx, {
      onAwardXp: addXp,
      onAfterLogged: (tx) => {
        checkAchievements([tx, ...transactions], quests, allocations, savingsGoals);
      },
    });
  };

  // Handle Slip Scan Save
  const handleSaveSlipTransaction = (newTx: Transaction, xpBonus = 25) => {
    saveSlipTransaction(newTx, xpBonus, {
      onAwardXp: addXp,
      onAfterLogged: (tx) => {
        autoCompleteLoggingQuest(addXp);
        checkAchievements([tx, ...transactions], quests, allocations, savingsGoals);
      },
      onToast: (msg) => showToast(msg, 4000),
      toastMessage: t("slipScanner.toastSuccess", { xp: xpBonus }),
    });
  };

  // Handle Batch Slip Save
  const handleSaveBatchSlipTransactions = (newTxs: Transaction[], totalXpBonus: number) => {
    if (!newTxs || newTxs.length === 0) return;

    const monthCounts: Record<string, number> = {};
    newTxs.forEach((tx) => {
      const m = tx.date ? tx.date.slice(0, 7) : "";
      if (m) {
        monthCounts[m] = (monthCounts[m] || 0) + 1;
      }
    });

    const monthKeys = Object.keys(monthCounts);
    let monthSummary = "";
    if (monthKeys.length === 1) {
      monthSummary = ` · ${monthKeys[0]}`;
    } else if (monthKeys.length > 1) {
      monthSummary = ` · (${monthKeys.map((m) => `${m}: ${monthCounts[m]}`).join(", ")})`;
    }

    saveBatchSlipTransactions(newTxs, totalXpBonus, {
      onAwardXp: addXp,
      onAfterLoggedBatch: (txs) => {
        autoCompleteLoggingQuest(addXp);
        checkAchievements([...txs, ...transactions], quests, allocations, savingsGoals);
      },
      onToast: (msg) => showToast(msg, 5500),
      toastMessage: `${t("slipScanner.batchToastSuccess", { count: newTxs.length, xp: totalXpBonus })}${monthSummary}`,
    });
  };

  // Restore Complete Backup
  const handleRestoreBackup = (backup: BackupData) => {
    if (backup.transactions) setTransactions(backup.transactions);
    if (backup.allocations) setAllocations(backup.allocations);
    if (backup.quests) setQuests(backup.quests);
    if (typeof backup.income === "number") setIncome(backup.income);
    if (backup.taxProfile) setTaxProfile(backup.taxProfile);
    if (backup.presets) setPresets(backup.presets);
    if (backup.savingsGoals) setSavingsGoals(backup.savingsGoals);
    if (backup.gamification?.totalXp) {
      setTotalXp(backup.gamification.totalXp);
    }
  };

  // Reset to Sample Data
  const handleResetData = async () => {
    await saveAllTransactions(SAMPLE_TRANSACTIONS);
    await saveAllocations(SAMPLE_ALLOCATIONS);
    await saveAllQuests(SAMPLE_QUESTS);
    await saveAllSavingsGoals(INITIAL_SAVINGS_GOALS);
    await saveSetting("income", 48000);
    await saveSetting("totalXp", 180);
    await saveSetting("streakDays", 1);
    await saveSetting("unlockedAchievements", ["first_log"]);
    await saveStoredPresets(DEFAULT_PRESETS);

    setTransactionsState(SAMPLE_TRANSACTIONS);
    setAllocationsState(SAMPLE_ALLOCATIONS);
    setQuestsState(SAMPLE_QUESTS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setIncomeState(48000);
    setTotalXp(180);
    setStreakDays(1);
    setUnlockedAchievementIds(["first_log"]);
    setPresetsState(DEFAULT_PRESETS);
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-base)]">
        <div className="text-center font-mono text-sm text-[var(--color-ink-soft)]">
          {t("app.loading")}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        {/* Top Header Command Deck */}
        <HeaderCommandDeck
          gamification={gamification}
          activeMonth={activeMonth}
          setActiveMonth={setActiveMonth}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenScanSlip={() => openSlipScan([])}
          onOpenDataManager={() => setIsDataManagerOpen(true)}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />

        {/* Quick Command Bar & One-Tap Presets System */}
        <QuickCommandBar
          transactions={transactions}
          allocations={allocations}
          income={income}
          activeMonth={activeMonth}
          presets={presets}
          setPresets={setPresets}
          onLogTransaction={handleLogQuickTransaction}
        />

        {/* Dynamic View Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <DashboardOverview
                transactions={transactions}
                allocations={allocations}
                quests={quests}
                income={income}
                activeMonth={activeMonth}
                setActiveTab={setActiveTab}
                onToggleQuest={(id) => toggleQuest(id, addXp)}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                savingsGoals={savingsGoals}
              />
            </motion.div>
          )}

          {activeTab === "ledger" && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <TransactionLedger
                transactions={transactions}
                setTransactions={setTransactions}
                activeMonth={activeMonth}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === "budget" && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <BudgetPlanner
                income={income}
                setIncome={setIncome}
                allocations={allocations}
                setAllocations={setAllocations}
                transactions={transactions}
                activeMonth={activeMonth}
              />
            </motion.div>
          )}

          {activeTab === "savings" && (
            <motion.div
              key="savings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <SavingsGoalsView
                goals={savingsGoals}
                isLoading={isSavingsLoading}
                totalSaved={totalSaved}
                totalTarget={savingsTotalTarget}
                overallProgress={savingsOverallProgress}
                activeGoalsCount={savingsActiveCount}
                completedGoalsCount={savingsCompletedCount}
                onCreateGoal={handleCreateSavingsGoal}
                onUpdateGoal={handleUpdateSavingsGoal}
                onDeleteGoal={handleDeleteSavingsGoal}
                onDeposit={handleDepositToSavingsGoal}
                onWithdraw={handleWithdrawFromSavingsGoal}
                transactions={transactions}
                activeMonth={activeMonth}
              />
            </motion.div>
          )}

          {activeTab === "tax" && (
            <motion.div
              key="tax"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <TaxPlannerView
                taxProfile={taxProfile}
                setTaxProfile={setTaxProfile}
                monthlyIncome={income}
                onAwardXp={(xp) => addXp(xp)}
              />
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnalyticsHub
                transactions={transactions}
                activeMonth={activeMonth}
              />
            </motion.div>
          )}

          {activeTab === "quests" && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <QuestsGrowth
                quests={quests}
                setQuests={setQuests}
                gamification={gamification}
                achievements={allAchievements}
                onToggleQuest={(id) => toggleQuest(id, addXp)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-10 flex flex-wrap items-center justify-between border-t border-[var(--color-line)] pt-4 text-xs text-[var(--color-ink-soft)]">
          <span className="font-mono">LevelUp Money Life · v0.3.0 Pro · Local-First (SQLite)</span>
          <span className="inline-flex items-center gap-1.5 font-mono">
            <CalendarDots size={14} /> {today}
          </span>
        </footer>

        {/* Modals */}
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSave={handleSaveQuickTransaction}
          onOpenScanSlip={() => openSlipScan([])}
          defaultDate={today}
        />

        <SlipScanModal
          isOpen={isSlipScanOpen}
          onClose={() => {
            setIsSlipScanOpen(false);
            setSlipInitialFiles([]);
          }}
          onSave={handleSaveSlipTransaction}
          onSaveBatch={handleSaveBatchSlipTransactions}
          initialFiles={slipInitialFiles}
        />

        <DataManagerModal
          isOpen={isDataManagerOpen}
          onClose={() => setIsDataManagerOpen(false)}
          transactions={transactions}
          allocations={allocations}
          quests={quests}
          income={income}
          gamification={gamification}
          taxProfile={taxProfile}
          presets={presets}
          savingsGoals={savingsGoals}
          onRestoreBackup={handleRestoreBackup}
          onImportTransactions={(txs) => importTransactions(txs, { onAwardXp: addXp })}
          onResetData={handleResetData}
        />

        <LevelUpCelebration
          isOpen={levelUpModal.isOpen}
          level={levelUpModal.level}
          rankKey={levelUpModal.rankKey}
          onClose={closeLevelUpModal}
        />

        {/* 5-Second Undo Toast for Quick Logging */}
        <UndoToast
          transaction={lastLoggedTx}
          xpAwarded={15}
          onUndo={handleUndoTransaction}
          onDismiss={() => setLastLoggedTx(null)}
          durationMs={5000}
        />

        {/* Global Toast Notification */}
        <AnimatePresence>
          {toastNotice.visible && (
            <motion.aside
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-[var(--color-surface)] px-4 py-3 shadow-xl backdrop-blur-md"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Sparkle size={16} weight="fill" className="text-emerald-500" />
              </div>
              <span className="text-xs font-semibold text-[var(--color-ink)]">
                {toastNotice.message}
              </span>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
