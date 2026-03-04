// ── Billing & Payments Models ──

export type PaymentFrequency = 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Monthly';
export type BillingAccountStatus = 'Active' | 'Suspended' | 'Closed' | 'Grace_Period' | 'Delinquent';
export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Void' | 'Partially_Paid';
export type PaymentMethod = 'ACH' | 'Wire' | 'Check' | 'Credit_Card' | 'Escrow';
export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';
export type LedgerEntryType = 'Premium' | 'Payment' | 'Refund' | 'Write_Off' | 'Adjustment' | 'Late_Fee';

export interface BillingAccount {
  id: string;
  policyId: string;
  customerId: string;
  paymentFrequency: PaymentFrequency;
  totalPremium: number;
  balance: number; // Outstanding balance (positive = owed)
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
  lineItems: InvoiceLineItem[];
  issuedDate: string;
  paidDate?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
  type: 'Premium' | 'Fee' | 'Tax' | 'Adjustment';
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
  type: LedgerEntryType;
  description: string;
  debit: number;
  credit: number;
  balance: number; // Running balance after this entry
  referenceId?: string; // Links to invoice or payment ID
  date: string;
  createdAt: string;
}

export interface InstallmentPlan {
  id: string;
  billingAccountId: string;
  policyId: string;
  totalPremium: number;
  frequency: PaymentFrequency;
  numberOfInstallments: number;
  installmentAmount: number;
  installments: Installment[];
  createdAt: string;
}

export interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: 'Scheduled' | 'Paid' | 'Overdue' | 'Void';
  paidDate?: string;
  invoiceId?: string;
}

export interface AgingBucket {
  label: string;
  count: number;
  amount: number;
}

export interface BillingSummary {
  totalAccounts: number;
  activeAccounts: number;
  totalOutstanding: number;
  totalOverdue: number;
  overdueCount: number;
  totalCollected: number;
  agingBuckets: AgingBucket[];
}
