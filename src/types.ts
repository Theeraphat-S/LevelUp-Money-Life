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

export type ViewTab = "dashboard" | "ledger" | "budget" | "tax" | "analytics" | "quests";

export type SortField = "date" | "amount" | "name" | "category";
export type SortOrder = "asc" | "desc";

export type ThemeMode = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

// ==========================================
// THAI PERSONAL INCOME TAX (PIT) TYPES
// ==========================================

export type TaxAssessableIncome = {
  salary40_1: number;         // Monthly salary * 12
  bonus40_1: number;          // Annual bonus / irregular wage
  freelance40_2: number;      // Freelance / service contract income
  other40_2: number;          // Commission / other 40(2)
};

export type TaxAllowances = {
  // 1. Personal & Family
  hasSpouseNoIncome: boolean;
  childrenCount: number;             // Born before 2018 or 1st child (30k/child)
  children2018OnwardsCount: number;  // 2nd+ child born in 2018+ (60k/child)
  parentsCount: number;              // Age >= 60, income <= 30k (30k/parent, max 4 = 120k)
  disabledDependentsCount: number;   // 60k/person
  antenatalAndDeliveryCost: number;  // Max 60k

  // 2. Insurance & Social Security
  socialSecurity: number;            // Max 9,000
  lifeInsurance: number;             // Max 100,000 (combined with health <= 100,000)
  healthInsurance: number;           // Max 25,000
  parentsHealthInsurance: number;    // Max 15,000

  // 3. Retirement Savings Group (Combined 500,000 THB ceiling)
  rmf: number;                       // Max 30% assessable income, <= 500k
  ssf: number;                       // Max 30% assessable income, <= 200k
  pvdOrGpf: number;                  // Provident / GPF Fund, max 15% wage, <= 500k
  annuityInsurance: number;          // Max 15% assessable income, <= 200k
  nsf: number;                       // National Savings Fund (กอช.), max 30k

  // 4. ThaiESG Fund (Independent 300,000 THB Pool)
  thaiESG: number;                   // Max 30% assessable income, <= 300k

  // 5. Property & Real Estate
  homeLoanInterest: number;          // Max 100,000

  // 6. Donations
  educationAndHospitalDonations: number; // 2x multiplier (200% deduction)
  generalDonations: number;              // 1x multiplier (100% deduction)
  politicalPartyDonations: number;       // Max 10,000
};

export type TaxProfile = {
  taxYear: number;
  income: TaxAssessableIncome;
  allowances: TaxAllowances;
  withholdingTax: number;     // ภาษีหัก ณ ที่จ่าย ที่ถูกหักไว้แล้ว
};

export type TaxBracketDetail = {
  bracketIndex: number;
  minIncome: number;
  maxIncome: number;
  rate: number;               // 0 to 0.35
  ratePercent: number;        // 0 to 35
  taxableInBracket: number;
  taxInBracket: number;
  maxTaxInBracket: number;
  isCurrentMarginal: boolean;
};

export type TaxDeductionBreakdown = {
  statutoryExpense: number;
  personalAndFamily: number;
  insuranceAndSocialSecurity: number;
  retirementGroup: number;
  retirementGroupCapUsed: number;
  retirementGroupCapMax: number;
  thaiESG: number;
  thaiESGCapMax: number;
  property: number;
  netIncomeBeforeDonations: number;
  donationsDeductible: number;
  donationCeiling: number;
  totalDeductionsAndAllowances: number;
};

export type TaxOptimizationAdvice = {
  id: string;
  category: "thaiESG" | "rmf" | "ssf" | "annuity" | "insurance" | "homeLoan" | "donation";
  titleKey: string;
  descKey: string;
  recommendedAmount: number;
  estimatedTaxSavings: number;
  roiPercent: number;
  priority: "high" | "medium" | "low";
  currentUsed: number;
  maxHeadroom: number;
};

export type TaxCalculationResult = {
  grossAssessableIncome: number;
  totalIncome40_1: number;
  totalIncome40_2: number;
  statutoryExpense: number;
  incomeAfterExpenses: number;
  deductions: TaxDeductionBreakdown;
  netTaxableIncome: number;
  brackets: TaxBracketDetail[];
  progressiveTax: number;
  isAmtApplicable: boolean;
  amtTax: number;
  taxBeforeWithholding: number;
  withholdingTax: number;
  netTaxPayable: number;      // > 0 = Pay more, < 0 = Refund
  taxRefund: number;
  additionalTaxPayable: number;
  marginalTaxRate: number;    // 0 to 0.35
  effectiveTaxRate: number;   // 0 to 100 %
  advice: TaxOptimizationAdvice[];
};
