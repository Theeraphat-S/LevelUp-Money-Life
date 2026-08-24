import type {
  TaxAllowances,
  TaxAssessableIncome,
  TaxBracketDetail,
  TaxCalculationResult,
  TaxDeductionBreakdown,
  TaxOptimizationAdvice,
  TaxProfile,
} from "../types";

// ==========================================
// THAI TAX CODE CONSTANTS (PIT)
// ==========================================

export const TAX_BRACKET_CONFIGS = [
  { min: 0, max: 150000, rate: 0.00, label: "0 - 150k (0%)" },
  { min: 150000, max: 300000, rate: 0.05, label: "150k - 300k (5%)" },
  { min: 300000, max: 500000, rate: 0.10, label: "300k - 500k (10%)" },
  { min: 500000, max: 750000, rate: 0.15, label: "500k - 750k (15%)" },
  { min: 750000, max: 1000000, rate: 0.20, label: "750k - 1M (20%)" },
  { min: 1000000, max: 2000000, rate: 0.25, label: "1M - 2M (25%)" },
  { min: 2000000, max: 5000000, rate: 0.30, label: "2M - 5M (30%)" },
  { min: 5000000, max: Infinity, rate: 0.35, label: "Over 5M (35%)" },
] as const;

export const STATUTORY_EXPENSE_RATE = 0.50; // 50%
export const STATUTORY_EXPENSE_CAP = 100000; // ฿100,000 max

export const PERSONAL_ALLOWANCE = 60000;
export const SPOUSE_ALLOWANCE = 60000;
export const CHILD_ALLOWANCE_STANDARD = 30000;
export const CHILD_ALLOWANCE_2018_ONWARDS = 60000;
export const PARENT_ALLOWANCE = 30000;
export const PARENT_MAX_COUNT = 4;
export const DISABLED_ALLOWANCE = 60000;
export const ANTENATAL_DELIVERY_CAP = 60000;

export const SOCIAL_SECURITY_CAP = 9000;
export const LIFE_INSURANCE_CAP = 100000;
export const HEALTH_INSURANCE_CAP = 25000;
export const LIFE_HEALTH_COMBINED_CAP = 100000;
export const PARENTS_HEALTH_CAP = 15000;

export const RETIREMENT_GROUP_CAP = 500000;
export const RMF_INCOME_RATE_CAP = 0.30;
export const RMF_ABSOLUTE_CAP = 500000;
export const SSF_INCOME_RATE_CAP = 0.30;
export const SSF_ABSOLUTE_CAP = 200000;
export const PVD_INCOME_RATE_CAP = 0.15;
export const PVD_ABSOLUTE_CAP = 500000;
export const ANNUITY_INCOME_RATE_CAP = 0.15;
export const ANNUITY_ABSOLUTE_CAP = 200000;
export const NSF_ABSOLUTE_CAP = 30000;

export const THAI_ESG_INCOME_RATE_CAP = 0.30;
export const THAI_ESG_ABSOLUTE_CAP = 300000; // INDEPENDENT POOL

export const HOME_LOAN_INTEREST_CAP = 100000;
export const DONATION_CEILING_RATE = 0.10; // 10% of Net Income before donations
export const POLITICAL_DONATION_CAP = 10000;

export const AMT_INCOME_THRESHOLD = 120000; // Section 48(2) threshold
export const AMT_RATE = 0.005;              // 0.5%
export const AMT_EXEMPTION_THRESHOLD = 5000;// Exempt if <= ฿5,000

/**
 * Returns a clean, sensible default TaxProfile
 */
export function getDefaultTaxProfile(annualSalary: number = 576000): TaxProfile {
  return {
    taxYear: new Date().getFullYear(),
    income: {
      salary40_1: annualSalary,
      bonus40_1: 0,
      freelance40_2: 0,
      other40_2: 0,
    },
    allowances: {
      hasSpouseNoIncome: false,
      childrenCount: 0,
      children2018OnwardsCount: 0,
      parentsCount: 0,
      disabledDependentsCount: 0,
      antenatalAndDeliveryCost: 0,
      socialSecurity: 9000,
      lifeInsurance: 0,
      healthInsurance: 0,
      parentsHealthInsurance: 0,
      rmf: 0,
      ssf: 0,
      pvdOrGpf: 0,
      annuityInsurance: 0,
      nsf: 0,
      thaiESG: 0,
      homeLoanInterest: 0,
      educationAndHospitalDonations: 0,
      generalDonations: 0,
      politicalPartyDonations: 0,
    },
    withholdingTax: 0,
  };
}

