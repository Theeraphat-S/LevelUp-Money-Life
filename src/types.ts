export type TransactionCategory = "Income" | "Food" | "Transport" | "Home" | "Health" | "Learning" | "Fun" | "Debt" | "Savings";

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Income: "oklch(60% 0.15 150)", // Emerald
  Food: "oklch(62% 0.14 30)",    // Warm Coral / Orange
  Transport: "oklch(60% 0.13 240)", // Azure Blue
  Home: "oklch(58% 0.12 280)",   // Indigo / Purple
  Health: "oklch(62% 0.15 350)",  // Rose / Pink
  Learning: "oklch(65% 0.14 190)", // Teal / Cyan
  Fun: "oklch(68% 0.15 70)",     // Amber / Gold
  Debt: "oklch(55% 0.16 20)",    // Deep Red/Terracotta
  Savings: "oklch(68% 0.15 165)", // Bright Emerald Green
};

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: TransactionCategory;
  cleared: boolean;
};

export type Allocation = {
  id: string;
  label: string;
  percent: number;
  color: string;
};

export type Quest = {
  id: string;
  title: string;
  date: string;
  xp: number;
  done: boolean;
};

