// Mock data for demo mode (GitHub Pages static deployment)
import { User } from '@/types';

export const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'admin@imgc.com',
  name: 'Akash Satyam',
  role: 'Admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const DEMO_CREDENTIALS = [
  { email: 'admin@imgc.com', password: 'demo123', role: 'Admin' as const, name: 'Akash Satyam' },
  { email: 'underwriter@imgc.com', password: 'demo123', role: 'Underwriter' as const, name: 'Priya Sharma' },
  { email: 'claims@imgc.com', password: 'demo123', role: 'Claims' as const, name: 'Rahul Verma' },
  { email: 'ops@imgc.com', password: 'demo123', role: 'Operations' as const, name: 'Sneha Patel' },
  { email: 'viewer@imgc.com', password: 'demo123', role: 'Viewer' as const, name: 'Amit Kumar' },
];

export function getDemoUser(email: string, password: string): User | null {
  const cred = DEMO_CREDENTIALS.find(c => c.email === email && c.password === password);
  if (!cred) return null;
  return {
    ...DEMO_USER,
    email: cred.email,
    name: cred.name,
    role: cred.role,
  };
}

// Mock API responses keyed by endpoint pattern
const mockResponses: Record<string, () => any> = {
  '/auth/profile': () => ({
    success: true,
    data: DEMO_USER,
  }),

  '/dashboard/summary': () => ({
    success: true,
    data: {
      totalPolicies: 1247,
      activePolicies: 892,
      totalPremium: 45820000,
      totalCoverage: 2890000000,
      policiesByStatus: {
        Draft: 45, Quoted: 78, Bound: 32, Issued: 156,
        Active: 892, Endorsed: 23, Lapsed: 12, Cancelled: 9,
      },
      policiesByType: {
        'Mortgage Guarantee': 645,
        'Credit Protection': 387,
        'Coverage Plus': 215,
      },
    },
  }),

  '/dashboard/claims': () => ({
    success: true,
    data: {
      totalClaims: 342,
      claimsByStatus: {
        Filed: 67, 'Under Review': 89, Approved: 45, Rejected: 28, Settled: 113,
      },
      totalClaimedAmount: 18750000,
      totalSettledAmount: 12430000,
    },
  }),

  '/dashboard/underwriting': () => ({
    success: true,
    data: {
      totalEvaluations: 1893,
      averageRiskScore: 42.7,
      decisionDistribution: {
        'Auto-Approve': 1245,
        Refer: 412,
        Reject: 236,
      },
      riskDistribution: {
        Low: 856,
        Medium: 689,
        High: 348,
      },
    },
  }),

  '/dashboard/kpis': () => ({
    success: true,
    data: {
      lossRatio: 58.2,
      expenseRatio: 28.4,
      combinedRatio: 86.6,
      retentionRate: 91.3,
      collectionRate: 94.7,
      avgClaimCycleTime: 22,
      avgClaimSeverity: 36400,
    },
  }),

  '/billing/summary': () => ({
    success: true,
    data: {
      totalAccounts: 892,
      activeAccounts: 847,
      totalOutstanding: 3240000,
      totalOverdue: 485000,
      overdueCount: 23,
      totalCollected: 42580000,
      agingBuckets: [
        { label: '0-30 days', count: 12, amount: 180000 },
        { label: '31-60 days', count: 7, amount: 195000 },
        { label: '61-90 days', count: 3, amount: 78000 },
        { label: '90+ days', count: 1, amount: 32000 },
      ],
    },
  }),

  '/policies': () => ({
    success: true,
    data: generateMockPolicies(),
    pagination: { total: 50, page: 1, limit: 20, totalPages: 3 },
  }),

  '/customers': () => ({
    success: true,
    data: generateMockCustomers(),
    pagination: { total: 35, page: 1, limit: 20, totalPages: 2 },
  }),

  '/claims': () => ({
    success: true,
    data: generateMockClaims(),
    pagination: { total: 30, page: 1, limit: 20, totalPages: 2 },
  }),

  '/billing/accounts': () => ({
    success: true,
    data: generateMockBillingAccounts(),
    pagination: { total: 25, page: 1, limit: 20, totalPages: 2 },
  }),

  '/underwriting': () => ({
    success: true,
    data: generateMockUnderwriting(),
    pagination: { total: 20, page: 1, limit: 20, totalPages: 1 },
  }),

  '/tasks': () => ({
    success: true,
    data: generateMockTasks(),
    pagination: { total: 15, page: 1, limit: 20, totalPages: 1 },
  }),

  '/tasks/dashboard': () => ({
    success: true,
    data: {
      total: 15,
      open: 5,
      inProgress: 4,
      overdue: 2,
      completedThisWeek: 4,
      byPriority: { Low: 3, Medium: 5, High: 4, Urgent: 3 },
    },
  }),

  '/notifications': () => ({
    success: true,
    data: generateMockNotifications(),
    pagination: { total: 10, page: 1, limit: 20, totalPages: 1 },
  }),

  '/notifications/unread-count': () => ({
    success: true,
    data: { count: 5 },
  }),

  '/activity': () => ({
    success: true,
    data: generateMockActivity(),
  }),

  '/audit': () => ({
    success: true,
    data: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  }),

  '/underwriting/rules': () => ({
    success: true,
    data: generateMockUWRules(),
  }),

  '/uw/rules': () => ({
    success: true,
    data: generateMockUWRules(),
  }),

  '/policies/renewals/pending': () => ({
    success: true,
    data: generateMockRenewals(),
    pagination: { total: 12, page: 1, limit: 20, totalPages: 1 },
  }),

  '/claims/fnol': () => ({
    success: true,
    data: generateMockFnol(),
    pagination: { total: 8, page: 1, limit: 20, totalPages: 1 },
  }),

  '/documents': () => ({
    success: true,
    data: generateMockDocuments(),
    pagination: { total: 15, page: 1, limit: 20, totalPages: 1 },
  }),

  '/compliance/requirements': () => ({
    success: true,
    data: generateMockComplianceRequirements(),
    pagination: { total: 10, page: 1, limit: 20, totalPages: 1 },
  }),

  '/compliance/summary': () => ({
    success: true,
    data: generateMockComplianceSummary(),
  }),

  '/reports/policies': () => ({
    success: true,
    data: {
      total: 1247,
      active: 892,
      totalPremium: 45820000,
      totalCoverage: 2890000000,
      byStatus: {
        Draft: 45, Quoted: 78, Bound: 32, Issued: 156,
        Active: 892, Endorsed: 23, Lapsed: 12, Cancelled: 9,
      },
      byType: {
        'Mortgage Guarantee': 645,
        'Credit Protection': 387,
        'Coverage Plus': 215,
      },
    },
  }),

  '/reports/claims': () => ({
    success: true,
    data: {
      total: 342,
      totalAmount: 18750000,
      totalSettled: 12430000,
      byStatus: {
        Filed: 67, 'Under Review': 89, Approved: 45, Rejected: 28, Settled: 113,
      },
    },
  }),

  '/reports/underwriting': () => ({
    success: true,
    data: {
      total: 1893,
      avgRiskScore: 42.7,
      autoApproveRate: 65.8,
      byDecision: {
        'Auto-Approve': 1245,
        Refer: 412,
        Reject: 236,
      },
    },
  }),

  '/reports/billing': () => ({
    success: true,
    data: {
      totalAccounts: 892,
      totalOutstanding: 3240000,
      totalOverdue: 485000,
      totalCollected: 42580000,
      agingBuckets: [
        { label: '0-30 days', amount: 180000 },
        { label: '31-60 days', amount: 195000 },
        { label: '61-90 days', amount: 78000 },
        { label: '90+ days', amount: 32000 },
      ],
    },
  }),

  '/reports/executive': () => ({
    success: true,
    data: {
      lossRatio: 58.2,
      combinedRatio: 86.6,
      retentionRate: 91.3,
      collectionRate: 94.7,
      expenseRatio: 28.4,
      avgClaimCycleTime: 22,
      avgClaimSeverity: 36400,
    },
  }),

  '/reports/export': () => ({
    success: true,
    data: { url: '#', message: 'Export generated (demo mode)' },
  }),

  '/underwriting/referrals': () => ({
    success: true,
    data: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  }),

  '/underwriting/authority': () => ({
    success: true,
    data: [],
  }),
};