/**
 * Calculates Thai Personal Income Tax (PIT) under Revenue Department Code
 */
export function calculateThaiTax(profile: TaxProfile): TaxCalculationResult {
  const { income, allowances, withholdingTax = 0 } = profile;

  // 1. Assessable Income
  const totalIncome40_1 = Math.max(0, (income.salary40_1 || 0) + (income.bonus40_1 || 0));
  const totalIncome40_2 = Math.max(0, (income.freelance40_2 || 0) + (income.other40_2 || 0));
  const grossAssessableIncome = totalIncome40_1 + totalIncome40_2;

  // 2. Standard Statutory Expense Deduction (50% max 100,000 THB for 40(1) + 40(2))
  const statutoryExpense = Math.min(grossAssessableIncome * STATUTORY_EXPENSE_RATE, STATUTORY_EXPENSE_CAP);
  const incomeAfterExpenses = Math.max(0, grossAssessableIncome - statutoryExpense);

  // 3. Allowances Calculation
  // 3.1 Personal & Family
  const personalSelf = PERSONAL_ALLOWANCE;
  const spouse = allowances.hasSpouseNoIncome ? SPOUSE_ALLOWANCE : 0;
  const childrenStd = Math.max(0, allowances.childrenCount || 0) * CHILD_ALLOWANCE_STANDARD;
  const children2018 = Math.max(0, allowances.children2018OnwardsCount || 0) * CHILD_ALLOWANCE_2018_ONWARDS;
  const parents = Math.min(PARENT_MAX_COUNT, Math.max(0, allowances.parentsCount || 0)) * PARENT_ALLOWANCE;
  const disabled = Math.max(0, allowances.disabledDependentsCount || 0) * DISABLED_ALLOWANCE;
  const antenatal = Math.min(ANTENATAL_DELIVERY_CAP, Math.max(0, allowances.antenatalAndDeliveryCost || 0));

  const totalPersonalFamily = personalSelf + spouse + childrenStd + children2018 + parents + disabled + antenatal;

  // 3.2 Insurance & Social Security
  const socialSecurityDeduct = Math.min(SOCIAL_SECURITY_CAP, Math.max(0, allowances.socialSecurity || 0));
  const healthDeductRaw = Math.min(HEALTH_INSURANCE_CAP, Math.max(0, allowances.healthInsurance || 0));
  const lifeDeductRaw = Math.min(LIFE_INSURANCE_CAP, Math.max(0, allowances.lifeInsurance || 0));
  // Combined Life + Health <= 100,000 THB
  const lifeAndHealthCombined = Math.min(LIFE_HEALTH_COMBINED_CAP, lifeDeductRaw + healthDeductRaw);
  const parentsHealthDeduct = Math.min(PARENTS_HEALTH_CAP, Math.max(0, allowances.parentsHealthInsurance || 0));

  const totalInsuranceSocialSecurity = socialSecurityDeduct + lifeAndHealthCombined + parentsHealthDeduct;

  // 3.3 Retirement Savings Group (Combined 500,000 THB cap)
  const rmfCap = Math.min(grossAssessableIncome * RMF_INCOME_RATE_CAP, RMF_ABSOLUTE_CAP);
  const rmfDeductRaw = Math.min(rmfCap, Math.max(0, allowances.rmf || 0));

  const ssfCap = Math.min(grossAssessableIncome * SSF_INCOME_RATE_CAP, SSF_ABSOLUTE_CAP);
  const ssfDeductRaw = Math.min(ssfCap, Math.max(0, allowances.ssf || 0));

  const pvdCap = Math.min(grossAssessableIncome * PVD_INCOME_RATE_CAP, PVD_ABSOLUTE_CAP);
  const pvdDeductRaw = Math.min(pvdCap, Math.max(0, allowances.pvdOrGpf || 0));

  const annuityCap = Math.min(grossAssessableIncome * ANNUITY_INCOME_RATE_CAP, ANNUITY_ABSOLUTE_CAP);
  const annuityDeductRaw = Math.min(annuityCap, Math.max(0, allowances.annuityInsurance || 0));

  const nsfDeductRaw = Math.min(NSF_ABSOLUTE_CAP, Math.max(0, allowances.nsf || 0));

  const retirementSumRaw = rmfDeductRaw + ssfDeductRaw + pvdDeductRaw + annuityDeductRaw + nsfDeductRaw;
  const totalRetirementGroup = Math.min(RETIREMENT_GROUP_CAP, retirementSumRaw);

  // 3.4 ThaiESG Fund (Independent Pool outside 500k retirement cap)
  const thaiESGCap = Math.min(grossAssessableIncome * THAI_ESG_INCOME_RATE_CAP, THAI_ESG_ABSOLUTE_CAP);
  const totalThaiESG = Math.min(thaiESGCap, Math.max(0, allowances.thaiESG || 0));

  // 3.5 Property & Real Estate
  const totalProperty = Math.min(HOME_LOAN_INTEREST_CAP, Math.max(0, allowances.homeLoanInterest || 0));

  // Intermediate: Net Income Before Donations
  const preDonationDeductions =
    totalPersonalFamily +
    totalInsuranceSocialSecurity +
    totalRetirementGroup +
    totalThaiESG +
    totalProperty;

  const netIncomeBeforeDonations = Math.max(0, incomeAfterExpenses - preDonationDeductions);

  // 3.6 Donations (Max 10% of Net Income before donations)
  const donationCeiling = netIncomeBeforeDonations * DONATION_CEILING_RATE;
  const eduHospDeductRaw = Math.max(0, allowances.educationAndHospitalDonations || 0) * 2; // 2x multiplier
  const generalDeductRaw = Math.max(0, allowances.generalDonations || 0);                  // 1x multiplier
  const rawDonationsEligible = eduHospDeductRaw + generalDeductRaw;
  const donationsDeductible = Math.min(donationCeiling, rawDonationsEligible);

  const politicalPartyDeduct = Math.min(POLITICAL_DONATION_CAP, Math.max(0, allowances.politicalPartyDonations || 0));

  const totalDeductionsAndAllowances =
    statutoryExpense +
    preDonationDeductions +
    donationsDeductible +
    politicalPartyDeduct;

  // 4. Net Taxable Income
  const netTaxableIncome = Math.max(0, netIncomeBeforeDonations - donationsDeductible - politicalPartyDeduct);

  // 5. Progressive Tax Calculation across 8 Brackets
  let progressiveTax = 0;
  let highestMarginalRate = 0;

  const brackets: TaxBracketDetail[] = TAX_BRACKET_CONFIGS.map((cfg, idx) => {
    let taxableInBracket = 0;
    const bracketSpan = cfg.max === Infinity ? Infinity : cfg.max - cfg.min;

    if (netTaxableIncome > cfg.min) {
      if (cfg.max === Infinity) {
        taxableInBracket = netTaxableIncome - cfg.min;
      } else {
        taxableInBracket = Math.min(netTaxableIncome, cfg.max) - cfg.min;
      }
    }

    const taxInBracket = Math.round(taxableInBracket * cfg.rate);
    const maxTaxInBracket = bracketSpan === Infinity ? 0 : Math.round(bracketSpan * cfg.rate);
    progressiveTax += taxInBracket;

    if (taxableInBracket > 0 && cfg.rate > highestMarginalRate) {
      highestMarginalRate = cfg.rate;
    }

    return {
      bracketIndex: idx + 1,
      minIncome: cfg.min,
      maxIncome: cfg.max,
      rate: cfg.rate,
      ratePercent: Math.round(cfg.rate * 100),
      taxableInBracket,
      taxInBracket,
      maxTaxInBracket,
      isCurrentMarginal: false,
    };
  });

  // Mark the highest active marginal bracket
  let markedMarginal = false;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (!markedMarginal && (brackets[i].taxableInBracket > 0 || (i === 0 && netTaxableIncome <= 150000))) {
      brackets[i].isCurrentMarginal = true;
      highestMarginalRate = brackets[i].rate;
      markedMarginal = true;
    }
  }

  // 6. Section 48(2) Alternative Minimum Tax (AMT)
  const isAmtApplicable = totalIncome40_2 >= AMT_INCOME_THRESHOLD;
  const rawAmtTax = isAmtApplicable ? Math.round(totalIncome40_2 * AMT_RATE) : 0;
  const amtTax = rawAmtTax > AMT_EXEMPTION_THRESHOLD ? rawAmtTax : 0;

  const taxBeforeWithholding = Math.max(progressiveTax, amtTax);
  const netTaxPayable = taxBeforeWithholding - (withholdingTax || 0);
  const taxRefund = netTaxPayable < 0 ? Math.abs(netTaxPayable) : 0;
  const additionalTaxPayable = netTaxPayable > 0 ? netTaxPayable : 0;

  const effectiveTaxRate = grossAssessableIncome > 0
    ? parseFloat(((taxBeforeWithholding / grossAssessableIncome) * 100).toFixed(2))
    : 0;

  const deductionBreakdown: TaxDeductionBreakdown = {
    statutoryExpense,
    personalAndFamily: totalPersonalFamily,
    insuranceAndSocialSecurity: totalInsuranceSocialSecurity,
    retirementGroup: totalRetirementGroup,
    retirementGroupCapUsed: retirementSumRaw,
    retirementGroupCapMax: RETIREMENT_GROUP_CAP,
    thaiESG: totalThaiESG,
    thaiESGCapMax: thaiESGCap,
    property: totalProperty,
    netIncomeBeforeDonations,
    donationsDeductible,
    donationCeiling,
    totalDeductionsAndAllowances,
  };

  // 7. Optimization Recommendations
  const advice = generateTaxOptimizationAdvice(profile, {
    grossAssessableIncome,
    marginalTaxRate: highestMarginalRate,
    netTaxableIncome,
    netIncomeBeforeDonations,
    retirementSumRaw,
  });

  return {
    grossAssessableIncome,
    totalIncome40_1,
    totalIncome40_2,
    statutoryExpense,
    incomeAfterExpenses,
    deductions: deductionBreakdown,
    netTaxableIncome,
    brackets,
    progressiveTax,
    isAmtApplicable: isAmtApplicable && amtTax > 0,
    amtTax,
    taxBeforeWithholding,
    withholdingTax,
    netTaxPayable,
    taxRefund,
    additionalTaxPayable,
    marginalTaxRate: highestMarginalRate,
    effectiveTaxRate,
    advice,
  };
}

