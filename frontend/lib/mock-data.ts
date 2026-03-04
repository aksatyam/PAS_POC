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
    data: [],
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
