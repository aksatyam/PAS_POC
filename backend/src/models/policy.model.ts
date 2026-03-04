export type PolicyType = 'Mortgage Guarantee' | 'Credit Protection' | 'Coverage Plus';
export type PolicyStatus =
  | 'Draft' | 'Quoted' | 'Bound' | 'Issued' | 'Active'
  | 'Endorsed' | 'Renewal_Pending' | 'Reinstated'
  | 'Lapsed' | 'Cancelled' | 'Expired';

export interface Policy {
  id: string;
  customerId: string;
  policyType: PolicyType;
  status: PolicyStatus;
  premiumAmount: number;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  underwritingDecision?: string;
  riskCategory: 'Low' | 'Medium' | 'High';
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  parentPolicyId?: string;
  renewalOf?: string;
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  changes: Record<string, { from: any; to: any }>;
  timestamp: string;
  changedBy: string;
}

export interface Endorsement {
  id: string;
  policyId: string;
  type: 'Coverage Change' | 'Premium Adjustment' | 'Beneficiary Change' | 'Term Extension' | 'Other';
  description: string;
  changes: Record<string, { from: any; to: any }>;
  premiumDelta: number;
  effectiveDate: string;
  status: 'Pending' | 'Approved' | 'Applied' | 'Rejected';
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Renewal {
  id: string;
  originalPolicyId: string;
  renewedPolicyId?: string;
  renewalDate: string;
  newPremiumAmount: number;
  newCoverageAmount: number;
  newStartDate: string;
  newEndDate: string;
  premiumChange: number;
  status: 'Pending' | 'Quoted' | 'Accepted' | 'Declined' | 'Expired';
  uwReEvaluated: boolean;
  newRiskScore?: number;
  createdAt: string;
  createdBy: string;
}

export interface PremiumCalculation {
  baseRate: number;
  riskMultiplier: number;
  coverageMultiplier: number;
  typeMultiplier: number;
  totalPremium: number;
  breakdown: { factor: string; value: number; impact: number }[];
}
