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

  '/dashboard/alerts': () => ({
    success: true,
    data: [
      { id: 'ALT-001', severity: 'error', title: 'SLA Breach Alert', message: '3 underwriting cases have exceeded 48-hour SLA. Immediate action required.', timestamp: '10 min ago' },
      { id: 'ALT-002', severity: 'warning', title: 'High-Risk Pending', message: '5 high-risk applications pending review in UW queue for >24 hours.', timestamp: '1 hr ago' },
      { id: 'ALT-003', severity: 'info', title: 'Batch Processing Complete', message: 'Servicing batch #B-2026-0305 processed successfully. 847 records updated.', timestamp: '2 hrs ago' },
      { id: 'ALT-004', severity: 'success', title: 'Monthly Reconciliation', message: 'February 2026 reconciliation completed. 99.2% match rate achieved.', timestamp: '5 hrs ago' },
      { id: 'ALT-005', severity: 'warning', title: 'Premium Collection Due', message: '12 policies with premium collection due within next 7 days.', timestamp: '6 hrs ago' },
    ],
  }),

  '/dashboard/recent-applications': () => ({
    success: true,
    data: [
      { id: 'LN-2026-0891', customer: 'Rajesh Kumar', amount: 4500000, status: 'In Review', date: '2026-03-05', stage: 'DDE' },
      { id: 'LN-2026-0890', customer: 'Priya Mehta', amount: 7200000, status: 'Approved', date: '2026-03-04', stage: 'Issuance' },
      { id: 'LN-2026-0889', customer: 'Vikram Singh', amount: 3200000, status: 'Pending', date: '2026-03-04', stage: 'QDE' },
      { id: 'LN-2026-0888', customer: 'Anita Desai', amount: 5800000, status: 'In Review', date: '2026-03-03', stage: 'Underwriting' },
      { id: 'LN-2026-0887', customer: 'Suresh Reddy', amount: 9100000, status: 'Approved', date: '2026-03-03', stage: 'Decision' },
    ],
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

  // ── Admin endpoints ────────────────────────────────────────────
  '/admin/users': () => ({
    success: true,
    data: generateMockAdminUsers(),
    pagination: { total: 8, page: 1, limit: 20, totalPages: 1 },
  }),

  '/admin/logs': () => ({
    success: true,
    data: generateMockAdminAuditLogs(),
    pagination: { total: 20, page: 1, limit: 20, totalPages: 1 },
  }),

  // ── Integrations endpoints ─────────────────────────────────────
  '/integrations/keys': () => ({
    success: true,
    data: generateMockApiKeys(),
    pagination: { total: 5, page: 1, limit: 20, totalPages: 1 },
  }),

  '/integrations/webhooks': () => ({
    success: true,
    data: generateMockWebhooks(),
    pagination: { total: 4, page: 1, limit: 20, totalPages: 1 },
  }),

  // ── Bulk operations endpoint ───────────────────────────────────
  '/bulk': () => ({
    success: true,
    data: generateMockBulkOperations(),
    pagination: { total: 6, page: 1, limit: 20, totalPages: 1 },
  }),

  // ── Products endpoint ──────────────────────────────────────────
  '/products': () => ({
    success: true,
    data: generateMockProducts(),
    pagination: { total: 6, page: 1, limit: 20, totalPages: 1 },
  }),

  // ── Service Desk endpoints ───────────────────────────────────
  '/service-desk/applications': () => ({
    success: true,
    data: generateMockServiceDeskApplications(),
  }),

  '/service-desk/auto-allocation': () => ({
    success: true,
    data: [
      { queueName: 'QDE Queue - HDFC', assignedUser: 'Priya Sharma', pendingCount: 12, lastAllocated: '2026-03-05T09:30:00Z', status: 'Active' },
      { queueName: 'QDE Queue - ICICI', assignedUser: 'Amit Kumar', pendingCount: 8, lastAllocated: '2026-03-05T08:45:00Z', status: 'Active' },
      { queueName: 'QDE Queue - SBI', assignedUser: 'Kavita Joshi', pendingCount: 15, lastAllocated: '2026-03-04T17:20:00Z', status: 'Active' },
      { queueName: 'QDE Queue - Axis', assignedUser: 'Suresh Iyer', pendingCount: 5, lastAllocated: '2026-03-05T10:00:00Z', status: 'Active' },
      { queueName: 'QDE Queue - Kotak', assignedUser: 'Deepa Nair', pendingCount: 3, lastAllocated: '2026-03-04T14:15:00Z', status: 'Paused' },
    ],
  }),

  '/service-desk/user-dashboard': () => ({
    success: true,
    data: [
      { id: 'LN-2026-0891', customer: 'Rajesh Kumar', stage: 'QDE', status: 'In Progress', dueDate: '2026-03-06T00:00:00Z', priority: 'High' },
      { id: 'LN-2026-0885', customer: 'Meera Pillai', stage: 'QDE', status: 'Pending', dueDate: '2026-03-07T00:00:00Z', priority: 'Medium' },
      { id: 'LN-2026-0878', customer: 'Karan Mehta', stage: 'QDE', status: 'In Progress', dueDate: '2026-03-05T00:00:00Z', priority: 'High' },
      { id: 'LN-2026-0872', customer: 'Suman Das', stage: 'QDE', status: 'Pending', dueDate: '2026-03-08T00:00:00Z', priority: 'Low' },
      { id: 'LN-2026-0869', customer: 'Arjun Rao', stage: 'QDE', status: 'Review', dueDate: '2026-03-06T00:00:00Z', priority: 'Medium' },
    ],
  }),

  // ── DDE endpoints ────────────────────────────────────────────
  '/dde/current': () => ({
    success: true,
    data: {
      loanId: 'LN-2026-0891', lender: 'HDFC Bank', dealId: 'DL-4521', borrowerName: 'Rajesh Kumar',
      pan: 'ABCPK1234R', mobile: '+91 9876543210', employmentType: 'Salaried', employer: 'TCS Ltd.',
      designation: 'Senior Engineer', experience: 8, salary: 125000,
      loanAmount: 4500000, tenure: 240, interestRate: 8.75, productType: 'Home Loan', purpose: 'Purchase',
      disbursementDate: '2026-04-01T00:00:00Z',
      propertyType: 'Apartment', propertyValue: 6200000, propertyLocation: 'Mumbai - Andheri West',
      grossIncome: 145000, netIncome: 118000, otherIncome: 15000,
      primaryBank: 'HDFC Bank', accountType: 'Savings', avgBalance: 285000, statementPeriod: 'Dec 2025 - Feb 2026',
      existingEmi: 18000, totalLiabilities: 320000, existingLoans: 1, creditCardOutstanding: 45000,
      ltv: 72, foir: 42, cibilScore: 742, emiNmi: 38,
    },
  }),

  '/dde/documents': () => ({
    success: true,
    data: [
      { name: 'KYC - Aadhaar', status: 'Verified' },
      { name: 'KYC - PAN Card', status: 'Verified' },
      { name: 'Income Proof - Salary Slips', status: 'Verified' },
      { name: 'Bank Statements (6M)', status: 'Pending' },
      { name: 'Property Valuation Report', status: 'Pending' },
      { name: 'Loan Sanction Letter', status: 'Verified' },
      { name: 'Title Deed', status: 'Not Uploaded' },
      { name: 'Insurance Certificate', status: 'Not Uploaded' },
    ],
  }),

  '/dde/eligibility': () => ({
    success: true,
    data: {
      maxEligible: 5200000,
      applied: 4500000,
      buffer: 700000,
    },
  }),

  // ── Finance endpoints ────────────────────────────────────────
  '/finance/summary': () => ({
    success: true,
    data: {
      totalRevenue: 127500000,
      outstanding: 18450000,
      collected: 109050000,
      reconciledPct: 96.8,
    },
  }),

  '/finance/invoices': () => ({
    success: true,
    data: generateMockFinanceInvoices(),
  }),

  '/finance/payments': () => ({
    success: true,
    data: generateMockFinancePayments(),
  }),

  '/finance/reconciliation': () => ({
    success: true,
    data: {
      matched: 847,
      unmatched: 23,
      pending: 15,
      entries: generateMockReconciliationEntries(),
    },
  }),

  // ── Servicing endpoints ──────────────────────────────────────
  '/servicing/npa': () => ({
    success: true,
    data: generateMockNPA(),
  }),

  '/servicing/delinquency': () => ({
    success: true,
    data: {
      totalDelinquent: 156,
      avgDPD: 45,
      recoveryRate: 72.4,
      entries: generateMockDelinquencyEntries(),
    },
  }),

  '/servicing/batches': () => ({
    success: true,
    data: [
      { id: 'B-2026-0305', lender: 'HDFC Bank', month: 'Feb 2026', records: 1247, status: 'Processed', uploadDate: '2026-03-05T09:00:00Z' },
      { id: 'B-2026-0228', lender: 'ICICI Bank', month: 'Feb 2026', records: 892, status: 'Processed', uploadDate: '2026-02-28T14:30:00Z' },
      { id: 'B-2026-0225', lender: 'SBI', month: 'Feb 2026', records: 2134, status: 'Processed', uploadDate: '2026-02-25T11:00:00Z' },
      { id: 'B-2026-0220', lender: 'Axis Bank', month: 'Jan 2026', records: 567, status: 'Processed', uploadDate: '2026-02-20T16:45:00Z' },
      { id: 'B-2026-0215', lender: 'Kotak Mahindra', month: 'Jan 2026', records: 345, status: 'Error', uploadDate: '2026-02-15T10:20:00Z' },
    ],
  }),

  // ── Audit Logs endpoint ──────────────────────────────────────
  '/audit-logs': () => ({
    success: true,
    data: generateMockFieldAuditLogs(),
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

  // Underwriting detail
  match = endpoint.match(/^\/underwriting\/(UW-\d+)$/);
  if (match) {
    const records = generateMockUnderwriting();
    const record = records.find(r => r.id === match![1]) || records[0];
    return {
      success: true,
      data: {
        ...record,
        applicantName: ['Rajesh Kumar', 'Sunita Patel', 'Amit Singh', 'Neha Sharma', 'Vikram Reddy'][Math.floor(Math.random() * 5)],
        loanAmount: Math.round(record.propertyValue * record.ltvRatio / 100),
        aiRecommendation: {
          decision: record.decision === 'Auto-Approve' ? 'Approve' : record.decision,
          confidence: record.riskScore < 40 ? 92 : record.riskScore < 60 ? 74 : 61,
          summary: `Based on comprehensive analysis of ${record.rulesApplied?.length || 3} underwriting rules, the application shows a ${record.riskScore < 40 ? 'low' : record.riskScore < 60 ? 'moderate' : 'high'} risk profile.`,
          factors: [
            { label: 'Credit Score', impact: (record.creditScore >= 700 ? 'positive' : 'negative') as 'positive' | 'negative', detail: `Score of ${record.creditScore}` },
            { label: 'LTV Ratio', impact: (record.ltvRatio <= 75 ? 'positive' : 'negative') as 'positive' | 'negative', detail: `${record.ltvRatio}% LTV` },
            { label: 'Income Adequacy', impact: 'positive' as const, detail: `Annual income ${record.income.toLocaleString()}` },
            { label: 'Property Zone', impact: 'neutral' as const, detail: `${record.propertyZone} classification` },
          ],
        },
        comments: [
          { user: 'Priya Sharma', role: 'Underwriter', text: 'Credit score is strong. Reviewing property valuation.', time: '2 hrs ago' },
          { user: 'Rahul Verma', role: 'Senior UW', text: 'Property valuation report received. Recommend proceeding with standard terms.', time: '1 hr ago' },
        ],
        timeline: [
          { id: 'tl-1', title: 'Case Created', description: 'Application submitted via QDE', timestamp: '2026-03-01T09:00:00Z', status: 'success' },
          { id: 'tl-2', title: 'DDE Completed', description: 'Data entry verified', timestamp: '2026-03-02T14:30:00Z', status: 'success' },
          { id: 'tl-3', title: 'UW Assigned', description: 'Auto-assigned to Rahul Verma', timestamp: '2026-03-03T10:00:00Z', status: 'success' },
          { id: 'tl-4', title: 'AI Analysis', description: `Risk score: ${record.riskScore}`, timestamp: '2026-03-04T11:15:00Z', status: 'info' },
          { id: 'tl-5', title: 'Pending Decision', description: 'Awaiting underwriter review', timestamp: '2026-03-05T08:00:00Z', status: 'warning' },
        ],
      },
    };
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
  const npaCategories = ['Standard', 'Sub-Standard', 'Doubtful', 'Loss'] as const;
  const adjStatuses = ['Investigation', 'Evaluation', 'Negotiation', 'Settlement'] as const;
  return Array.from({ length: 15 }, (_, i) => {
    const dpd = i < 5 ? 0 : [30, 45, 60, 90, 120, 150, 180][i % 7];
    return {
      id: `CLM-${String(2001 + i).padStart(4, '0')}`,
      policyId: `POL-${String(1001 + (i % 10)).padStart(4, '0')}`,
      claimType: types[i % 4],
      description: `Claim for ${types[i % 4].toLowerCase()} - case ${i + 1}`,
      amount: 100000 + Math.floor(Math.random() * 500000),
      status: statuses[i % 5],
      filedDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      assignedTo: 'Rahul Verma',
      dpd,
      npaCategory: dpd > 90 ? npaCategories[3] : dpd > 60 ? npaCategories[2] : dpd > 30 ? npaCategories[1] : npaCategories[0],
      adjudicationStatus: i % 3 === 0 ? adjStatuses[i % 4] : undefined,
      fraudScore: i % 4 === 2 ? 65 + (i * 3) : i % 5 === 0 ? 15 + i : undefined,
      documents: [],
      createdBy: 'demo-user-001',
      updatedAt: '2024-06-15T10:00:00Z',
    };
  });
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

function generateMockAdminUsers() {
  const users = [
    { name: 'Akash Satyam', email: 'admin@imgc.com', role: 'Admin' as const, isActive: true },
    { name: 'Priya Sharma', email: 'underwriter@imgc.com', role: 'Underwriter' as const, isActive: true },
    { name: 'Rahul Verma', email: 'claims@imgc.com', role: 'Claims' as const, isActive: true },
    { name: 'Sneha Patel', email: 'ops@imgc.com', role: 'Operations' as const, isActive: true },
    { name: 'Amit Kumar', email: 'viewer@imgc.com', role: 'Viewer' as const, isActive: true },
    { name: 'Kavita Joshi', email: 'kavita.joshi@imgc.com', role: 'Underwriter' as const, isActive: true },
    { name: 'Suresh Iyer', email: 'suresh.iyer@imgc.com', role: 'Claims' as const, isActive: false },
    { name: 'Deepa Nair', email: 'deepa.nair@imgc.com', role: 'Viewer' as const, isActive: true },
  ];
  return users.map((u, i) => ({
    id: `USR-${String(1001 + i).padStart(4, '0')}`,
    ...u,
    createdAt: new Date(Date.now() - (users.length - i) * 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  }));
}

function generateMockAdminAuditLogs() {
  const actions = [
    'User Login', 'Policy Created', 'Policy Updated', 'Claim Filed', 'Claim Approved',
    'User Role Changed', 'Payment Recorded', 'UW Evaluation', 'Document Uploaded', 'Settings Updated',
    'Policy Cancelled', 'User Created', 'Bulk Operation Executed', 'Report Exported',
    'Webhook Configured', 'API Key Generated', 'Compliance Updated', 'Rule Modified',
    'Password Reset', 'Session Expired',
  ];
  const resources = ['Policy', 'Claim', 'User', 'Billing', 'Underwriting', 'Document', 'System'];
  const actors = [
    { userId: 'USR-1001', role: 'Admin' },
    { userId: 'USR-1002', role: 'Underwriter' },
    { userId: 'USR-1003', role: 'Claims' },
    { userId: 'USR-1004', role: 'Operations' },
    { userId: 'USR-1005', role: 'Viewer' },
  ];
  const ips = ['192.168.1.10', '10.0.0.25', '172.16.0.50', '192.168.2.100', '10.1.1.15'];
  return Array.from({ length: 20 }, (_, i) => ({
    id: `LOG-${String(20001 + i).padStart(5, '0')}`,
    actor: actors[i % actors.length],
    action: actions[i % actions.length],
    resource: { type: resources[i % resources.length], id: `${resources[i % resources.length].toUpperCase().slice(0, 3)}-${1000 + i}` },
    ipAddress: ips[i % ips.length],
    timestamp: new Date(Date.now() - i * 3600000 * 4).toISOString(),
    before: i % 3 === 0 ? { status: 'Active' } : undefined,
    after: i % 3 === 0 ? { status: 'Updated' } : undefined,
    metadata: { browser: 'Chrome 120', os: 'Windows 11' },
  }));
}

function generateMockApiKeys() {
  const keys = [
    { name: 'Production API Key', permissions: ['policies.read', 'policies.write', 'claims.read', 'claims.write'], rateLimit: 500, usageCount: 12450 },
    { name: 'Analytics Dashboard', permissions: ['policies.read', 'claims.read', 'billing.read'], rateLimit: 200, usageCount: 8320 },
    { name: 'Mobile App Integration', permissions: ['policies.read', 'documents.read'], rateLimit: 100, usageCount: 3210 },
    { name: 'Partner Portal', permissions: ['policies.read', 'underwriting.read'], rateLimit: 150, usageCount: 1560 },
    { name: 'Legacy System Sync', permissions: ['policies.read', 'policies.write', 'billing.read', 'billing.write', 'payments.write'], rateLimit: 1000, usageCount: 45200 },
  ];
  return keys.map((k, i) => ({
    id: `KEY-${String(30001 + i).padStart(5, '0')}`,
    ...k,
    key: `imgc_${i === 0 ? 'live' : 'test'}_${String.fromCharCode(65 + i)}${'x'.repeat(20)}${'0'.repeat(8)}`,
    isActive: i !== 3,
    lastUsedAt: i < 3 ? new Date(Date.now() - i * 3600000).toISOString() : undefined,
    createdAt: new Date(Date.now() - (keys.length - i) * 86400000 * 60).toISOString(),
  }));
}

function generateMockWebhooks() {
  const webhooks = [
    { name: 'Policy Events Webhook', url: 'https://partner-api.example.com/webhooks/policies', events: ['policy.created', 'policy.updated', 'policy.cancelled'], status: 'Active', failureCount: 0, lastDeliveryStatus: 200 },
    { name: 'Claims Notification', url: 'https://claims-system.example.com/hooks/claims', events: ['claim.filed', 'claim.updated', 'claim.settled'], status: 'Active', failureCount: 2, lastDeliveryStatus: 200 },
    { name: 'Underwriting Integration', url: 'https://uw-engine.example.com/api/webhook', events: ['underwriting.evaluated', 'underwriting.overridden'], status: 'Active', failureCount: 0, lastDeliveryStatus: 200 },
    { name: 'Payment Alerts (Disabled)', url: 'https://billing.example.com/alerts', events: ['payment.recorded', 'invoice.generated'], status: 'Inactive', failureCount: 5, lastDeliveryStatus: 500 },
  ];
  return webhooks.map((w, i) => ({
    id: `WHK-${String(40001 + i).padStart(5, '0')}`,
    ...w,
    secret: `whsec_${'x'.repeat(24)}`,
    lastDeliveryAt: i < 3 ? new Date(Date.now() - i * 7200000).toISOString() : undefined,
    maxRetries: 3,
    createdAt: new Date(Date.now() - (webhooks.length - i) * 86400000 * 45).toISOString(),
  }));
}

function generateMockBulkOperations() {
  const ops = [
    { type: 'renewal', status: 'Completed', totalItems: 45, processedItems: 45, successCount: 42, failureCount: 3 },
    { type: 'cancel', status: 'Completed', totalItems: 12, processedItems: 12, successCount: 12, failureCount: 0 },
    { type: 'claim-update', status: 'Completed', totalItems: 28, processedItems: 28, successCount: 25, failureCount: 3 },
    { type: 'invoice', status: 'Completed', totalItems: 150, processedItems: 150, successCount: 148, failureCount: 2 },
    { type: 'renewal', status: 'Partial', totalItems: 60, processedItems: 55, successCount: 50, failureCount: 5 },
    { type: 'claim-update', status: 'Failed', totalItems: 20, processedItems: 8, successCount: 3, failureCount: 5 },
  ];
  return ops.map((op, i) => ({
    id: `BULK-${String(50001 + i).padStart(5, '0')}`,
    ...op,
    results: Array.from({ length: Math.min(op.processedItems, 5) }, (_, j) => ({
      entityId: `POL-${String(1001 + j).padStart(4, '0')}`,
      success: j < op.successCount,
      message: j < op.successCount ? 'Processed successfully' : 'Validation error: missing required field',
    })),
    startedAt: new Date(Date.now() - (ops.length - i) * 86400000 * 7).toISOString(),
    completedAt: op.status !== 'Processing' ? new Date(Date.now() - (ops.length - i) * 86400000 * 7 + 300000).toISOString() : undefined,
    createdBy: 'Akash Satyam',
  }));
}

function generateMockProducts() {
  const products = [
    {
      name: 'IMGC Mortgage Guarantee Standard', code: 'MGS-001', description: 'Standard mortgage guarantee insurance product covering residential properties up to ₹5 Cr',
      status: 'Active' as const, policyType: 'Mortgage Guarantee' as const, defaultTermMonths: 240, minPremium: 15000, maxPremium: 500000, commissionRate: 8.5,
      coverageOptions: [
        { name: 'Standard Coverage', minAmount: 1000000, maxAmount: 50000000, defaultAmount: 5000000 },
        { name: 'Extended Coverage', minAmount: 5000000, maxAmount: 100000000, defaultAmount: 25000000 },
      ],
      eligibilityCriteria: [
        { field: 'creditScore', label: 'Credit Score', operator: 'gte', value: 650 },
        { field: 'ltvRatio', label: 'LTV Ratio', operator: 'lte', value: 90 },
        { field: 'applicantAge', label: 'Applicant Age', operator: 'between', value: [21, 65] },
      ],
      requiredDocuments: ['KYC Documents', 'Income Proof', 'Property Valuation Report', 'Loan Sanction Letter'],
    },
    {
      name: 'IMGC Credit Protection Plus', code: 'CPP-001', description: 'Credit protection insurance for personal and business loans with job loss coverage',
      status: 'Active' as const, policyType: 'Credit Protection' as const, defaultTermMonths: 60, minPremium: 5000, maxPremium: 200000, commissionRate: 10.0,
      coverageOptions: [
        { name: 'Basic Protection', minAmount: 500000, maxAmount: 10000000, defaultAmount: 2000000 },
        { name: 'Premium Protection', minAmount: 2000000, maxAmount: 50000000, defaultAmount: 10000000 },
      ],
      eligibilityCriteria: [
        { field: 'creditScore', label: 'Credit Score', operator: 'gte', value: 600 },
        { field: 'income', label: 'Annual Income', operator: 'gte', value: 300000 },
      ],
      requiredDocuments: ['KYC Documents', 'Income Proof', 'Employment Certificate'],
    },
    {
      name: 'IMGC Coverage Plus Elite', code: 'CPE-001', description: 'Comprehensive coverage combining mortgage guarantee with additional property protection',
      status: 'Active' as const, policyType: 'Coverage Plus' as const, defaultTermMonths: 120, minPremium: 25000, maxPremium: 750000, commissionRate: 12.0,
      coverageOptions: [
        { name: 'Elite Coverage', minAmount: 5000000, maxAmount: 200000000, defaultAmount: 50000000 },
      ],
      eligibilityCriteria: [
        { field: 'creditScore', label: 'Credit Score', operator: 'gte', value: 700 },
        { field: 'propertyValue', label: 'Property Value', operator: 'gte', value: 5000000 },
        { field: 'ltvRatio', label: 'LTV Ratio', operator: 'lte', value: 80 },
      ],
      requiredDocuments: ['KYC Documents', 'Income Proof', 'Property Valuation Report', 'Loan Sanction Letter', 'Property Insurance Certificate'],
    },
    {
      name: 'IMGC Affordable Housing Guarantee', code: 'AHG-001', description: 'Special mortgage guarantee for affordable housing segment with relaxed eligibility',
      status: 'Active' as const, policyType: 'Mortgage Guarantee' as const, defaultTermMonths: 300, minPremium: 5000, maxPremium: 100000, commissionRate: 6.0,
      coverageOptions: [
        { name: 'Affordable Coverage', minAmount: 500000, maxAmount: 5000000, defaultAmount: 2000000 },
      ],
      eligibilityCriteria: [
        { field: 'creditScore', label: 'Credit Score', operator: 'gte', value: 550 },
        { field: 'income', label: 'Annual Income', operator: 'lte', value: 600000 },
      ],
      requiredDocuments: ['KYC Documents', 'Income Proof', 'PMAY Eligibility Certificate'],
    },
    {
      name: 'IMGC Commercial Property Guarantee', code: 'CMPG-001', description: 'Mortgage guarantee for commercial properties and business premises',
      status: 'Draft' as const, policyType: 'Mortgage Guarantee' as const, defaultTermMonths: 180, minPremium: 50000, maxPremium: 2000000, commissionRate: 7.5,
      coverageOptions: [
        { name: 'Commercial Standard', minAmount: 10000000, maxAmount: 500000000, defaultAmount: 50000000 },
      ],
      eligibilityCriteria: [
        { field: 'creditScore', label: 'Credit Score', operator: 'gte', value: 700 },
        { field: 'propertyValue', label: 'Property Value', operator: 'gte', value: 10000000 },
      ],
      requiredDocuments: ['KYC Documents', 'Business Registration', 'Financial Statements', 'Property Valuation Report', 'Commercial Lease Agreement'],
    },
    {
      name: 'IMGC Rural Housing Guarantee', code: 'RHG-001', description: 'Mortgage guarantee tailored for rural housing projects and self-construction',
      status: 'Inactive' as const, policyType: 'Mortgage Guarantee' as const, defaultTermMonths: 240, minPremium: 3000, maxPremium: 50000, commissionRate: 5.0,
      coverageOptions: [
        { name: 'Rural Coverage', minAmount: 200000, maxAmount: 2500000, defaultAmount: 1000000 },
      ],
      eligibilityCriteria: [
        { field: 'creditScore', label: 'Credit Score', operator: 'gte', value: 500 },
      ],
      requiredDocuments: ['KYC Documents', 'Income Proof', 'Land Ownership Certificate'],
    },
  ];
  return products.map((p, i) => ({
    id: `PRD-${String(60001 + i).padStart(5, '0')}`,
    ...p,
    createdAt: new Date(Date.now() - (products.length - i) * 86400000 * 90).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000 * 15).toISOString(),
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

function generateMockServiceDeskApplications() {
  const lenders = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra'];
  const stages = ['QDE', 'DDE', 'Underwriting', 'Decision', 'Issuance'] as const;
  const statuses = ['In Progress', 'Pending', 'Review', 'Approved', 'Submitted'] as const;
  const customers = ['Rajesh Kumar', 'Priya Mehta', 'Vikram Singh', 'Anita Desai', 'Suresh Reddy',
    'Kavita Joshi', 'Manoj Tiwari', 'Deepa Nair', 'Rohit Malhotra', 'Suman Das',
    'Arjun Rao', 'Meera Pillai', 'Karan Mehta', 'Sneha Reddy', 'Amit Patel'];
  return Array.from({ length: 15 }, (_, i) => ({
    id: `LN-2026-${String(891 - i).padStart(4, '0')}`,
    customer: customers[i],
    lender: lenders[i % 5],
    amount: 2000000 + i * 500000,
    stage: stages[i % 5],
    status: statuses[i % 5],
    date: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockFinanceInvoices() {
  const lenders = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra'];
  const types = ['Premium', 'Processing Fee', 'Guarantee Fee', 'Renewal Fee'];
  const statuses = ['Paid', 'Pending', 'Overdue', 'Paid', 'Paid'] as const;
  return Array.from({ length: 12 }, (_, i) => ({
    id: `INV-2026-${String(1001 + i).padStart(4, '0')}`,
    lender: lenders[i % 5],
    dealId: `DL-${4500 + i}`,
    type: types[i % 4],
    amount: 50000 + i * 25000,
    status: statuses[i % 5],
    date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  }));
}

function generateMockFinancePayments() {
  const methods = ['NEFT', 'RTGS', 'UPI', 'Cheque', 'IMPS'];
  const statuses = ['Completed', 'Completed', 'Processing', 'Completed', 'Failed'] as const;
  return Array.from({ length: 10 }, (_, i) => ({
    id: `PAY-2026-${String(5001 + i).padStart(4, '0')}`,
    invoiceId: `INV-2026-${String(1001 + i).padStart(4, '0')}`,
    amount: 50000 + i * 25000,
    method: methods[i % 5],
    status: statuses[i % 5],
    processedDate: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  }));
}

function generateMockReconciliationEntries() {
  const statuses = ['Matched', 'Matched', 'Unmatched', 'Pending', 'Matched'] as const;
  return Array.from({ length: 10 }, (_, i) => ({
    id: `REC-${String(7001 + i).padStart(4, '0')}`,
    invoiceId: `INV-2026-${String(1001 + i).padStart(4, '0')}`,
    paymentId: statuses[i % 5] !== 'Unmatched' ? `PAY-2026-${String(5001 + i).padStart(4, '0')}` : '—',
    amount: 50000 + i * 25000,
    status: statuses[i % 5],
    date: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function generateMockNPA() {
  const npaCategories = ['Sub-Standard', 'Doubtful', 'Loss', 'Sub-Standard', 'Doubtful'] as const;
  const statuses = ['Active', 'Recovery', 'Written Off', 'Active', 'Recovery'] as const;
  const customers = ['Ramesh Gupta', 'Sunita Devi', 'Harish Chandra', 'Pooja Verma', 'Rajiv Menon',
    'Geeta Sharma', 'Mohan Lal', 'Nisha Patel', 'Vijay Kumar', 'Lakshmi Iyer'];
  return Array.from({ length: 10 }, (_, i) => ({
    loanId: `LN-2025-${String(500 + i).padStart(4, '0')}`,
    customer: customers[i],
    dpd: 30 + i * 15,
    npaCategory: npaCategories[i % 5],
    outstanding: 500000 + i * 250000,
    status: statuses[i % 5],
  }));
}

function generateMockDelinquencyEntries() {
  const buckets = ['30-60 DPD', '60-90 DPD', '90-120 DPD', '120+ DPD'];
  const statuses = ['Notice Sent', 'Follow Up', 'Legal', 'Recovery', 'Settled'] as const;
  const customers = ['Anil Sharma', 'Bhavna Patel', 'Chetan Desai', 'Divya Nair', 'Eshan Reddy',
    'Farhan Ali', 'Gauri Singh', 'Hemant Joshi', 'Isha Mehta', 'Jayant Rao'];
  return Array.from({ length: 10 }, (_, i) => ({
    loanId: `LN-2025-${String(600 + i).padStart(4, '0')}`,
    customer: customers[i],
    dpd: 35 + i * 12,
    amount: 200000 + i * 100000,
    bucket: buckets[Math.min(Math.floor(i / 3), 3)],
    status: statuses[i % 5],
  }));
}

function generateMockFieldAuditLogs() {
  const modules = ['Policy', 'Claims', 'Underwriting', 'Finance', 'Servicing'];
  const users = ['Akash Satyam', 'Priya Sharma', 'Rahul Verma', 'Sneha Patel', 'Amit Kumar'];
  const changes = [
    { field: 'Status', oldValue: 'Draft', newValue: 'Active', entityId: 'POL-1001' },
    { field: 'Premium Amount', oldValue: '₹45,000', newValue: '₹52,000', entityId: 'POL-1003' },
    { field: 'Claim Status', oldValue: 'Filed', newValue: 'Under Review', entityId: 'CLM-2001' },
    { field: 'Risk Score', oldValue: '42', newValue: '38', entityId: 'UW-4005' },
    { field: 'Payment Status', oldValue: 'Pending', newValue: 'Completed', entityId: 'PAY-5001' },
    { field: 'NPA Category', oldValue: '', newValue: 'Sub-Standard', entityId: 'LN-2025-0500' },
    { field: 'LTV Ratio', oldValue: '78%', newValue: '72%', entityId: 'LN-2026-0891' },
    { field: 'Coverage Amount', oldValue: '₹50,00,000', newValue: '₹75,00,000', entityId: 'POL-1007' },
    { field: 'Assigned To', oldValue: 'Priya Sharma', newValue: 'Kavita Joshi', entityId: 'UW-4002' },
    { field: 'Deal Status', oldValue: 'Active', newValue: 'Closed', entityId: 'DL-4521' },
    { field: 'CIBIL Score', oldValue: '710', newValue: '742', entityId: 'LN-2026-0891' },
    { field: 'Invoice Amount', oldValue: '₹1,25,000', newValue: '₹1,30,000', entityId: 'INV-2026-1001' },
    { field: 'Delinquency Bucket', oldValue: '30-60 DPD', newValue: '60-90 DPD', entityId: 'LN-2025-0600' },
    { field: 'Policy Type', oldValue: 'Standard', newValue: 'Enhanced', entityId: 'POL-1012' },
    { field: 'Claim Amount', oldValue: '₹2,50,000', newValue: '₹3,15,000', entityId: 'CLM-2004' },
  ];
  return changes.map((change, i) => ({
    id: `AUD-${String(30001 + i).padStart(5, '0')}`,
    timestamp: new Date(Date.now() - i * 3600000 * 3).toISOString(),
    user: users[i % 5],
    module: modules[i % 5],
    ...change,
  }));
}
