import type { Allocation, Quest, Transaction } from "../types";
import { getLocalTodayISO } from "../utils/safeToSpend";

export const getInitialDates = () => {
  const today = getLocalTodayISO();
  const currentMonthISO = today.slice(0, 7);
  return { today, currentMonthISO };
};

const { today, currentMonthISO } = getInitialDates();

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: "t1", name: "Monthly Salary", amount: 48000, date: `${currentMonthISO}-01`, category: "Income", cleared: true, notes: "Direct bank deposit" },
  { id: "t2", name: "Condo Rent & Maintenance", amount: -12500, date: `${currentMonthISO}-02`, category: "Home", cleared: true, notes: "Auto-debit" },
  { id: "t3", name: "Groceries — Tops Market", amount: -1420, date: `${currentMonthISO}-04`, category: "Food", cleared: true, notes: "Weekly pantry restock" },
  { id: "t4", name: "BTS Rabbit Card Top-up", amount: -500, date: `${currentMonthISO}-05`, category: "Transport", cleared: true },
  { id: "t5", name: "Data Science Specialization", amount: -1200, date: `${currentMonthISO}-07`, category: "Learning", cleared: true, notes: "Online certificate" },
  { id: "t6", name: "Dinner & Cafe — Thonglor", amount: -680, date: `${currentMonthISO}-09`, category: "Fun", cleared: false },
  { id: "t7", name: "Emergency Fund Allocation", amount: -5000, date: `${currentMonthISO}-10`, category: "Savings", cleared: true, notes: "High yield savings" },
  { id: "t8", name: "Fitness Membership", amount: -1500, date: `${currentMonthISO}-12`, category: "Health", cleared: true },
];

export const SAMPLE_ALLOCATIONS: Allocation[] = [
  { id: "needs", label: "Needs", percent: 50, color: "oklch(58% 0.13 165)" },
  { id: "wants", label: "Wants", percent: 30, color: "oklch(62% 0.11 230)" },
  { id: "savings", label: "Savings", percent: 20, color: "oklch(70% 0.13 80)" },
];

export const SAMPLE_QUESTS: Quest[] = [
  { id: "q1", title: "Log every daily expense today", date: today, xp: 15, done: false },
  { id: "q2", title: "Review monthly 50/30/20 budget allocations", date: today, xp: 20, done: true },
  { id: "q3", title: "Transfer 500 THB to emergency savings", date: today, xp: 25, done: false },
];
