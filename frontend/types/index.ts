// User types
export type UserRole = 'Admin' | 'Operations' | 'Underwriter' | 'Claims' | 'Viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Policy types
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
  parentPolicyId?: string;
  renewalOf?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  changes: Record<string, { from: any; to: any }>;
  timestamp: string;
  changedBy: string;
}

// Endorsement types
export type EndorsementType = 'Coverage Change' | 'Premium Adjustment' | 'Beneficiary Change' | 'Term Extension' | 'Other';
export type EndorsementStatus = 'Pending' | 'Approved' | 'Applied' | 'Rejected';

export interface Endorsement {
  id: string;
  policyId: string;
  type: EndorsementType;
  description: string;
  changes: Record<string, { from: any; to: any }>;
  premiumDelta: number;
  effectiveDate: string;
  status: EndorsementStatus;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

// Renewal types
export type RenewalStatus = 'Pending' | 'Quoted' | 'Accepted' | 'Declined' | 'Expired';

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
  status: RenewalStatus;
  uwReEvaluated: boolean;
  newRiskScore?: number;
  createdAt: string;
  createdBy: string;
}

// Premium calculation types
export interface PremiumBreakdownItem {
  factor: string;
  value: number;
  impact: number;
}

export interface PremiumCalculation {
  baseRate: number;
  riskMultiplier: number;
  coverageMultiplier: number;
  typeMultiplier: number;
  totalPremium: number;
  breakdown: PremiumBreakdownItem[];
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: { street: string; city: string; state: string; pincode: string };
  riskCategory: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
}

// Underwriting types
export type UnderwritingDecision = 'Auto-Approve' | 'Refer' | 'Reject';
export type RuleCategory = 'Eligibility' | 'Pricing' | 'Compliance' | 'Risk Assessment';
export type ReferralStatus = 'Pending' | 'Accepted' | 'Declined' | 'Escalated';

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  passed: boolean;
  decision: UnderwritingDecision;
  detail: string;
}

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
  notes?: string;
  evaluatedBy: string;
  evaluatedAt: string;
  overridden?: boolean;
  overrideBy?: string;
  overrideReason?: string;
  referralId?: string;
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

// Claim types
export type ClaimStatus = 'Filed' | 'Under Review' | 'Approved' | 'Rejected' | 'Settled';
export type ClaimType = 'Default' | 'Property Damage' | 'Fraud' | 'Other';
export type AdjudicationStatus = 'Investigation' | 'Evaluation' | 'Negotiation' | 'Settlement';

export interface Claim {
  id: string;
  policyId: string;
  claimType: ClaimType;
  description: string;
  amount: number;
  status: ClaimStatus;
  filedDate: string;
  reviewedDate?: string;
  settledDate?: string;
  settlementAmount?: number;
  settlementDate?: string;
  reviewDate?: string;
  assignedTo?: string;
  adjudicationStatus?: AdjudicationStatus;
  fnolId?: string;
  incidentDate?: string;
  incidentLocation?: string;
  reportedBy?: string;
  contactPhone?: string;
  reserveAmount?: number;
  fraudScore?: number;
  fraudIndicators?: string[];
  dpd?: number;
  npaCategory?: string;
  documents: { name: string; type: string; uploadedAt: string }[];
  createdBy: string;
  updatedAt?: string;
}

// FNOL types
export type FNOLStatus = 'Submitted' | 'Processing' | 'Claim Created';

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
  status: FNOLStatus;
  claimId?: string;
  createdAt: string;
  createdBy: string;
}

// Reserve types
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

// Fraud types
export interface FraudIndicator {
  rule: string;
  description: string;
  weight: number;
  triggered: boolean;
}

export interface FraudAssessment {
  claimId: string;
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  indicators: FraudIndicator[];
  assessedAt: string;
}

// Loss Mitigation types
export type MitigationType = 'Workout Plan' | 'Forbearance' | 'Loan Modification' | 'Short Sale' | 'Other';
export type MitigationStatus = 'Proposed' | 'Active' | 'Completed' | 'Failed';

export interface LossMitigation {
  id: string;
  claimId: string;
  type: MitigationType;
  description: string;
  status: MitigationStatus;
  startDate: string;
  endDate?: string;
  terms?: string;
  createdAt: string;
  createdBy: string;
}

// Notification types
export type NotificationType =
  | 'POLICY_ISSUED' | 'POLICY_RENEWED' | 'POLICY_ENDORSED' | 'POLICY_CANCELLED' | 'POLICY_LAPSED'
  | 'CLAIM_FILED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'CLAIM_SETTLED' | 'FNOL_SUBMITTED'
  | 'UW_REFERRAL' | 'UW_DECISION'
  | 'TASK_ASSIGNED' | 'TASK_OVERDUE' | 'TASK_COMPLETED'
  | 'RESERVE_CHANGED' | 'RENEWAL_DUE' | 'PAYMENT_DUE' | 'PAYMENT_OVERDUE'
  | 'SYSTEM';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  recipientId: string;
  actionLink?: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}

