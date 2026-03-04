import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Draft: 'bg-gray-100 text-gray-800',
  Quoted: 'bg-blue-100 text-blue-800',
  Bound: 'bg-indigo-100 text-indigo-800',
  Issued: 'bg-teal-100 text-teal-800',
  Endorsed: 'bg-cyan-100 text-cyan-800',
  Renewal_Pending: 'bg-amber-100 text-amber-800',
  Reinstated: 'bg-emerald-100 text-emerald-800',
  Lapsed: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
  Expired: 'bg-orange-100 text-orange-800',
  Filed: 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Settled: 'bg-purple-100 text-purple-800',
  'Auto-Approve': 'bg-green-100 text-green-800',
  Refer: 'bg-yellow-100 text-yellow-800',
  Reject: 'bg-red-100 text-red-800',
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
  Critical: 'bg-red-200 text-red-900',
  // FNOL statuses
  Submitted: 'bg-blue-100 text-blue-800',
  Processing: 'bg-yellow-100 text-yellow-800',
  'Claim Created': 'bg-green-100 text-green-800',
  // Adjudication statuses
  Investigation: 'bg-blue-100 text-blue-800',
  Evaluation: 'bg-indigo-100 text-indigo-800',
  Negotiation: 'bg-amber-100 text-amber-800',
  Settlement: 'bg-green-100 text-green-800',
  // Mitigation statuses
  Proposed: 'bg-gray-100 text-gray-800',
  Completed: 'bg-green-100 text-green-800',
  Failed: 'bg-red-100 text-red-800',
  // Reserve types
  Initial: 'bg-blue-100 text-blue-800',
  Adjustment: 'bg-amber-100 text-amber-800',
  IBNR: 'bg-purple-100 text-purple-800',
  // Task statuses
  Open: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Overdue: 'bg-red-100 text-red-800',
  // Task priorities
  Urgent: 'bg-red-200 text-red-900',
  // Document statuses
  Verified: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  // Billing statuses
  Paid: 'bg-green-100 text-green-800',
  Void: 'bg-gray-200 text-gray-600',
  Partially_Paid: 'bg-blue-100 text-blue-800',
  Grace_Period: 'bg-yellow-100 text-yellow-800',
  Delinquent: 'bg-red-100 text-red-800',
  Suspended: 'bg-gray-100 text-gray-800',
  Refunded: 'bg-purple-100 text-purple-800',
};

export const roleColors: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-800',
  Operations: 'bg-blue-100 text-blue-800',
  Underwriter: 'bg-indigo-100 text-indigo-800',
  Claims: 'bg-orange-100 text-orange-800',
  Viewer: 'bg-gray-100 text-gray-800',
};
