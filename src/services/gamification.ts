import type { Achievement, Allocation, GamificationState, Quest, SavingsGoal, Transaction } from "../types";

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_log",
    titleKey: "achievements.first_log.title",
    descKey: "achievements.first_log.desc",
    iconName: "PencilSimpleLine",
    xpReward: 25,
    unlocked: false,
  },
  {
    id: "first_income",
    titleKey: "achievements.first_income.title",
    descKey: "achievements.first_income.desc",
    iconName: "Coins",
    xpReward: 30,
    unlocked: false,
  },
  {
    id: "streak_3",
    titleKey: "achievements.streak_3.title",
    descKey: "achievements.streak_3.desc",
    iconName: "Fire",
    xpReward: 50,
    unlocked: false,
    target: 3,
  },
  {
    id: "streak_7",
    titleKey: "achievements.streak_7.title",
    descKey: "achievements.streak_7.desc",
    iconName: "FireSimple",
    xpReward: 100,
    unlocked: false,
    target: 7,
  },
  {
    id: "quest_master",
    titleKey: "achievements.quest_master.title",
    descKey: "achievements.quest_master.desc",
    iconName: "CheckCircle",
    xpReward: 40,
    unlocked: false,
  },
  {
    id: "balanced_budget",
    titleKey: "achievements.balanced_budget.title",
    descKey: "achievements.balanced_budget.desc",
    iconName: "Scales",
    xpReward: 35,
    unlocked: false,
  },
  {
    id: "savings_champion",
    titleKey: "achievements.savings_champion.title",
    descKey: "achievements.savings_champion.desc",
    iconName: "PiggyBank",
    xpReward: 50,
    unlocked: false,
  },
  {
    id: "ten_logs",
    titleKey: "achievements.ten_logs.title",
    descKey: "achievements.ten_logs.desc",
    iconName: "ListChecks",
    xpReward: 60,
    unlocked: false,
    target: 10,
  },
  {
    id: "cleared_all",
    titleKey: "achievements.cleared_all.title",
    descKey: "achievements.cleared_all.desc",
    iconName: "ShieldCheck",
    xpReward: 45,
    unlocked: false,
  },
  {
    id: "tax_planner",
    titleKey: "achievements.tax_planner.title",
    descKey: "achievements.tax_planner.desc",
    iconName: "Calculator",
    xpReward: 50,
    unlocked: false,
  },
  {
    id: "tax_optimizer",
    titleKey: "achievements.tax_optimizer.title",
    descKey: "achievements.tax_optimizer.desc",
    iconName: "ChartLineUp",
    xpReward: 75,
    unlocked: false,
  },
  {
    id: "savings_first_goal",
    titleKey: "achievements.savings_first_goal.title",
    descKey: "achievements.savings_first_goal.desc",
    iconName: "PiggyBank",
    xpReward: 50,
    unlocked: false,
  },
  {
    id: "emergency_shield",
    titleKey: "achievements.emergency_shield.title",
    descKey: "achievements.emergency_shield.desc",
    iconName: "ShieldCheck",
    xpReward: 75,
    unlocked: false,
  },
  {
    id: "goal_conqueror",
    titleKey: "achievements.goal_conqueror.title",
    descKey: "achievements.goal_conqueror.desc",
    iconName: "Trophy",
    xpReward: 100,
    unlocked: false,
    target: 3,
  },
];

/**
 * Calculates XP required to advance from Level L to Level L+1.
 * Level 1: 100 XP
 * Level 2: 150 XP
 * Level 3: 200 XP ...
 */
export function getXpRequiredForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

/**
 * Derives full level and progression stats from total lifetime XP.
 */
export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPercent: number;
  titleRankKey: string;
} {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const required = getXpRequiredForLevel(level);
    if (remainingXp >= required) {
      remainingXp -= required;
      level += 1;
    } else {
      break;
    }
  }

  const xpForNextLevel = getXpRequiredForLevel(level);
  const progressPercent = Math.min(100, Math.round((remainingXp / xpForNextLevel) * 100));

  let titleRankKey = "rank.novice";
  if (level >= 20) titleRankKey = "rank.maestro";
  else if (level >= 15) titleRankKey = "rank.sovereign";
  else if (level >= 10) titleRankKey = "rank.guardian";
  else if (level >= 6) titleRankKey = "rank.strategist";
  else if (level >= 3) titleRankKey = "rank.tactician";

  return {
    level,
    currentLevelXp: remainingXp,
    xpForNextLevel,
    progressPercent,
    titleRankKey,
  };
}

