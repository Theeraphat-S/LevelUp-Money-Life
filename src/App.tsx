import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDots } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { HeaderCommandDeck } from "./components/HeaderCommandDeck";
import { QuickAddModal } from "./components/QuickAddModal";
import { DataManagerModal } from "./components/DataManagerModal";
import { LevelUpCelebration } from "./components/LevelUpCelebration";

// Views
import { DashboardOverview } from "./components/views/DashboardOverview";
import { TransactionLedger } from "./components/views/TransactionLedger";
import { BudgetPlanner } from "./components/views/BudgetPlanner";
import { AnalyticsHub } from "./components/views/AnalyticsHub";
import { QuestsGrowth } from "./components/views/QuestsGrowth";

// Services & Types
import {
  getTransactions,
  saveAllTransactions,
  getAllocations,
  saveAllocations,
  getQuests,
  saveAllQuests,
  getSetting,
  saveSetting,
} from "./services/db";
import {
  calculateLevelFromTotalXp,
  evaluateAchievements,
  updateStreak,
} from "./services/gamification";
import type { BackupData } from "./services/exportImport";
import type {
  Allocation,
  GamificationState,
  Quest,
  Transaction,
  ViewTab,
} from "./types";

const today = new Date().toISOString().slice(0, 10);
const currentMonthISO = today.slice(0, 7);

const sampleTransactions: Transaction[] = [
  { id: "t1", name: "Monthly Salary", amount: 48000, date: `${currentMonthISO}-01`, category: "Income", cleared: true, notes: "Direct bank deposit" },
  { id: "t2", name: "Condo Rent & Maintenance", amount: -12500, date: `${currentMonthISO}-02`, category: "Home", cleared: true, notes: "Auto-debit" },
  { id: "t3", name: "Groceries — Tops Market", amount: -1420, date: `${currentMonthISO}-04`, category: "Food", cleared: true, notes: "Weekly pantry restock" },
  { id: "t4", name: "BTS Rabbit Card Top-up", amount: -500, date: `${currentMonthISO}-05`, category: "Transport", cleared: true },
  { id: "t5", name: "Data Science Specialization", amount: -1200, date: `${currentMonthISO}-07`, category: "Learning", cleared: true, notes: "Online certificate" },
  { id: "t6", name: "Dinner & Cafe — Thonglor", amount: -680, date: `${currentMonthISO}-09`, category: "Fun", cleared: false },
  { id: "t7", name: "Emergency Fund Allocation", amount: -5000, date: `${currentMonthISO}-10`, category: "Savings", cleared: true, notes: "High yield savings" },
  { id: "t8", name: "Fitness Membership", amount: -1500, date: `${currentMonthISO}-12`, category: "Health", cleared: true },
];

const sampleAllocations: Allocation[] = [
  { id: "needs", label: "Needs", percent: 50, color: "oklch(58% 0.13 165)" },
  { id: "wants", label: "Wants", percent: 30, color: "oklch(62% 0.11 230)" },
  { id: "savings", label: "Savings", percent: 20, color: "oklch(70% 0.13 80)" },
];

const sampleQuests: Quest[] = [
  { id: "q1", title: "Log every daily expense today", date: today, xp: 15, done: false },
  { id: "q2", title: "Review monthly 50/30/20 budget allocations", date: today, xp: 20, done: true },
  { id: "q3", title: "Transfer 500 THB to emergency savings", date: today, xp: 25, done: false },
];

