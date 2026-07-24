export type TransactionCategory = "Income" | "Food" | "Transport" | "Home" | "Health" | "Learning" | "Fun" | "Debt" | "Savings";

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