// Task types
export type TaskType =
  | 'CLAIM_REVIEW' | 'CLAIM_INVESTIGATION' | 'CLAIM_SETTLEMENT'
  | 'UW_REVIEW' | 'UW_REFERRAL'
  | 'POLICY_RENEWAL' | 'POLICY_ENDORSEMENT'
  | 'DOCUMENT_REVIEW' | 'FNOL_PROCESSING'
  | 'RESERVE_REVIEW' | 'FRAUD_REVIEW'
  | 'GENERAL';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Open' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  slaDeadline?: string;
  resourceType?: string;
  resourceId?: string;
  actionLink?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface TaskDashboard {
  total: number;
  open: number;
  inProgress: number;
  overdue: number;
  completedThisWeek: number;
  byPriority: Record<TaskPriority, number>;
}

// Document types
export interface PolicyDocument {
  id: string;
  policyId: string;
  type: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  metadata: Record<string, any>;
}

// Audit types
export interface AuditLog {
  id: string;
  actor: { userId: string; role: string };
  action: string;
  resource: { type: string; id: string };
  before?: any;
  after?: any;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Dashboard types
export interface DashboardSummary {
  totalPolicies: number;
  activePolicies: number;
  totalPremium: number;
  totalCoverage: number;
  policyByStatus: Record<PolicyStatus, number>;
  policyByType: Record<PolicyType, number>;
  riskDistribution: Record<string, number>;
}

export interface ClaimsSummary {
  totalClaims: number;
  claimsByStatus: Record<ClaimStatus, number>;
  totalClaimAmount: number;
  totalSettled: number;
}

export interface UnderwritingSummary {
  totalEvaluations: number;
  decisionBreakdown: Record<UnderwritingDecision, number>;
  averageRiskScore: number;
}

// Billing types
export type PaymentFrequency = 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Monthly';
export type BillingAccountStatus = 'Active' | 'Suspended' | 'Closed' | 'Grace_Period' | 'Delinquent';
export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Void' | 'Partially_Paid';
export type PaymentMethod = 'ACH' | 'Wire' | 'Check' | 'Credit_Card' | 'Escrow';
export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';

export interface BillingAccount {
  id: string;
  policyId: string;
  customerId: string;
  paymentFrequency: PaymentFrequency;
  totalPremium: number;
  balance: number;
  status: BillingAccountStatus;
  paymentMethod: PaymentMethod;
  autopay: boolean;
  gracePeriodDays: number;
  nextDueDate: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  billingAccountId: string;
  policyId: string;
  invoiceNumber: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: { description: string; amount: number; type: string }[];
  issuedDate: string;
  paidDate?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  billingAccountId: string;
  invoiceId?: string;
  policyId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  processedDate: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  billingAccountId: string;
  policyId: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  referenceId?: string;
  date: string;
  createdAt: string;
}

export interface BillingSummary {
  totalAccounts: number;
  activeAccounts: number;
  totalOutstanding: number;
  totalOverdue: number;
  overdueCount: number;
  totalCollected: number;
  agingBuckets: { label: string; count: number; amount: number }[];
}

export interface InstallmentPlan {
  id: string;
  billingAccountId: string;
  policyId: string;
  totalPremium: number;
  frequency: PaymentFrequency;
  numberOfInstallments: number;
  installmentAmount: number;
  installments: { number: number; dueDate: string; amount: number; status: string; paidDate?: string }[];
  createdAt: string;
}

// Activity types
export type ActivityAction =
  | 'POLICY_CREATED' | 'POLICY_UPDATED' | 'POLICY_ISSUED' | 'POLICY_CANCELLED' | 'POLICY_ENDORSED' | 'POLICY_RENEWED'
  | 'CLAIM_FILED' | 'CLAIM_UPDATED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'CLAIM_SETTLED'
  | 'UW_EVALUATED' | 'UW_OVERRIDDEN' | 'REFERRAL_CREATED' | 'REFERRAL_RESOLVED'
  | 'PAYMENT_RECORDED' | 'INVOICE_GENERATED'
  | 'TASK_ASSIGNED' | 'TASK_COMPLETED'
  | 'DOCUMENT_UPLOADED' | 'DOCUMENT_GENERATED'
  | 'USER_LOGIN' | 'USER_LOGOUT';

export type EntityType = 'policy' | 'claim' | 'underwriting' | 'billing' | 'task' | 'document' | 'user';

export interface ActivityEntry {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  actor: { userId: string; userName: string };
  summary: string;
  details?: Record<string, any>;
  timestamp: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
