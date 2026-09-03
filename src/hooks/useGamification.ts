import { useState, useMemo, useCallback } from "react";
import {
  calculateLevelFromTotalXp,
  evaluateAchievements,
  updateStreak,
} from "../services/gamification";
import { saveSetting } from "../services/db";
import type {
  Allocation,
  GamificationState,
  Quest,
  SavingsGoal,
  Transaction,
} from "../types";
import { getInitialDates } from "../constants/sampleData";

const { today } = getInitialDates();

export interface LevelUpModalState {
  isOpen: boolean;
  level: number;
  rankKey: string;
}

export function useGamification() {
  const [totalXp, setTotalXpState] = useState<number>(180);
  const [streakDays, setStreakDaysState] = useState<number>(1);
  const [lastActiveDate, setLastActiveDateState] = useState<string>(today);
  const [unlockedAchievementIds, setUnlockedAchievementIdsState] = useState<string[]>([]);
  const [levelUpModal, setLevelUpModal] = useState<LevelUpModalState>({
    isOpen: false,
    level: 1,
    rankKey: "rank.novice",
  });

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

  const addXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setTotalXpState((prevXp) => {
      const prevStats = calculateLevelFromTotalXp(prevXp);
      const newTotalXp = Math.max(0, prevXp + amount);
      const nextStats = calculateLevelFromTotalXp(newTotalXp);

      saveSetting("totalXp", newTotalXp).catch(console.error);

      // Trigger Level Up Celebration if level increased
      if (nextStats.level > prevStats.level) {
        setLevelUpModal({
          isOpen: true,
          level: nextStats.level,
          rankKey: nextStats.titleRankKey,
        });
      }
      return newTotalXp;
    });
  }, []);

  const checkAchievements = useCallback(
    (
      transactions: Transaction[],
      quests: Quest[],
      allocations: Allocation[],
      savingsGoals?: SavingsGoal[]
    ) => {
      let newlyUnlockedList: { id: string }[] = [];
      let bonusReward = 0;

      setUnlockedAchievementIdsState((currentIds) => {
        const { newlyUnlocked, bonusXp } = evaluateAchievements(
          transactions,
          quests,
          allocations,
          streakDays,
          currentIds,
          savingsGoals
        );
        newlyUnlockedList = newlyUnlocked;
        bonusReward = bonusXp;

        if (newlyUnlocked.length > 0) {
          const newIds = [...currentIds, ...newlyUnlocked.map((a) => a.id)];
          saveSetting("unlockedAchievements", newIds).catch(console.error);
          return newIds;
        }
        return currentIds;
      });

      if (bonusReward > 0) {
        addXp(bonusReward);
      }

      return { newlyUnlocked: newlyUnlockedList, bonusXp: bonusReward };
    },
    [streakDays, addXp]
  );

  const setTotalXp = useCallback((value: number | ((prev: number) => number)) => {
    setTotalXpState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveSetting("totalXp", next).catch(console.error);
      return next;
    });
  }, []);

  const setStreakDays = useCallback((value: number | ((prev: number) => number)) => {
    setStreakDaysState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveSetting("streakDays", next).catch(console.error);
      return next;
    });
  }, []);

  const setLastActiveDate = useCallback((value: string | ((prev: string) => string)) => {
    setLastActiveDateState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveSetting("lastActiveDate", next).catch(console.error);
      return next;
    });
  }, []);

  const setUnlockedAchievementIds = useCallback(
    (value: string[] | ((prev: string[]) => string[])) => {
      setUnlockedAchievementIdsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        saveSetting("unlockedAchievements", next).catch(console.error);
        return next;
      });
    },
    []
  );

  const initGamification = useCallback(
    (savedXp: number, savedStreak: number, savedLastDate: string, savedAchievements: string[]) => {
      const { newStreak, today: curToday } = updateStreak(savedLastDate, savedStreak);
      setTotalXpState(savedXp);
      setStreakDaysState(newStreak);
      setLastActiveDateState(curToday);
      setUnlockedAchievementIdsState(savedAchievements);

      saveSetting("streakDays", newStreak).catch(console.error);
      saveSetting("lastActiveDate", curToday).catch(console.error);
    },
    []
  );

  const closeLevelUpModal = useCallback(() => {
    setLevelUpModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    totalXp,
    streakDays,
    lastActiveDate,
    unlockedAchievementIds,
    gamification,
    levelUpModal,
    addXp,
    checkAchievements,
    setTotalXp,
    setStreakDays,
    setLastActiveDate,
    setUnlockedAchievementIds,
    setLevelUpModal,
    closeLevelUpModal,
    initGamification,
  };
}