export default function App() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Core Financial Data
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [allocations, setAllocationsState] = useState<Allocation[]>([]);
  const [income, setIncomeState] = useState<number>(48000);
  const [quests, setQuestsState] = useState<Quest[]>([]);

  // Gamification & Streak State
  const [totalXp, setTotalXp] = useState<number>(180);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [lastActiveDate, setLastActiveDate] = useState<string>(today);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);

  // Navigation & Modals
  const [activeMonth, setActiveMonth] = useState<string>(currentMonthISO);
  const [activeTab, setActiveTab] = useState<ViewTab>("dashboard");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState<boolean>(false);
  const [levelUpModal, setLevelUpModal] = useState<{
    isOpen: boolean;
    level: number;
    rankKey: string;
  }>({
    isOpen: false,
    level: 1,
    rankKey: "rank.novice",
  });

  // Calculate Level and Progression
  const gamification: GamificationState = useMemo(() => {
    const levelStats = calculateLevelFromTotalXp(totalXp);
    return {
      level: levelStats.level,
      currentLevelXp: levelStats.currentLevelXp,
      xpForNextLevel: levelStats.xpForNextLevel,
      totalXp,
      streakDays,
      lastActiveDate,
      titleRankKey: levelStats.titleRankKey,
      unlockedAchievementIds,
    };
  }, [totalXp, streakDays, lastActiveDate, unlockedAchievementIds]);

  // Evaluate Achievements
  const { allAchievements } = useMemo(() => {
    return evaluateAchievements(
      transactions,
      quests,
      allocations,
      streakDays,
      unlockedAchievementIds
    );
  }, [transactions, quests, allocations, streakDays, unlockedAchievementIds]);

  // Initial Load from DB / Storage
  useEffect(() => {
    async function loadData() {
      try {
        let txs = await getTransactions();
        if (txs.length === 0) {
          txs = sampleTransactions;
          await saveAllTransactions(txs);
        }

        let allocs = await getAllocations();
        if (allocs.length === 0) {
          allocs = sampleAllocations;
          await saveAllocations(allocs);
        }

        let qsts = await getQuests();
        if (qsts.length === 0) {
          qsts = sampleQuests;
          await saveAllQuests(qsts);
        }

        const inc = await getSetting<number>("income", 48000);
        const savedXp = await getSetting<number>("totalXp", 180);
        const savedStreak = await getSetting<number>("streakDays", 1);
        const savedLastDate = await getSetting<string>("lastActiveDate", today);
        const savedAchievements = await getSetting<string[]>("unlockedAchievements", [
          "first_log",
        ]);

        // Update streak based on current date
        const { newStreak, today: curToday } = updateStreak(savedLastDate, savedStreak);

        setTransactionsState(txs);
        setAllocationsState(allocs);
        setQuestsState(qsts);
        setIncomeState(inc);
        setTotalXp(savedXp);
        setStreakDays(newStreak);
        setLastActiveDate(curToday);
        setUnlockedAchievementIds(savedAchievements);

        await saveSetting("streakDays", newStreak);
        await saveSetting("lastActiveDate", curToday);
      } catch (err) {
        console.error("Database initialization failed, fallback loaded:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Award XP and check Level Up
  const addXp = (amount: number) => {
    const prevStats = calculateLevelFromTotalXp(totalXp);
    const newTotalXp = totalXp + amount;
    const nextStats = calculateLevelFromTotalXp(newTotalXp);

    setTotalXp(newTotalXp);
    saveSetting("totalXp", newTotalXp).catch(console.error);

    // Trigger Level Up Celebration if level increased
    if (nextStats.level > prevStats.level) {
      setLevelUpModal({
        isOpen: true,
        level: nextStats.level,
        rankKey: nextStats.titleRankKey,
      });
    }
  };

  // State Updaters with Database Sync
  const setTransactions = (value: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    setTransactionsState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveAllTransactions(next).catch(console.error);
      return next;
    });
  };

  const setAllocations = (value: Allocation[] | ((prev: Allocation[]) => Allocation[])) => {
    setAllocationsState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveAllocations(next).catch(console.error);
      return next;
    });
  };

  const setQuests = (value: Quest[] | ((prev: Quest[]) => Quest[])) => {
    setQuestsState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveAllQuests(next).catch(console.error);
      return next;
    });
  };

  const setIncome = (value: number | ((prev: number) => number)) => {
    setIncomeState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveSetting("income", next).catch(console.error);
      return next;
    });
  };

  // Handle Quick Add Save
  const handleSaveQuickTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    addXp(15);

    // Check newly unlocked achievements
    const { newlyUnlocked, bonusXp } = evaluateAchievements(
      [newTx, ...transactions],
      quests,
      allocations,
      streakDays,
      unlockedAchievementIds
    );

    if (newlyUnlocked.length > 0) {
      const newIds = [...unlockedAchievementIds, ...newlyUnlocked.map((a) => a.id)];
      setUnlockedAchievementIds(newIds);
      saveSetting("unlockedAchievements", newIds).catch(console.error);
      if (bonusXp > 0) {
        addXp(bonusXp);
      }
    }
  };

  // Handle Quest Toggle
  const handleToggleQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextDone = !q.done;
          if (nextDone) {
            addXp(q.xp);
          }
          return { ...q, done: nextDone };
        }
        return q;
      })
    );
  };

  // Restore Complete Backup
  const handleRestoreBackup = (backup: BackupData) => {
    if (backup.transactions) setTransactions(backup.transactions);
    if (backup.allocations) setAllocations(backup.allocations);
    if (backup.quests) setQuests(backup.quests);
    if (typeof backup.income === "number") setIncome(backup.income);
    if (backup.gamification?.totalXp) {
      setTotalXp(backup.gamification.totalXp);
      saveSetting("totalXp", backup.gamification.totalXp);
    }
  };

  // Import CSV Transactions
  const handleImportTransactions = (imported: Transaction[]) => {
    setTransactions((prev) => [...imported, ...prev]);
    addXp(imported.length * 10);
  };

  // Reset to Sample Data
  const handleResetData = async () => {
    await saveAllTransactions(sampleTransactions);
    await saveAllocations(sampleAllocations);
    await saveAllQuests(sampleQuests);
    await saveSetting("income", 48000);
    await saveSetting("totalXp", 180);
    await saveSetting("streakDays", 1);
    await saveSetting("unlockedAchievements", ["first_log"]);

    setTransactionsState(sampleTransactions);
    setAllocationsState(sampleAllocations);
    setQuestsState(sampleQuests);
    setIncomeState(48000);
    setTotalXp(180);
    setStreakDays(1);
    setUnlockedAchievementIds(["first_log"]);
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
          onOpenDataManager={() => setIsDataManagerOpen(true)}
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
                onToggleQuest={handleToggleQuest}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
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
                onToggleQuest={handleToggleQuest}
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
          defaultDate={today}
        />

        <DataManagerModal
          isOpen={isDataManagerOpen}
          onClose={() => setIsDataManagerOpen(false)}
          transactions={transactions}
          allocations={allocations}
          quests={quests}
          income={income}
          gamification={gamification}
          onRestoreBackup={handleRestoreBackup}
          onImportTransactions={handleImportTransactions}
          onResetData={handleResetData}
        />

        <LevelUpCelebration
          isOpen={levelUpModal.isOpen}
          level={levelUpModal.level}
          rankKey={levelUpModal.rankKey}
          onClose={() => setLevelUpModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </main>
  );
}
