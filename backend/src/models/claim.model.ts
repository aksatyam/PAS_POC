export type ClaimType = 'Default' | 'Property Damage' | 'Fraud' | 'Other';
export type ClaimStatus = 'Filed' | 'Under Review' | 'Approved' | 'Rejected' | 'Settled';
export type AdjudicationStatus = 'Investigation' | 'Evaluation' | 'Negotiation' | 'Settlement';

export interface Claim {
  id: string;
  policyId: string;
  claimType: ClaimType;
  description: string;
  amount: number;
  status: ClaimStatus;
  adjudicationStatus?: AdjudicationStatus;
  filedDate: string;
  reviewDate?: string;
  settlementDate?: string;
  settlementAmount?: number;
  documents: string[];
  assignedTo?: string;
  createdBy: string;
  updatedAt: string;
  // FNOL fields
  fnolId?: string;
  incidentDate?: string;
  incidentLocation?: string;
  reportedBy?: string;
  contactPhone?: string;
  // Reserve fields
  reserveAmount?: number;
  // Fraud fields
  fraudScore?: number;
  fraudIndicators?: string[];
}

// FNOL (First Notice of Loss)
export interface FNOL {
  id: string;
  policyId: string;
  claimType: ClaimType;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  reportedBy: string;
  contactPhone: string;
  contactEmail?: string;
  damageDescription: string;
  estimatedAmount: number;
  partiesInvolved: { name: string; role: string; contact?: string }[];
  documents: string[];
  status: 'Submitted' | 'Processing' | 'Claim Created';
  claimId?: string;
  createdAt: string;
  createdBy: string;
}

// Reserve Management
export interface Reserve {
  id: string;
  claimId: string;
  type: 'Initial' | 'Adjustment' | 'IBNR';
  amount: number;
  previousAmount: number;
  reason: string;
  createdAt: string;
  createdBy: string;
}

// Fraud Indicators
export interface FraudAssessment {
  claimId: string;
  score: number; // 0-100
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  indicators: FraudIndicator[];
  assessedAt: string;
}

export interface FraudIndicator {
  rule: string;
  description: string;
  weight: number;
  triggered: boolean;
}

// Loss Mitigation
export interface LossMitigation {
  id: string;
  claimId: string;
  type: 'Workout Plan' | 'Forbearance' | 'Loan Modification' | 'Short Sale' | 'Other';
  description: string;
  status: 'Proposed' | 'Active' | 'Completed' | 'Failed';
  startDate: string;
  endDate?: string;
  terms?: string;
  createdAt: string;
  createdBy: string;
}
