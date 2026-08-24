import { describe, it, expect } from "vitest";
import {
  calculateThaiTax,
  getDefaultTaxProfile,
  PERSONAL_ALLOWANCE,
  SPOUSE_ALLOWANCE,
  RETIREMENT_GROUP_CAP,
  THAI_ESG_ABSOLUTE_CAP,
  LIFE_HEALTH_COMBINED_CAP,
} from "./taxCalculator";
import type { TaxProfile } from "../types";

describe("Thai Personal Income Tax (PIT) Engine", () => {
  // Test 1: Low Income Tax Exemption (0% Tier)
  it("Scenario 1: Income <= 150,000 THB results in zero tax", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 150000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: getDefaultTaxProfile().allowances,
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    expect(res.grossAssessableIncome).toBe(150000);
    expect(res.statutoryExpense).toBe(75000); // 50%
    expect(res.netTaxableIncome).toBe(150000 - 75000 - PERSONAL_ALLOWANCE - 9000); // 6,000
    expect(res.taxBeforeWithholding).toBe(0);
    expect(res.netTaxPayable).toBe(0);
  });

  // Test 2: Standard Statutory Expense Cap (50% max 100,000 THB)
  it("Scenario 2: Enforces 50% max 100,000 THB expense deduction on high income", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 600000, bonus40_1: 100000, freelance40_2: 200000, other40_2: 0 },
      allowances: getDefaultTaxProfile().allowances,
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    expect(res.grossAssessableIncome).toBe(900000);
    expect(res.statutoryExpense).toBe(100000); // Capped at 100,000
    expect(res.incomeAfterExpenses).toBe(800000);
  });

  // Test 3: Progressive Tax Brackets 5% Tier
  it("Scenario 3: Calculates Tier 2 (5%) tax correctly", () => {
    // Target net taxable income = 250,000 (150,000 @ 0% + 100,000 @ 5% = 5,000 THB tax)
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 419000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: {
        ...getDefaultTaxProfile().allowances,
        socialSecurity: 9000,
      },
      withholdingTax: 0,
    };
    // Expenses = 100,000. Deductions = 60,000 + 9,000 = 69,000. Net = 419,000 - 169,000 = 250,000.
    const res = calculateThaiTax(profile);
    expect(res.netTaxableIncome).toBe(250000);
    expect(res.progressiveTax).toBe(5000);
    expect(res.taxBeforeWithholding).toBe(5000);
  });

  // Test 4: Progressive Tax Brackets 10% Tier
  it("Scenario 4: Calculates Tier 3 (10%) tax correctly", () => {
    // Net taxable income = 400,000 (150k @ 0% + 150k @ 5% [7,500] + 100k @ 10% [10,000] = 17,500 THB)
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 569000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: { ...getDefaultTaxProfile().allowances, socialSecurity: 9000 },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    expect(res.netTaxableIncome).toBe(400000);
    expect(res.progressiveTax).toBe(17500);
  });

  // Test 5: Progressive Tax Brackets 15% & 20% Tiers
  it("Scenario 5: Calculates Tier 4 (15%) and Tier 5 (20%) tax correctly", () => {
    // Net taxable income = 800,000:
    // 0-150k: 0
    // 150k-300k (150k @ 5%): 7,500
    // 300k-500k (200k @ 10%): 20,000
    // 500k-750k (250k @ 15%): 37,500
    // 750k-800k (50k @ 20%): 10,000
    // Total = 75,000 THB
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 969000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: { ...getDefaultTaxProfile().allowances, socialSecurity: 9000 },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    expect(res.netTaxableIncome).toBe(800000);
    expect(res.progressiveTax).toBe(75000);
    expect(res.marginalTaxRate).toBe(0.20);
  });

  // Test 6: Higher Brackets (25%, 30%, 35%)
  it("Scenario 6: Calculates Tier 6 (25%), Tier 7 (30%), and Tier 8 (35%) correctly", () => {
    // Net taxable income = 6,000,000:
    // Up to 5M = 1,265,000 THB.
    // 5M to 6M (1M @ 35%) = 350,000 THB.
    // Total = 1,615,000 THB.
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 6169000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: { ...getDefaultTaxProfile().allowances, socialSecurity: 9000 },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    expect(res.netTaxableIncome).toBe(6000000);
    expect(res.progressiveTax).toBe(1615000);
    expect(res.marginalTaxRate).toBe(0.35);
  });

  // Test 7: Family Allowances (Spouse, Children, Parents, Disabled, Antenatal)
  it("Scenario 7: Accurately calculates full family allowances with statutory caps", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 1200000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: {
        ...getDefaultTaxProfile().allowances,
        hasSpouseNoIncome: true, // 60k
        childrenCount: 1, // 30k
        children2018OnwardsCount: 2, // 2 * 60k = 120k
        parentsCount: 4, // 4 * 30k = 120k (max 4)
        disabledDependentsCount: 1, // 60k
        antenatalAndDeliveryCost: 50000, // 50k
        socialSecurity: 9000,
      },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    // Personal (60k) + Spouse (60k) + Child1 (30k) + Child2018 (120k) + Parents (120k) + Disabled (60k) + Antenatal (50k) = 500,000
    expect(res.deductions.personalAndFamily).toBe(500000);
  });

  // Test 8: Life and Health Insurance Umbrella Cap (100,000 THB)
  it("Scenario 8: Enforces 100k Life+Health combined cap and 25k Health sub-cap", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 800000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: {
        ...getDefaultTaxProfile().allowances,
        lifeInsurance: 90000,
        healthInsurance: 30000, // Health sub-cap is 25k -> 90k + 25k = 115k -> clamped to 100k
        parentsHealthInsurance: 15000, // 15k
        socialSecurity: 9000,
      },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    // Insurance total = SSO (9k) + LifeHealth (100k) + ParentHealth (15k) = 124,000
    expect(res.deductions.insuranceAndSocialSecurity).toBe(124000);
  });

  // Test 9: Retirement Group 500,000 THB Collective Cap
  it("Scenario 9: Enforces 500k collective ceiling across RMF, SSF, PVD, NSF, and Annuity", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 2000000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: {
        ...getDefaultTaxProfile().allowances,
        rmf: 300000,
        ssf: 200000,
        pvdOrGpf: 200000,
        annuityInsurance: 100000,
        nsf: 10000,
        socialSecurity: 9000,
      },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    // Raw sum = 300k + 200k + 200k + 100k + 10k = 810,000 THB
    expect(res.deductions.retirementGroupCapUsed).toBe(810000);
    expect(res.deductions.retirementGroup).toBe(RETIREMENT_GROUP_CAP); // 500,000 max
  });

  // Test 10: ThaiESG Independence (300,000 THB Outside Retirement Cap)
  it("Scenario 10: Verifies ThaiESG is independent from the 500k retirement cap", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 2000000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: {
        ...getDefaultTaxProfile().allowances,
        rmf: 500000, // Hits 500k retirement cap
        thaiESG: 300000, // Independent 300k pool
        socialSecurity: 9000,
      },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    expect(res.deductions.retirementGroup).toBe(500000);
    expect(res.deductions.thaiESG).toBe(THAI_ESG_ABSOLUTE_CAP); // 300,000
    // Total combined retirement + ThaiESG = 800,000 THB
    expect(res.deductions.retirementGroup + res.deductions.thaiESG).toBe(800000);
  });

  // Test 11: Home Mortgage Interest Cap (100,000 THB)
  it("Scenario 11: Caps home loan mortgage interest at 100,000 THB", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 600000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: {
        ...getDefaultTaxProfile().allowances,
        homeLoanInterest: 140000,
        socialSecurity: 9000,
      },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    expect(res.deductions.property).toBe(100000);
  });

  // Test 12: 2x Education/Hospital Donations and 10% Net Income Ceiling
  it("Scenario 12: Applies 2x multiplier to education/hospital donations up to 10% ceiling", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 1000000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: {
        ...getDefaultTaxProfile().allowances,
        socialSecurity: 9000,
        educationAndHospitalDonations: 30000, // 2x = 60,000 THB eligible
      },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    // Net before donation = 1M - 100k - 60k - 9k = 831,000. Ceiling 10% = 83,100.
    // 60,000 <= 83,100 -> full 60,000 is deducted.
    expect(res.deductions.donationsDeductible).toBe(60000);
    expect(res.netTaxableIncome).toBe(831000 - 60000);
  });

  // Test 13: Withholding Tax Offset resulting in Tax Refund
  it("Scenario 13: Correctly calculates tax refund when withholding tax exceeds tax liability", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 600000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: { ...getDefaultTaxProfile().allowances, socialSecurity: 9000 },
      withholdingTax: 35000, // WHT deducted during the year
    };
    const res = calculateThaiTax(profile);
    // Taxable = 600k - 100k - 69k = 431,000 -> Tax = 7.5k + (131k * 10%) = 20,600 THB.
    expect(res.taxBeforeWithholding).toBe(20600);
    expect(res.withholdingTax).toBe(35000);
    expect(res.netTaxPayable).toBe(-14400); // Negative = refund
    expect(res.taxRefund).toBe(14400);
    expect(res.additionalTaxPayable).toBe(0);
  });

  // Test 14: Withholding Tax Offset resulting in Additional Tax Payable
  it("Scenario 14: Correctly calculates additional tax payable when liability exceeds WHT", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 600000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: { ...getDefaultTaxProfile().allowances, socialSecurity: 9000 },
      withholdingTax: 10000,
    };
    const res = calculateThaiTax(profile);
    expect(res.taxBeforeWithholding).toBe(20600);
    expect(res.netTaxPayable).toBe(10600);
    expect(res.taxRefund).toBe(0);
    expect(res.additionalTaxPayable).toBe(10600);
  });

  // Test 15: Section 48(2) Alternative Minimum Tax (AMT) Trigger
  it("Scenario 15: Assesses Section 48(2) AMT when non-40(1) income is high and prog tax is lower", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 0, bonus40_1: 0, freelance40_2: 2500000, other40_2: 0 },
      allowances: {
        ...getDefaultTaxProfile().allowances,
        rmf: 500000,
        thaiESG: 300000,
        lifeInsurance: 100000,
        homeLoanInterest: 100000,
        educationAndHospitalDonations: 100000,
        socialSecurity: 9000,
      },
      withholdingTax: 0,
    };
    // Non-40(1) income = 2,500,000 >= 120,000. AMT = 2,500,000 * 0.5% = 12,500 THB (> 5,000).
    const res = calculateThaiTax(profile);
    expect(res.amtTax).toBe(12500);
    expect(res.taxBeforeWithholding).toBeGreaterThanOrEqual(12500);
  });

  // Test 16: Tax Optimization Advisor Suggestions
  it("Scenario 16: Generates actionable optimization suggestions with positive ROI", () => {
    const profile: TaxProfile = {
      taxYear: 2026,
      income: { salary40_1: 800000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
      allowances: { ...getDefaultTaxProfile().allowances, socialSecurity: 9000 },
      withholdingTax: 0,
    };
    const res = calculateThaiTax(profile);
    expect(res.advice.length).toBeGreaterThan(0);
    const thaiEsgAdvice = res.advice.find((a) => a.category === "thaiESG");
    expect(thaiEsgAdvice).toBeDefined();
    expect(thaiEsgAdvice?.recommendedAmount).toBe(Math.min(800000 * 0.3, 300000)); // 240,000
    expect(thaiEsgAdvice?.estimatedTaxSavings).toBeGreaterThan(0);
  });

  // Test 17: Exact Bracket Boundary Transitions
  it("Scenario 17: Validates boundary values at bracket thresholds", () => {
    const boundaries = [150000, 300000, 500000, 750000, 1000000, 2000000, 5000000];
    boundaries.forEach((thresh) => {
      const profile: TaxProfile = {
        taxYear: 2026,
        income: { salary40_1: thresh + 169000, bonus40_1: 0, freelance40_2: 0, other40_2: 0 },
        allowances: { ...getDefaultTaxProfile().allowances, socialSecurity: 9000 },
        withholdingTax: 0,
      };
      const res = calculateThaiTax(profile);
      expect(res.netTaxableIncome).toBe(thresh);
    });
  });
});
