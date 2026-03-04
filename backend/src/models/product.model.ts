export type ProductStatus = 'Active' | 'Inactive' | 'Draft';

export interface CoverageOption {
  name: string;
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
}

export interface RatingFactor {
  field: string;
  label: string;
  type: 'multiplier' | 'flat';
  tiers: { min: number; max: number; value: number }[];
}

export interface EligibilityCriteria {
  field: string;
  label: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'between' | 'in';
  value: number | string | number[];
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  status: ProductStatus;
  policyType: string;
  coverageOptions: CoverageOption[];
  ratingFactors: RatingFactor[];
  eligibilityCriteria: EligibilityCriteria[];
  requiredDocuments: string[];
  defaultTermMonths: number;
  minPremium: number;
  maxPremium: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type BulkOperationType = 'BULK_RENEWAL' | 'BULK_CANCEL' | 'BULK_INVOICE' | 'BULK_CLAIM_UPDATE' | 'BULK_DOCUMENT_GENERATE';
export type BulkOperationStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Partial';

export interface BulkOperationResult {
  entityId: string;
  success: boolean;
  message: string;
}

export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  results: BulkOperationResult[];
  parameters?: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  createdBy: string;
}

export type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Due' | 'In Progress' | 'Not Applicable';
export type ComplianceCategory = 'Regulatory' | 'Financial' | 'Operational' | 'Data Privacy' | 'Reporting';

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: ComplianceCategory;
  authority: string;
  status: ComplianceStatus;
  dueDate?: string;
  completedDate?: string;
  assignedTo?: string;
  evidence?: string;
  notes?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  recurrence: 'One-Time' | 'Monthly' | 'Quarterly' | 'Annual';
  createdAt: string;
  updatedAt: string;
}