/**
 * Calculates updated streak days comparing last active date with current date.
 */
export function updateStreak(lastActiveDate: string, currentStreak: number, todayDate?: string): { newStreak: number; today: string } {
  const today = todayDate || new Date().toISOString().slice(0, 10);
  if (!lastActiveDate) {
    return { newStreak: 1, today };
  }
  if (lastActiveDate === today) {
    return { newStreak: Math.max(1, currentStreak), today };
  }

  const lastDate = new Date(lastActiveDate);
  const curDate = new Date(today);
  const diffTime = curDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 1) {
    return { newStreak: currentStreak + 1, today };
  } else {
    return { newStreak: 1, today };
  }
}

/**
 * Evaluates all achievements and returns newly unlocked ones.
 */
export function evaluateAchievements(
  transactions: Transaction[],
  quests: Quest[],
  allocations: Allocation[],
  streakDays: number,
  unlockedIds: string[],
  savingsGoals?: SavingsGoal[]
): { newlyUnlocked: Achievement[]; allAchievements: Achievement[]; bonusXp: number } {
  const today = new Date().toISOString().slice(0, 10);
  const newlyUnlocked: Achievement[] = [];
  let bonusXp = 0;

  const totalLogs = transactions.length;
  const hasIncome = transactions.some((t) => t.amount > 0);
  const allQuestsDone = quests.length >= 3 && quests.every((q) => q.done);
  const totalAllocPercent = allocations.reduce((s, a) => s + a.percent, 0);
  const isBudgetBalanced = totalAllocPercent === 100;
  const savingsAlloc = allocations.find((a) => a.id === "savings" || a.label.toLowerCase().includes("saving"));
  const hasGoodSavings = savingsAlloc ? savingsAlloc.percent >= 20 : false;
  const allCleared = transactions.length > 0 && transactions.every((t) => t.cleared);

  const completedGoalsCount = savingsGoals?.filter((g) => g.status === "completed" || g.currentAmount >= g.targetAmount).length || 0;
  const hasEmergencyShield = savingsGoals?.some((g) => g.category === "emergency" && (g.currentAmount / Math.max(1, g.targetAmount)) >= 0.5) || false;

  const allAchievements = INITIAL_ACHIEVEMENTS.map((ach) => {
    const isAlreadyUnlocked = unlockedIds.includes(ach.id);
    let shouldUnlock = isAlreadyUnlocked;
    let progress = 0;

    switch (ach.id) {
      case "first_log":
        progress = totalLogs > 0 ? 1 : 0;
        shouldUnlock = totalLogs > 0;
        break;
      case "first_income":
        progress = hasIncome ? 1 : 0;
        shouldUnlock = hasIncome;
        break;
      case "streak_3":
        progress = Math.min(3, streakDays);
        shouldUnlock = streakDays >= 3;
        break;
      case "streak_7":
        progress = Math.min(7, streakDays);
        shouldUnlock = streakDays >= 7;
        break;
      case "quest_master":
        progress = allQuestsDone ? 1 : 0;
        shouldUnlock = allQuestsDone;
        break;
      case "balanced_budget":
        progress = isBudgetBalanced ? 1 : 0;
        shouldUnlock = isBudgetBalanced;
        break;
      case "savings_champion":
        progress = hasGoodSavings ? 1 : 0;
        shouldUnlock = hasGoodSavings;
        break;
      case "ten_logs":
        progress = Math.min(10, totalLogs);
        shouldUnlock = totalLogs >= 10;
        break;
      case "cleared_all":
        progress = allCleared ? 1 : 0;
        shouldUnlock = allCleared;
        break;
      case "savings_first_goal":
        progress = completedGoalsCount > 0 ? 1 : 0;
        shouldUnlock = completedGoalsCount > 0;
        break;
      case "emergency_shield":
        progress = hasEmergencyShield ? 1 : 0;
        shouldUnlock = hasEmergencyShield;
        break;
      case "goal_conqueror":
        progress = Math.min(3, completedGoalsCount);
        shouldUnlock = completedGoalsCount >= 3;
        break;
    }

    if (!isAlreadyUnlocked && shouldUnlock) {
      const unlockedItem: Achievement = {
        ...ach,
        unlocked: true,
        unlockedAt: today,
        progress: ach.target ?? 1,
      };
      newlyUnlocked.push(unlockedItem);
      bonusXp += ach.xpReward;
      return unlockedItem;
    }

    return {
      ...ach,
      unlocked: isAlreadyUnlocked,
      progress,
    };
  });

  return { newlyUnlocked, allAchievements, bonusXp };
}
