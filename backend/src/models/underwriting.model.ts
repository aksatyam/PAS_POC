export type UnderwritingDecision = 'Auto-Approve' | 'Refer' | 'Reject';
export type RuleCategory = 'Eligibility' | 'Pricing' | 'Compliance' | 'Risk Assessment';
export type ReferralStatus = 'Pending' | 'Accepted' | 'Declined' | 'Escalated';

export interface UnderwritingRecord {
  id: string;
  policyId: string;
  applicantAge: number;
  creditScore: number;
  income: number;
  propertyValue: number;
  ltvRatio: number;
  propertyZone: string;
  annualPremium: number;
  riskScore: number;
  decision: UnderwritingDecision;
  rulesApplied: string[];
  ruleResults?: RuleResult[];
  notes: string;
  evaluatedBy: string;
  evaluatedAt: string;
  overridden: boolean;
  overrideBy?: string;
  overrideReason?: string;
  referralId?: string;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  passed: boolean;
  decision: UnderwritingDecision;
  detail: string;
}

export interface UnderwritingRule {
  id: string;
  name: string;
  category: RuleCategory;
  criteria: string;
  field: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'in' | 'notIn' | 'between';
  value: number | string | number[];
  decision: UnderwritingDecision;
  notes: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  underwritingId: string;
  policyId: string;
  assignedTo: string;
  assignedBy: string;
  status: ReferralStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  triggerRules: string[];
  riskScore: number;
  notes: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  escalatedTo?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
}

export interface UWAuthority {
  userId: string;
  userName: string;
  maxCoverageAmount: number;
  maxRiskScore: number;
  allowedDecisions: UnderwritingDecision[];
  canOverride: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface EvaluationRequest {
  policyId: string;
  applicantAge: number;
  creditScore: number;
  income: number;
  propertyValue: number;
  loanAmount: number;
  propertyZone: string;
  annualPremium: number;
}
