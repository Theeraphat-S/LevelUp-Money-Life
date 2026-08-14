export const TRANSACTION_CATEGORIES = [
  "Income",
  "Food",
  "Transport",
  "Home",
  "Health",
  "Learning",
  "Fun",
  "Debt",
  "Savings",
] as const;

export const EXPENSE_CATEGORIES = TRANSACTION_CATEGORIES.filter((category) => category !== "Income");

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export type BudgetBucket = "Needs" | "Wants" | "Savings";

export const CATEGORY_BUCKET_MAP: Record<Exclude<TransactionCategory, "Income">, BudgetBucket> = {
  Food: "Needs",
  Transport: "Needs",
  Home: "Needs",
  Health: "Needs",
  Learning: "Wants",
  Fun: "Wants",
  Debt: "Savings",
  Savings: "Savings",
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Income: "oklch(60% 0.15 150)",   // Emerald
  Food: "oklch(62% 0.14 30)",      // Warm Coral / Orange
  Transport: "oklch(60% 0.13 240)", // Azure Blue
  Home: "oklch(58% 0.12 280)",     // Indigo / Purple
  Health: "oklch(62% 0.15 350)",    // Rose / Pink
  Learning: "oklch(65% 0.14 190)",  // Teal / Cyan
  Fun: "oklch(68% 0.15 70)",       // Amber / Gold
  Debt: "oklch(55% 0.16 20)",      // Deep Red / Terracotta
  Savings: "oklch(68% 0.15 165)",  // Bright Emerald Green
};

export const BUCKET_COLORS: Record<BudgetBucket, string> = {
  Needs: "oklch(58% 0.13 165)",   // Emerald
  Wants: "oklch(62% 0.11 230)",   // Indigo Blue
  Savings: "oklch(70% 0.13 80)",  // Amber Gold
};

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: TransactionCategory;
  cleared: boolean;
  notes?: string;
};

export type Allocation = {
  id: string;
  label: BudgetBucket | string;
  percent: number;
  color: string;
};

export type Quest = {
  id: string;
  title: string;
  date: string;
  xp: number;
  done: boolean;
  category?: "daily" | "habit" | "milestone";
};

export type Achievement = {
  id: string;
  titleKey: string;
  descKey: string;
  iconName: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
};

export type GamificationState = {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string;
  titleRankKey: string;
  unlockedAchievementIds: string[];
};

export type ViewTab = "dashboard" | "ledger" | "budget" | "analytics" | "quests";

export type SortField = "date" | "amount" | "name" | "category";
export type SortOrder = "asc" | "desc";

export type ThemeMode = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

