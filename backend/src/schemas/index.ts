import { z } from 'zod';

// ─── Policy Schemas ──────────────────────────────────────────
export const createPolicySchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  policyType: z.string().min(1, 'policyType is required'),
  coverageAmount: z.number().positive('coverageAmount must be a positive number'),
  startDate: z.string().min(1, 'startDate is required'),
  endDate: z.string().min(1, 'endDate is required'),
  premium: z.number().optional(),
  deductible: z.number().optional(),
});

export const createQuoteSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  policyType: z.string().min(1, 'policyType is required'),
  coverageAmount: z.number().positive('coverageAmount must be a positive number'),
  startDate: z.string().min(1, 'startDate is required'),
  endDate: z.string().min(1, 'endDate is required'),
  deductible: z.number().optional(),
  riskFactors: z.record(z.any()).optional(),
});

export const updatePolicySchema = z.object({
  policyType: z.string().optional(),
  coverageAmount: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  premium: z.number().optional(),
  deductible: z.number().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export const changeStatusSchema = z.object({
  status: z.string().min(1, 'status is required'),
  reason: z.string().optional(),
});

export const endorsementSchema = z.object({
  type: z.string().min(1, 'type is required'),
  changes: z.record(z.any()).optional(),
  reason: z.string().optional(),
  effectiveDate: z.string().optional(),
});

// ─── Customer Schemas ────────────────────────────────────────
export const createCustomerSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
  email: z.string().email('Invalid email format').trim(),
  phone: z.string().min(1, 'phone is required').trim(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  ssn: z.string().optional(),
  riskProfile: z.record(z.any()).optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).trim().optional(),
  email: z.string().email('Invalid email format').trim().optional(),
  phone: z.string().min(1).trim().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  riskProfile: z.record(z.any()).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

// ─── Claim Schemas ───────────────────────────────────────────
export const registerClaimSchema = z.object({
  policyId: z.string().min(1, 'policyId is required'),
  claimType: z.string().min(1, 'claimType is required'),
  amount: z.number().positive('amount must be a positive number'),
  description: z.string().min(1, 'description is required'),
  incidentDate: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export const submitFNOLSchema = z.object({
  policyId: z.string().min(1, 'policyId is required'),
  incidentDate: z.string().min(1, 'incidentDate is required'),
  incidentType: z.string().min(1, 'incidentType is required'),
  description: z.string().min(1, 'description is required'),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
  reporterEmail: z.string().optional(),
  location: z.string().optional(),
  injuries: z.boolean().optional(),
  policeReportFiled: z.boolean().optional(),
  damageDescription: z.string().optional(),
  estimatedLoss: z.number().optional(),
});

export const claimStatusSchema = z.object({
  status: z.string().min(1, 'status is required'),
  reason: z.string().optional(),
  note: z.string().optional(),
});

export const settleClaimSchema = z.object({
  amount: z.number().positive('settlement amount must be a positive number'),
  method: z.string().optional(),
  notes: z.string().optional(),
});

export const adjudicationSchema = z.object({
  adjudicationStatus: z.string().min(1, 'adjudicationStatus is required'),
  notes: z.string().optional(),
});

export const reserveSchema = z.object({
  amount: z.number().min(0, 'reserve amount must be non-negative'),
  reason: z.string().optional(),
  type: z.string().optional(),
});

export const mitigationSchema = z.object({
  type: z.string().min(1, 'mitigation type is required'),
  description: z.string().min(1, 'description is required'),
  status: z.string().optional(),
  targetDate: z.string().optional(),
});

// ─── Billing Schemas ─────────────────────────────────────────
export const createBillingAccountSchema = z.object({
  policyId: z.string().min(1, 'policyId is required'),
  customerId: z.string().min(1, 'customerId is required'),
  paymentFrequency: z.string().min(1, 'paymentFrequency is required'),
  paymentMethod: z.string().optional(),
  autoPay: z.boolean().optional(),
});

export const createInvoiceSchema = z.object({
  billingAccountId: z.string().min(1, 'billingAccountId is required'),
  amount: z.number().positive('amount must be a positive number'),
  dueDate: z.string().min(1, 'dueDate is required'),
  description: z.string().optional(),
  lineItems: z.array(z.record(z.any())).optional(),
});

export const recordPaymentSchema = z.object({
  billingAccountId: z.string().min(1, 'billingAccountId is required'),
  invoiceId: z.string().min(1, 'invoiceId is required'),
  amount: z.number().positive('amount must be a positive number'),
  method: z.string().min(1, 'payment method is required'),
  reference: z.string().optional(),
  date: z.string().optional(),
});

// ─── Task Schemas ────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().min(1, 'title is required'),
  type: z.string().min(1, 'type is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  assigneeId: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Admin Schemas ───────────────────────────────────────────
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'name is required'),
  role: z.enum(['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer']),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1).optional(),
  role: z.enum(['Admin', 'Operations', 'Underwriter', 'Claims', 'Viewer']).optional(),
  isActive: z.boolean().optional(),
});

// ─── Integration Schemas ─────────────────────────────────────
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'name is required'),
  rateLimit: z.number().int().min(10).max(1000).optional(),
  permissions: z.array(z.string()).optional(),
});