/**
 * Computes headroom and exact marginal tax savings for each investment/deduction avenue
 */
function generateTaxOptimizationAdvice(
  profile: TaxProfile,
  context: {
    grossAssessableIncome: number;
    marginalTaxRate: number;
    netTaxableIncome: number;
    netIncomeBeforeDonations: number;
    retirementSumRaw: number;
  }
): TaxOptimizationAdvice[] {
  const { grossAssessableIncome, marginalTaxRate, netIncomeBeforeDonations, retirementSumRaw } = context;
  const { allowances } = profile;
  const adviceList: TaxOptimizationAdvice[] = [];

  const rate = marginalTaxRate > 0 ? marginalTaxRate : 0.05; // Base 5% projection if in 0% bracket

  // 1. ThaiESG (Independent 300,000 THB Pool)
  const thaiESGCap = Math.min(grossAssessableIncome * THAI_ESG_INCOME_RATE_CAP, THAI_ESG_ABSOLUTE_CAP);
  const thaiESGUsed = allowances.thaiESG || 0;
  const thaiESGHeadroom = Math.max(0, thaiESGCap - thaiESGUsed);

  if (thaiESGHeadroom >= 1000) {
    adviceList.push({
      id: "thai_esg",
      category: "thaiESG",
      titleKey: "tax.advisor.thaiEsgTitle",
      descKey: "tax.advisor.thaiEsgDesc",
      recommendedAmount: thaiESGHeadroom,
      estimatedTaxSavings: Math.round(thaiESGHeadroom * rate),
      roiPercent: Math.round(rate * 100),
      priority: "high",
      currentUsed: thaiESGUsed,
      maxHeadroom: thaiESGCap,
    });
  }

  // 2. RMF / SSF (Retirement Group Cap = 500k)
  const retirementPoolRemaining = Math.max(0, RETIREMENT_GROUP_CAP - retirementSumRaw);
  const rmfCap = Math.min(grossAssessableIncome * RMF_INCOME_RATE_CAP, RMF_ABSOLUTE_CAP);
  const rmfUsed = allowances.rmf || 0;
  const rmfHeadroom = Math.min(Math.max(0, rmfCap - rmfUsed), retirementPoolRemaining);

  if (rmfHeadroom >= 1000) {
    adviceList.push({
      id: "rmf",
      category: "rmf",
      titleKey: "tax.advisor.rmfTitle",
      descKey: "tax.advisor.rmfDesc",
      recommendedAmount: rmfHeadroom,
      estimatedTaxSavings: Math.round(rmfHeadroom * rate),
      roiPercent: Math.round(rate * 100),
      priority: "high",
      currentUsed: rmfUsed,
      maxHeadroom: rmfCap,
    });
  }

  const ssfCap = Math.min(grossAssessableIncome * SSF_INCOME_RATE_CAP, SSF_ABSOLUTE_CAP);
  const ssfUsed = allowances.ssf || 0;
  const ssfHeadroom = Math.min(Math.max(0, ssfCap - ssfUsed), retirementPoolRemaining);

  if (ssfHeadroom >= 1000) {
    adviceList.push({
      id: "ssf",
      category: "ssf",
      titleKey: "tax.advisor.ssfTitle",
      descKey: "tax.advisor.ssfDesc",
      recommendedAmount: ssfHeadroom,
      estimatedTaxSavings: Math.round(ssfHeadroom * rate),
      roiPercent: Math.round(rate * 100),
      priority: "medium",
      currentUsed: ssfUsed,
      maxHeadroom: ssfCap,
    });
  }

  // 3. Life & Health Insurance (100k combined cap)
  const currentLife = Math.min(LIFE_INSURANCE_CAP, allowances.lifeInsurance || 0);
  const currentHealth = Math.min(HEALTH_INSURANCE_CAP, allowances.healthInsurance || 0);
  const currentLifeHealthCombined = currentLife + currentHealth;
  const insuranceHeadroom = Math.max(0, LIFE_HEALTH_COMBINED_CAP - currentLifeHealthCombined);

  if (insuranceHeadroom >= 1000) {
    adviceList.push({
      id: "insurance",
      category: "insurance",
      titleKey: "tax.advisor.insuranceTitle",
      descKey: "tax.advisor.insuranceDesc",
      recommendedAmount: insuranceHeadroom,
      estimatedTaxSavings: Math.round(insuranceHeadroom * rate),
      roiPercent: Math.round(rate * 100),
      priority: "medium",
      currentUsed: currentLifeHealthCombined,
      maxHeadroom: LIFE_HEALTH_COMBINED_CAP,
    });
  }

  // 4. Double Deduction Donations (2x Multiplier)
  const donationCeiling = netIncomeBeforeDonations * DONATION_CEILING_RATE;
  const currentDonationsDeductible =
    Math.min(donationCeiling, (allowances.educationAndHospitalDonations || 0) * 2 + (allowances.generalDonations || 0));
  const donationRemainingCeiling = Math.max(0, donationCeiling - currentDonationsDeductible);
  const donationCashRecommended = Math.round(donationRemainingCeiling / 2);

  if (donationCashRecommended >= 500) {
    adviceList.push({
      id: "donation_2x",
      category: "donation",
      titleKey: "tax.advisor.donation2xTitle",
      descKey: "tax.advisor.donation2xDesc",
      recommendedAmount: donationCashRecommended,
      estimatedTaxSavings: Math.round(donationRemainingCeiling * rate),
      roiPercent: Math.round(rate * 200), // 2x return multiplier on tax saved per baht
      priority: "low",
      currentUsed: allowances.educationAndHospitalDonations || 0,
      maxHeadroom: Math.round(donationCeiling / 2),
    });
  }

  return adviceList;
}