export function getMockResponse(endpoint: string): any | null {
  // Exact match first
  if (mockResponses[endpoint]) return mockResponses[endpoint]();

  // Detail route handling
  const detailResult = matchDetailRoute(endpoint);
  if (detailResult) return detailResult;

  // Pattern match for common endpoints
  for (const [pattern, handler] of Object.entries(mockResponses)) {
    if (endpoint.startsWith(pattern)) return handler();
  }

  // Default fallback for unknown endpoints
  return { success: true, data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

function matchDetailRoute(endpoint: string): any | null {
  let match: RegExpMatchArray | null;

  // Policy detail & sub-resources
  match = endpoint.match(/^\/policies\/(POL-\d+)(?:\/(.+))?$/);
  if (match) {
    const [, id, sub] = match;
    const policies = generateMockPolicies();
    const policy = policies.find(p => p.id === id) || policies[0];
    if (!sub) return { success: true, data: policy };
    if (sub === 'versions') return { success: true, data: [] };
    if (sub === 'audit') return { success: true, data: generateMockAuditLogs(id) };
    if (sub === 'endorsements') return { success: true, data: [] };
    if (sub === 'renewals') return { success: true, data: [] };
    if (sub === 'transitions') return { success: true, data: { allowedTransitions: ['Active', 'Lapsed', 'Cancelled'] } };
    return { success: true, data: [] };
  }

  // Customer detail
  match = endpoint.match(/^\/customers\/(CUS-\d+)$/);
  if (match) {
    const customers = generateMockCustomers();
    const customer = customers.find(c => c.id === match![1]) || customers[0];
    const policies = generateMockPolicies().filter(p => p.customerId === customer.id);
    return { success: true, data: { customer, policies } };
  }

  // Claim detail & sub-resources
  match = endpoint.match(/^\/claims\/(CLM-\d+)(?:\/(.+))?$/);
  if (match) {
    const [, id, sub] = match;
    const claims = generateMockClaims();
    const claim = claims.find(c => c.id === id) || claims[0];
    if (!sub) return { success: true, data: { ...claim, fraudScore: 35, fraudIndicators: ['Pattern mismatch'], adjudicationStatus: 'Investigation' } };
    if (sub === 'reserve-history') return { success: true, data: generateMockReserves(id) };
    if (sub === 'fraud-score') return { success: true, data: { score: 35, riskLevel: 'Medium', indicators: [{ name: 'Pattern Mismatch', score: 35, description: 'Claim pattern slightly unusual' }], assessment: 'Low risk', assessedAt: '2024-06-01T10:00:00Z' } };
    if (sub === 'mitigations') return { success: true, data: [] };
    return { success: true, data: [] };
  }

  // Billing account detail
  match = endpoint.match(/^\/billing\/accounts\/(BIL-\d+)$/);
  if (match) {
    const accounts = generateMockBillingAccounts();
    const account = accounts.find(a => a.id === match![1]) || accounts[0];
    return { success: true, data: account };
  }

  // Billing account by policy
  match = endpoint.match(/^\/billing\/accounts\/policy\/(POL-\d+)$/);
  if (match) {
    const accounts = generateMockBillingAccounts();
    const account = accounts.find(a => a.policyId === match![1]) || null;
    return { success: true, data: account };
  }

  // Billing invoices for account
  match = endpoint.match(/^\/billing\/invoices\/account\/(BIL-\d+)$/);
  if (match) {
    return { success: true, data: generateMockInvoices(match[1]) };
  }

  // Billing payments for account
  match = endpoint.match(/^\/billing\/payments\/account\/(BIL-\d+)$/);
  if (match) {
    return { success: true, data: generateMockPayments(match[1]) };
  }

  // Billing ledger
  match = endpoint.match(/^\/billing\/ledger\/(BIL-\d+)$/);
  if (match) {
    return { success: true, data: generateMockLedger(match[1]) };
  }

  // Documents for policy
  match = endpoint.match(/^\/documents\/policy\/(POL-\d+)$/);
  if (match) {
    return { success: true, data: [] };
  }

  return null;
}

/* ── Mock data generators ─────────────────────────────────────── */

function generateMockPolicies() {
  const types = ['Mortgage Guarantee', 'Credit Protection', 'Coverage Plus'] as const;
  const statuses = ['Active', 'Issued', 'Draft', 'Quoted', 'Bound', 'Endorsed'] as const;
  const risks = ['Low', 'Medium', 'High'] as const;
  return Array.from({ length: 20 }, (_, i) => ({
    id: `POL-${String(1001 + i).padStart(4, '0')}`,
    customerId: `CUS-${String(100 + (i % 10)).padStart(4, '0')}`,
    policyType: types[i % 3],
    status: statuses[i % 6],
    premiumAmount: 25000 + Math.floor(Math.random() * 75000),
    coverageAmount: 5000000 + Math.floor(Math.random() * 15000000),
    startDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
    endDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
    riskCategory: risks[i % 3],
    version: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z',
    createdBy: 'demo-user-001',
  }));
}

function generateMockCustomers() {
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
    'Anita Gupta', 'Suresh Iyer', 'Kavita Joshi', 'Manoj Tiwari', 'Deepa Nair',
    'Rohit Malhotra', 'Suman Das', 'Arjun Rao', 'Meera Pillai', 'Karan Mehta'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];
  const risks = ['Low', 'Medium', 'High'] as const;
  return names.map((name, i) => ({
    id: `CUS-${String(100 + i).padStart(4, '0')}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: `+91 ${9800000000 + i * 1111}`,
    dob: `${1975 + (i % 20)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
    address: {
      street: `${100 + i * 10} Main Street`,
      city: cities[i % cities.length],
      state: 'Maharashtra',
      pincode: `${400000 + i * 10}`,
    },
    riskCategory: risks[i % 3],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-10T10:00:00Z',
  }));
}

function generateMockClaims() {
  const statuses = ['Filed', 'Under Review', 'Approved', 'Settled', 'Rejected'] as const;
  const types = ['Default', 'Property Damage', 'Fraud', 'Other'] as const;
  return Array.from({ length: 15 }, (_, i) => ({
    id: `CLM-${String(2001 + i).padStart(4, '0')}`,
    policyId: `POL-${String(1001 + (i % 10)).padStart(4, '0')}`,
    claimType: types[i % 4],
    description: `Claim for ${types[i % 4].toLowerCase()} - case ${i + 1}`,
    amount: 100000 + Math.floor(Math.random() * 500000),
    status: statuses[i % 5],
    filedDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    assignedTo: 'Rahul Verma',
    documents: [],
    createdBy: 'demo-user-001',
    updatedAt: '2024-06-15T10:00:00Z',
  }));
}

function generateMockBillingAccounts() {
  const statuses = ['Active', 'Active', 'Active', 'Grace_Period', 'Delinquent'] as const;
  const frequencies = ['Annual', 'Semi-Annual', 'Quarterly', 'Monthly'] as const;
  const methods = ['ACH', 'Wire', 'Check', 'Credit_Card'] as const;
  return Array.from({ length: 15 }, (_, i) => ({
    id: `BIL-${String(3001 + i).padStart(4, '0')}`,
    policyId: `POL-${String(1001 + i).padStart(4, '0')}`,
    customerId: `CUS-${String(100 + i).padStart(4, '0')}`,
    paymentFrequency: frequencies[i % 4],
    totalPremium: 25000 + Math.floor(Math.random() * 75000),
    balance: Math.floor(Math.random() * 25000),
    status: statuses[i % 5],
    paymentMethod: methods[i % 4],
    autopay: i % 3 === 0,
    gracePeriodDays: 30,
    nextDueDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  }));
}

function generateMockUnderwriting() {
  const decisions = ['Auto-Approve', 'Refer', 'Reject'] as const;
  return Array.from({ length: 15 }, (_, i) => ({
    id: `UW-${String(4001 + i).padStart(4, '0')}`,
    policyId: `POL-${String(1001 + i).padStart(4, '0')}`,
    applicantAge: 30 + (i % 30),
    creditScore: 600 + (i * 15) % 200,
    income: 500000 + i * 50000,
    propertyValue: 5000000 + i * 500000,
    ltvRatio: 60 + (i % 30),
    propertyZone: ['Zone A', 'Zone B', 'Zone C'][i % 3],
    annualPremium: 25000 + i * 5000,
    riskScore: 20 + (i * 7) % 80,
    decision: decisions[i % 3],
    rulesApplied: ['R001', 'R002', 'R003'],
    evaluatedBy: 'demo-user-001',
    evaluatedAt: '2024-06-01T10:00:00Z',
  }));
}

function generateMockTasks() {
  const types = ['CLAIM_REVIEW', 'UW_REVIEW', 'POLICY_RENEWAL', 'DOCUMENT_REVIEW', 'GENERAL'] as const;
  const priorities = ['Low', 'Medium', 'High', 'Urgent'] as const;
  const statuses = ['Open', 'In Progress', 'Completed', 'Overdue'] as const;
  return Array.from({ length: 10 }, (_, i) => ({
    id: `TSK-${String(5001 + i).padStart(4, '0')}`,
    type: types[i % 5],
    title: `${types[i % 5].replace(/_/g, ' ')} - Task ${i + 1}`,
    description: `Review and process task ${i + 1}`,
    assigneeId: 'demo-user-001',
    assigneeName: 'Akash Satyam',
    priority: priorities[i % 4],
    status: statuses[i % 4],
    dueDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String(15 + (i % 15)).padStart(2, '0')}`,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'demo-user-001',
    updatedAt: '2024-06-10T10:00:00Z',
  }));
}

function generateMockNotifications() {
  const types = ['POLICY_ISSUED', 'CLAIM_FILED', 'UW_REFERRAL', 'TASK_ASSIGNED', 'RENEWAL_DUE'] as const;
  const severities = ['info', 'warning', 'success', 'error'] as const;
  return Array.from({ length: 8 }, (_, i) => ({
    id: `NOT-${String(6001 + i).padStart(4, '0')}`,
    type: types[i % 5],
    severity: severities[i % 4],
    title: `Notification ${i + 1}`,
    message: `Demo notification message for ${types[i % 5].replace(/_/g, ' ').toLowerCase()}`,
    recipientId: 'demo-user-001',
    isRead: i > 4,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

function generateMockAuditLogs(entityId: string) {
  const actions = ['Created', 'Status Changed', 'Updated', 'Reviewed'];
  return Array.from({ length: 5 }, (_, i) => ({
    id: `AUD-${entityId}-${i + 1}`,
    entityId,
    action: actions[i % 4],
    actor: { userId: 'demo-user-001', role: 'Admin' },
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    details: {},
  }));
}

function generateMockReserves(claimId: string) {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `RES-${claimId}-${i + 1}`,
    claimId,
    type: ['Initial', 'Adjustment', 'Final'][i] || 'Adjustment',
    amount: 50000 + i * 25000,
    previousAmount: i > 0 ? 50000 + (i - 1) * 25000 : 0,
    reason: ['Initial reserve set', 'Adjusted based on assessment', 'Final reserve'][i] || 'Adjustment',
    setBy: 'demo-user-001',
    setAt: new Date(Date.now() - (3 - i) * 86400000 * 7).toISOString(),
  }));
}

function generateMockInvoices(billingAccountId: string) {
  const statuses = ['Paid', 'Paid', 'Pending', 'Overdue'] as const;
  return Array.from({ length: 4 }, (_, i) => ({
    id: `INV-${billingAccountId.replace('BIL-', '')}-${i + 1}`,
    billingAccountId,
    invoiceNumber: `INV-${billingAccountId.replace('BIL-', '')}-${String(i + 1).padStart(3, '0')}`,
    amount: 12500 + i * 2500,
    amountPaid: i < 2 ? 12500 + i * 2500 : 0,
    status: statuses[i],
    dueDate: `2024-${String(3 + i * 3).padStart(2, '0')}-15`,
    issuedDate: `2024-${String(2 + i * 3).padStart(2, '0')}-01`,
    lineItems: [{ description: 'Premium Installment', amount: 12500 + i * 2500, quantity: 1 }],
  }));
}

function generateMockPayments(billingAccountId: string) {
  const methods = ['ACH', 'Wire', 'Check'] as const;
  return Array.from({ length: 3 }, (_, i) => ({
    id: `PAY-${billingAccountId.replace('BIL-', '')}-${i + 1}`,
    billingAccountId,
    amount: 12500 + i * 2500,
    method: methods[i % 3],
    status: 'Completed' as const,
    reference: `REF-${1000000 + i * 111}`,
    processedDate: `2024-${String(3 + i * 3).padStart(2, '0')}-10`,
    notes: i === 0 ? 'Initial payment' : '',
  }));
}

function generateMockLedger(billingAccountId: string) {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `LED-${billingAccountId.replace('BIL-', '')}-${i + 1}`,
    billingAccountId,
    date: `2024-${String(1 + i * 2).padStart(2, '0')}-01`,
    type: i % 2 === 0 ? 'Debit' : 'Credit',
    description: i % 2 === 0 ? 'Premium Charge' : 'Payment Received',
    amount: 12500,
    balance: 50000 - i * 12500,
    reference: i % 2 === 1 ? `PAY-${billingAccountId.replace('BIL-', '')}-${Math.ceil(i / 2)}` : `INV-${billingAccountId.replace('BIL-', '')}-${Math.ceil((i + 1) / 2)}`,
  }));
}

function generateMockRenewals() {
  const statuses = ['Pending', 'Quoted', 'Accepted', 'Declined', 'Expired'] as const;
  return Array.from({ length: 12 }, (_, i) => ({
    id: `REN-${String(8001 + i).padStart(4, '0')}`,
    originalPolicyId: `POL-${String(1001 + i).padStart(4, '0')}`,
    renewedPolicyId: statuses[i % 5] === 'Accepted' ? `POL-${String(1101 + i).padStart(4, '0')}` : undefined,
    renewalDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
    newPremiumAmount: 28000 + Math.floor(Math.random() * 80000),
    newCoverageAmount: 5000000 + Math.floor(Math.random() * 15000000),
    newStartDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
    newEndDate: `2026-${String((i % 12) + 1).padStart(2, '0')}-01`,
    premiumChange: Math.floor(Math.random() * 10000) - 3000,
    status: statuses[i % 5],
    uwReEvaluated: i % 3 === 0,
    newRiskScore: 25 + (i * 7) % 60,
    createdAt: '2025-01-15T10:00:00Z',
    createdBy: 'Akash Satyam',
  }));
}

function generateMockFnol() {
  const claimTypes = ['Default', 'Property Damage', 'Fraud', 'Other'] as const;
  const statuses = ['Submitted', 'Processing', 'Claim Created'] as const;
  const reporters = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `FNOL-${String(9001 + i).padStart(4, '0')}`,
    policyId: `POL-${String(1001 + (i % 10)).padStart(4, '0')}`,
    claimType: claimTypes[i % 4],
    incidentDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String(5 + i).padStart(2, '0')}T14:30:00Z`,
    incidentLocation: ['Mumbai Central', 'Delhi NCR', 'Bangalore East', 'Hyderabad Tech Park', 'Chennai Marina', 'Pune Hinjewadi', 'Kolkata Salt Lake', 'Ahmedabad SG Highway'][i],
    description: [
      'Borrower defaulted on mortgage payments for 3 consecutive months',
      'Property sustained water damage from pipe burst on 2nd floor',
      'Suspected fraudulent documentation in loan application',
      'Insurance claim for structural damage after heavy rainfall',
      'Credit protection triggered due to job loss of primary borrower',
      'Property damage from electrical short circuit in kitchen area',
      'Default claim initiated after borrower relocation without notice',
      'Wind and storm damage to commercial property roof structure',
    ][i],
    reportedBy: reporters[i % 5],
    contactPhone: `+91 ${9800000000 + i * 1234}`,
    contactEmail: `${reporters[i % 5].toLowerCase().replace(' ', '.')}@example.com`,
    damageDescription: [
      'Three consecutive EMI defaults totaling ₹2.5L',
      'Extensive water damage to flooring and walls of 3 rooms',
      'Forged income documents and employment verification',
      'Cracks in foundation and wall structure, roof leaking',
      'Primary borrower unemployed for 4 months, unable to pay',
      'Complete rewiring needed, appliances damaged by power surge',
      'Borrower absconded, property found in poor condition',
      'Roof sheets blown off, water ingress in storage area',
    ][i],
    estimatedAmount: 100000 + i * 75000,
    partiesInvolved: [
      { name: reporters[i % 5], role: 'Policyholder', contact: `+91 ${9800000000 + i * 1234}` },
      { name: 'Field Inspector', role: 'Investigator', contact: '+91 9876543210' },
    ],
    documents: [],
    status: statuses[i % 3],
    claimId: statuses[i % 3] === 'Claim Created' ? `CLM-${String(2001 + i).padStart(4, '0')}` : undefined,
    createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    createdBy: 'demo-user-001',
  }));
}

function generateMockDocuments() {
  const categories = ['Policy', 'Claims', 'Underwriting', 'Correspondence', 'Billing', 'General'] as const;
  const types = ['Certificate', 'Application', 'Assessment Report', 'Invoice', 'Notice', 'Agreement', 'Endorsement', 'Claim Form'];
  const mimeTypes = ['application/pdf', 'application/pdf', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
  const uploaders = ['Akash Satyam', 'Priya Sharma', 'Rahul Verma', 'Sneha Patel', 'Amit Kumar'];
  return Array.from({ length: 15 }, (_, i) => ({
    id: `DOC-${String(10001 + i).padStart(5, '0')}`,
    policyId: `POL-${String(1001 + (i % 10)).padStart(4, '0')}`,
    claimId: i % 4 === 1 ? `CLM-${String(2001 + i).padStart(4, '0')}` : undefined,
    type: types[i % types.length],
    category: categories[i % categories.length],
    filename: [
      'Policy_Certificate_POL1001.pdf', 'Claim_Application_CLM2002.pdf',
      'Risk_Assessment_UW4003.pdf', 'Premium_Notice_Q1.pdf',
      'Invoice_INV30040.pdf', 'KYC_Verification.pdf',
      'Endorsement_E001.pdf', 'Loss_Report_CLM2008.pdf',
      'Property_Valuation.pdf', 'Credit_Report_CUS0109.pdf',
      'Terms_Agreement_V2.docx', 'Inspection_Photo_01.jpg',
      'Renewal_Offer_REN8013.pdf', 'Payment_Receipt_Q2.pdf',
      'Compliance_Audit_2025.pdf',
    ][i],
    mimeType: mimeTypes[i % mimeTypes.length],
    size: 50000 + Math.floor(Math.random() * 2000000),
    uploadDate: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    uploadedBy: uploaders[i % uploaders.length],
    version: 1 + Math.floor(i / 5),
    generatedFrom: i % 5 === 0 ? 'System Auto-Generated' : undefined,
    metadata: {
      isVerified: i % 3 === 0,
    },
  }));
}

function generateMockComplianceRequirements() {
  const categories = ['Regulatory', 'Financial', 'Operational', 'Data Privacy', 'Reporting'] as const;
  const statuses = ['Compliant', 'Non-Compliant', 'Due', 'In Progress', 'Not Applicable'] as const;
  const priorities = ['Low', 'Medium', 'High', 'Critical'] as const;
  const recurrences = ['One-Time', 'Monthly', 'Quarterly', 'Annual'] as const;
  const names = [
    'IRDAI Annual Filing', 'Anti-Money Laundering (AML) Compliance', 'Data Protection Audit',
    'Solvency Ratio Reporting', 'Claims Processing SLA', 'KYC Documentation Standards',
    'Premium Collection Guidelines', 'Reinsurance Treaty Compliance', 'Grievance Redressal Compliance',
    'GDPR Data Subject Rights',
  ];
  const descriptions = [
    'Submit annual regulatory filing to IRDAI with financials and operational metrics',
    'Ensure all AML policies and transaction monitoring systems are current',
    'Conduct quarterly data protection audit covering PII handling and storage',
    'Maintain and report solvency ratio above minimum threshold of 150%',
    'Process all claims within 30-day SLA as per regulatory requirement',
    'Verify and maintain KYC documentation for all active policyholders',
    'Follow RBI and IRDAI guidelines for premium collection and refund processing',
    'Ensure all reinsurance treaty terms and obligations are met',
    'Respond to all customer grievances within 15 business days',
    'Ensure compliance with GDPR data subject access and deletion requests',
  ];
  const authorities = ['IRDAI', 'RBI', 'SEBI', 'GDPR Authority', 'Internal Audit'];

  return names.map((name, i) => ({
    id: `CMP-${String(11001 + i).padStart(5, '0')}`,
    name,
    description: descriptions[i],
    category: categories[i % categories.length],
    authority: authorities[i % authorities.length],
    status: statuses[i % statuses.length],
    dueDate: i % 3 !== 2 ? `2025-${String((i % 12) + 1).padStart(2, '0')}-${String(15 + (i % 15)).padStart(2, '0')}` : undefined,
    completedDate: statuses[i % statuses.length] === 'Compliant' ? `2025-${String((i % 12) + 1).padStart(2, '0')}-10` : undefined,
    assignedTo: i % 2 === 0 ? 'demo-user-001' : undefined,
    evidence: statuses[i % statuses.length] === 'Compliant' ? `Evidence attached - Ref: EVD-${1000 + i}` : undefined,
    notes: i % 3 === 0 ? 'Review completed by compliance team' : undefined,
    priority: priorities[i % priorities.length],
    recurrence: recurrences[i % recurrences.length],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockComplianceSummary() {
  return {
    total: 10,
    compliant: 2,
    nonCompliant: 2,
    due: 2,
    inProgress: 2,
    overdueCount: 1,
    byCategory: {
      Regulatory: 2,
      Financial: 2,
      Operational: 2,
      'Data Privacy': 2,
      Reporting: 2,
    },
    byPriority: {
      Low: 2,
      Medium: 3,
      High: 3,
      Critical: 2,
    },
  };
}

function generateMockUWRules() {
  const categories = ['Risk Assessment', 'Eligibility', 'Pricing', 'Compliance'] as const;
  const decisions = ['Auto-Approve', 'Refer', 'Reject'] as const;
  const rules = [
    { name: 'Credit Score Minimum', field: 'creditScore', operator: 'gte' as const, value: 650, criteria: 'Minimum credit score for auto-approval', decision: 'Auto-Approve' as const, priority: 1 },
    { name: 'High LTV Rejection', field: 'ltvRatio', operator: 'gt' as const, value: 95, criteria: 'Reject applications with LTV above 95%', decision: 'Reject' as const, priority: 1 },
    { name: 'Age Eligibility', field: 'applicantAge', operator: 'between' as const, value: [21, 65], criteria: 'Applicant must be between 21 and 65 years', decision: 'Refer' as const, priority: 2 },
    { name: 'Premium Threshold', field: 'annualPremium', operator: 'gt' as const, value: 100000, criteria: 'Refer high-premium policies for manual review', decision: 'Refer' as const, priority: 3 },
    { name: 'Property Zone Restriction', field: 'propertyZone', operator: 'eq' as const, value: 'Zone C', criteria: 'Auto-reject applications from restricted zones', decision: 'Reject' as const, priority: 2 },
    { name: 'Income Minimum', field: 'income', operator: 'gte' as const, value: 300000, criteria: 'Minimum annual income requirement', decision: 'Auto-Approve' as const, priority: 3 },
    { name: 'High Risk Score Referral', field: 'riskScore', operator: 'gt' as const, value: 70, criteria: 'Refer high risk score applications for review', decision: 'Refer' as const, priority: 1 },
    { name: 'Low Credit Score Rejection', field: 'creditScore', operator: 'lt' as const, value: 500, criteria: 'Auto-reject very low credit scores', decision: 'Reject' as const, priority: 1 },
    { name: 'Property Value Cap', field: 'propertyValue', operator: 'lte' as const, value: 50000000, criteria: 'Max property value for standard underwriting', decision: 'Auto-Approve' as const, priority: 4 },
    { name: 'Compliance Check - AML', field: 'amlStatus', operator: 'eq' as const, value: 'Clear', criteria: 'AML check must be clear for approval', decision: 'Refer' as const, priority: 1 },
  ];

  return rules.map((rule, i) => ({
    id: `UWR-${String(12001 + i).padStart(5, '0')}`,
    ...rule,
    category: categories[i % categories.length],
    notes: `Rule ${i + 1}: ${rule.criteria}`,
    isActive: i < 8,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  }));
}

function generateMockActivity() {
  const actions = ['POLICY_CREATED', 'CLAIM_FILED', 'UW_EVALUATED', 'PAYMENT_RECORDED', 'TASK_COMPLETED'] as const;
  const entities = ['policy', 'claim', 'underwriting', 'billing', 'task'] as const;
  return Array.from({ length: 10 }, (_, i) => ({
    id: `ACT-${String(7001 + i).padStart(4, '0')}`,
    action: actions[i % 5],
    entityType: entities[i % 5],
    entityId: `ENT-${1000 + i}`,
    actor: { userId: 'demo-user-001', userName: 'Akash Satyam' },
    summary: `${actions[i % 5].replace(/_/g, ' ')} by Akash Satyam`,
    timestamp: new Date(Date.now() - i * 7200000).toISOString(),
  }));
}
