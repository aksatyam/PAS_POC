import { Claim, FraudAssessment, FraudIndicator } from '../models';
import { claimRepository } from '../repositories/claim.repository';

const FRAUD_RULES: { rule: string; description: string; weight: number; check: (claim: Claim, history: Claim[]) => boolean }[] = [
  {
    rule: 'HIGH_AMOUNT',
    description: 'Claim amount exceeds 80% of coverage',
    weight: 20,
    check: (claim) => claim.amount > 500000,
  },
  {
    rule: 'EARLY_CLAIM',
    description: 'Claim filed within 30 days of policy creation',
    weight: 25,
    check: (claim) => {
      const filed = new Date(claim.filedDate).getTime();
      const created = new Date(claim.updatedAt).getTime();
      return (filed - created) < 30 * 24 * 60 * 60 * 1000;
    },
  },
  {
    rule: 'DUPLICATE_CLAIM',
    description: 'Multiple claims on same policy within 90 days',
    weight: 30,
    check: (claim, history) => {
      const samePolicy = history.filter(
        (c) => c.policyId === claim.policyId && c.id !== claim.id
      );
      return samePolicy.some((c) => {
        const diff = Math.abs(new Date(c.filedDate).getTime() - new Date(claim.filedDate).getTime());
        return diff < 90 * 24 * 60 * 60 * 1000;
      });
    },
  },
  {
    rule: 'FRAUD_TYPE',
    description: 'Claim type is explicitly marked as Fraud',
    weight: 40,
    check: (claim) => claim.claimType === 'Fraud',
  },
  {
    rule: 'ROUND_AMOUNT',
    description: 'Claim amount is suspiciously round number',
    weight: 10,
    check: (claim) => claim.amount % 10000 === 0 && claim.amount > 50000,
  },
  {
    rule: 'FREQUENT_CLAIMANT',
    description: 'Claimant has 3+ claims across all policies',
    weight: 15,
    check: (claim, history) => {
      const byCreator = history.filter((c) => c.createdBy === claim.createdBy);
      return byCreator.length >= 3;
    },
  },
];

export function assessFraud(claim: Claim): FraudAssessment {
  const allClaims = claimRepository.findAll();
  const indicators: FraudIndicator[] = FRAUD_RULES.map((rule) => ({
    rule: rule.rule,
    description: rule.description,
    weight: rule.weight,
    triggered: rule.check(claim, allClaims),
  }));

  const totalWeight = indicators.reduce((sum, i) => sum + i.weight, 0);
  const triggeredWeight = indicators.filter((i) => i.triggered).reduce((sum, i) => sum + i.weight, 0);
  const score = Math.round((triggeredWeight / totalWeight) * 100);

  let level: FraudAssessment['level'];
  if (score >= 70) level = 'Critical';
  else if (score >= 50) level = 'High';
  else if (score >= 25) level = 'Medium';
  else level = 'Low';

  return {
    claimId: claim.id,
    score,
    level,
    indicators,
    assessedAt: new Date().toISOString(),
  };
}
