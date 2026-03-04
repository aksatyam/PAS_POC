import { PolicyType, PremiumCalculation } from '../models';

const BASE_RATES: Record<PolicyType, number> = {
  'Mortgage Guarantee': 0.035,
  'Credit Protection': 0.025,
  'Coverage Plus': 0.045,
};

const RISK_MULTIPLIERS: Record<string, number> = {
  Low: 0.8,
  Medium: 1.0,
  High: 1.4,
};

const TYPE_MULTIPLIERS: Record<PolicyType, number> = {
  'Mortgage Guarantee': 1.0,
  'Credit Protection': 0.9,
  'Coverage Plus': 1.15,
};

export function calculatePremium(
  coverageAmount: number,
  policyType: PolicyType,
  riskCategory: 'Low' | 'Medium' | 'High',
  ltvRatio?: number,
  creditScore?: number
): PremiumCalculation {
  const baseRate = BASE_RATES[policyType];
  const riskMultiplier = RISK_MULTIPLIERS[riskCategory];
  const typeMultiplier = TYPE_MULTIPLIERS[policyType];

  let coverageMultiplier = 1.0;
  if (coverageAmount > 5000000) coverageMultiplier = 0.92;
  else if (coverageAmount > 2000000) coverageMultiplier = 0.95;
  else if (coverageAmount > 1000000) coverageMultiplier = 0.97;

  let ltvAdjustment = 1.0;
  if (ltvRatio !== undefined) {
    if (ltvRatio > 95) ltvAdjustment = 1.25;
    else if (ltvRatio > 90) ltvAdjustment = 1.15;
    else if (ltvRatio > 80) ltvAdjustment = 1.05;
    else ltvAdjustment = 0.95;
  }

  let creditAdjustment = 1.0;
  if (creditScore !== undefined) {
    if (creditScore >= 750) creditAdjustment = 0.9;
    else if (creditScore >= 700) creditAdjustment = 0.95;
    else if (creditScore >= 650) creditAdjustment = 1.0;
    else if (creditScore >= 600) creditAdjustment = 1.1;
    else creditAdjustment = 1.25;
  }

  const basePremium = coverageAmount * baseRate;
  const totalPremium = Math.round(
    basePremium * riskMultiplier * typeMultiplier * coverageMultiplier * ltvAdjustment * creditAdjustment
  );

  const breakdown = [
    { factor: 'Base Rate', value: baseRate, impact: basePremium },
    { factor: 'Risk Category', value: riskMultiplier, impact: Math.round(basePremium * (riskMultiplier - 1)) },
    { factor: 'Policy Type', value: typeMultiplier, impact: Math.round(basePremium * (typeMultiplier - 1)) },
    { factor: 'Coverage Volume', value: coverageMultiplier, impact: Math.round(basePremium * (coverageMultiplier - 1)) },
  ];

  if (ltvRatio !== undefined) {
    breakdown.push({ factor: 'LTV Ratio', value: ltvAdjustment, impact: Math.round(basePremium * (ltvAdjustment - 1)) });
  }
  if (creditScore !== undefined) {
    breakdown.push({ factor: 'Credit Score', value: creditAdjustment, impact: Math.round(basePremium * (creditAdjustment - 1)) });
  }

  return {
    baseRate,
    riskMultiplier,
    coverageMultiplier,
    typeMultiplier,
    totalPremium,
    breakdown,
  };
}

export function calculateRenewalPremium(
  currentPremium: number,
  claimsHistory: number,
  yearsAsCustomer: number,
  newRiskCategory: 'Low' | 'Medium' | 'High'
): { newPremium: number; changePercent: number; factors: string[] } {
  let multiplier = 1.0;
  const factors: string[] = [];

  if (claimsHistory === 0) {
    multiplier *= 0.95;
    factors.push('No claims discount: -5%');
  } else if (claimsHistory >= 3) {
    multiplier *= 1.15;
    factors.push('High claims surcharge: +15%');
  } else if (claimsHistory >= 1) {
    multiplier *= 1.05;
    factors.push('Claims adjustment: +5%');
  }

  if (yearsAsCustomer >= 5) {
    multiplier *= 0.93;
    factors.push('Loyalty discount (5+ years): -7%');
  } else if (yearsAsCustomer >= 3) {
    multiplier *= 0.96;
    factors.push('Loyalty discount (3+ years): -4%');
  }

  const riskMult = RISK_MULTIPLIERS[newRiskCategory];
  if (riskMult !== 1.0) {
    multiplier *= riskMult;
    factors.push(`Risk adjustment (${newRiskCategory}): ${riskMult < 1 ? '-' : '+'}${Math.abs(Math.round((riskMult - 1) * 100))}%`);
  }

  multiplier *= 1.03;
  factors.push('Annual inflation: +3%');

  const newPremium = Math.round(currentPremium * multiplier);
  const changePercent = Math.round(((newPremium - currentPremium) / currentPremium) * 100);

  return { newPremium, changePercent, factors };
}
