import { useState, useCallback } from "react";
import { saveTaxProfile } from "../services/db";
import { getDefaultTaxProfile } from "../services/taxCalculator";
import type { TaxProfile } from "../types";

export function useTaxProfile(defaultAnnualIncome = 48000 * 12) {
  const [taxProfile, setTaxProfileState] = useState<TaxProfile>(() =>
    getDefaultTaxProfile(defaultAnnualIncome)
  );

  const setTaxProfile = useCallback(
    (value: TaxProfile | ((prev: TaxProfile) => TaxProfile)) => {
      setTaxProfileState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        saveTaxProfile(next).catch(console.error);
        return next;
      });
    },
    []
  );

  const initTaxProfile = useCallback((profile: TaxProfile) => {
    setTaxProfileState(profile);
  }, []);

  return {
    taxProfile,
    setTaxProfile,
    setTaxProfileState,
    initTaxProfile,
  };
}
