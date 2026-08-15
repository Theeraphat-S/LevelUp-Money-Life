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
  Income: "#4D8E75",    // Soft Jade (Growth / Income)
  Food: "#C99A4B",      // Muted Amber (Living necessity / Daily)
  Transport: "#1C5954", // Deep Teal (Core structure)
  Home: "#879B62",      // Moss (Secondary / Domestic)
  Health: "#879B62",    // Moss (Wellness / Secondary)
  Learning: "#1C5954",  // Deep Teal (Growth investment)
  Fun: "#C99A4B",       // Muted Amber (Lifestyle / Leisure)
  Debt: "#B96D69",      // Clay Rose (Expense / Obligation)
  Savings: "#4D8E75",   // Soft Jade (Positive Savings Goal)
};

export const BUCKET_COLORS: Record<BudgetBucket, string> = {
  Needs: "#1C5954",   // Deep Teal
  Wants: "#879B62",   // Moss
  Savings: "#4D8E75", // Soft Jade
};

export const CHART_PALETTE = [
  "#4D8E75", // 1. Soft Jade
  "#1C5954", // 2. Deep Teal
  "#879B62", // 3. Moss
  "#C99A4B", // 4. Muted Amber
  "#B96D69", // 5. Clay Rose
] as const;

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