export const createWebhookSchema = z.object({
  name: z.string().min(1, 'name is required'),
  url: z.string().url('Invalid URL format'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  maxRetries: z.number().int().min(0).max(10).optional(),
});

// ─── Underwriting Schemas ────────────────────────────────────
export const evaluateUnderwritingSchema = z.object({
  policyId: z.string().min(1, 'policyId is required'),
  riskFactors: z.record(z.any()).optional(),
  overrideRules: z.array(z.string()).optional(),
});

export const overrideUnderwritingSchema = z.object({
  decision: z.enum(['Approved', 'Declined', 'Referred']),
  reason: z.string().min(1, 'reason is required'),
  riskScore: z.number().min(0).max(100).optional(),
  conditions: z.array(z.string()).optional(),
});

// ─── Document Schemas ───────────────────────────────────────
export const generateDocumentSchema = z.object({
  templateId: z.string().min(1, 'templateId is required'),
  entityType: z.string().min(1, 'entityType is required'),
  entityId: z.string().min(1, 'entityId is required'),
  data: z.record(z.any()).optional(),
});

export const uploadDocumentSchema = z.object({
  name: z.string().min(1, 'name is required'),
  type: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  category: z.string().optional(),
});

// ─── Product Schemas ────────────────────────────────────────
export const createProductSchema = z.object({
  name: z.string().min(1, 'name is required'),
  code: z.string().min(1, 'code is required'),
  description: z.string().optional(),
  policyType: z.string().optional(),
  status: z.enum(['Draft', 'Active', 'Inactive']).optional(),
  defaultTermMonths: z.number().int().positive().optional(),
  minPremium: z.number().min(0).optional(),
  maxPremium: z.number().min(0).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  coverageOptions: z.array(z.record(z.any())).optional(),
  ratingFactors: z.array(z.record(z.any())).optional(),
  eligibilityCriteria: z.array(z.record(z.any())).optional(),
  requiredDocuments: z.array(z.string()).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  policyType: z.string().optional(),
  status: z.enum(['Draft', 'Active', 'Inactive']).optional(),
  defaultTermMonths: z.number().int().positive().optional(),
  minPremium: z.number().min(0).optional(),
  maxPremium: z.number().min(0).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  coverageOptions: z.array(z.record(z.any())).optional(),
  ratingFactors: z.array(z.record(z.any())).optional(),
  eligibilityCriteria: z.array(z.record(z.any())).optional(),
  requiredDocuments: z.array(z.string()).optional(),
});

// ─── Compliance Schemas ─────────────────────────────────────
export const createComplianceSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
  category: z.enum(['Regulatory', 'Internal', 'Industry', 'Legal']).optional(),
  authority: z.string().optional(),
  status: z.enum(['Due', 'In Progress', 'Compliant', 'Non-Compliant']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.string().optional(),
});

export const updateComplianceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  authority: z.string().optional(),
  status: z.enum(['Due', 'In Progress', 'Compliant', 'Non-Compliant']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

// ─── UW Rules Schemas ───────────────────────────────────────
export const createUWRuleSchema = z.object({
  name: z.string().min(1, 'name is required'),
  category: z.string().min(1, 'category is required'),
  condition: z.string().min(1, 'condition is required'),
  action: z.string().min(1, 'action is required'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().positive().optional(),
  description: z.string().optional(),
});

export const updateUWRuleSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  action: z.string().optional(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().positive().optional(),
  description: z.string().optional(),
});

// ─── Referral Schemas ───────────────────────────────────────
export const resolveReferralSchema = z.object({
  resolution: z.string().min(1, 'resolution is required'),
  decision: z.string().min(1, 'decision is required'),
});

export const escalateReferralSchema = z.object({
  escalateTo: z.string().min(1, 'escalateTo is required'),
});

export const updateAuthoritySchema = z.object({
  maxCoverage: z.number().positive().optional(),
  maxRiskScore: z.number().min(0).max(100).optional(),
  allowedPolicyTypes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// ─── Bulk Operation Schemas ─────────────────────────────────
export const bulkOperationSchema = z.object({
  entityIds: z.array(z.string()).min(1, 'entityIds array is required'),
  parameters: z.record(z.any()).optional(),
});

// ─── Auth Schemas ────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'password is required'),
});
