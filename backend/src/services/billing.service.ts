import {
  BillingAccount, Invoice, Payment, LedgerEntry,
  PaymentFrequency, InstallmentPlan, Installment,
  BillingSummary, AgingBucket,
} from '../models';
import {
  billingAccountRepository, invoiceRepository,
  paymentRepository, ledgerRepository,
} from '../repositories/billing.repository';
import { generateId } from '../utils/id-generator';

export class BillingService {
  // ── Billing Accounts ──

  listAccounts(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: string; policyId?: string; customerId?: string }
  ): { data: BillingAccount[]; total: number } {
    let all = billingAccountRepository.findAll();
    if (filters?.status) all = all.filter((a) => a.status === filters.status);
    if (filters?.policyId) all = all.filter((a) => a.policyId === filters.policyId);
    if (filters?.customerId) all = all.filter((a) => a.customerId === filters.customerId);
    all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return billingAccountRepository.paginate(all, page, limit);
  }

  getAccount(id: string): BillingAccount | undefined {
    return billingAccountRepository.findById(id);
  }

  getAccountByPolicy(policyId: string): BillingAccount | undefined {
    return billingAccountRepository.findByPolicyId(policyId);
  }

  async createAccount(data: Partial<BillingAccount>): Promise<BillingAccount> {
    const account: BillingAccount = {
      id: generateId('BA'),
      policyId: data.policyId || '',
      customerId: data.customerId || '',
      paymentFrequency: data.paymentFrequency || 'Monthly',
      totalPremium: data.totalPremium || 0,
      balance: data.totalPremium || 0,
      status: 'Active',
      paymentMethod: data.paymentMethod || 'ACH',
      autopay: data.autopay || false,
      gracePeriodDays: data.gracePeriodDays || 30,
      nextDueDate: data.nextDueDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await billingAccountRepository.create(account);

    // Create initial premium ledger entry
    await this.addLedgerEntry({
      billingAccountId: account.id,
      policyId: account.policyId,
      type: 'Premium',
      description: `Annual premium charged - ${account.paymentFrequency} billing`,
      debit: account.totalPremium,
      credit: 0,
    });

    return account;
  }

  async updateAccount(id: string, updates: Partial<BillingAccount>): Promise<BillingAccount | undefined> {
    const updated = await billingAccountRepository.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return updated;
  }

  getOverdueAccounts(): BillingAccount[] {
    return billingAccountRepository.findOverdue();
  }

  // ── Invoices ──

  listInvoices(
    page: number = 1,
    limit: number = 20,
    filters?: { billingAccountId?: string; policyId?: string; status?: string }
  ): { data: Invoice[]; total: number } {
    let all = invoiceRepository.findAll();
    if (filters?.billingAccountId) all = all.filter((i) => i.billingAccountId === filters.billingAccountId);
    if (filters?.policyId) all = all.filter((i) => i.policyId === filters.policyId);
    if (filters?.status) all = all.filter((i) => i.status === filters.status);
    all.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    return invoiceRepository.paginate(all, page, limit);
  }

  getInvoice(id: string): Invoice | undefined {
    return invoiceRepository.findById(id);
  }

  getInvoicesByAccount(billingAccountId: string): Invoice[] {
    return invoiceRepository.findByBillingAccountId(billingAccountId)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const invCount = invoiceRepository.findAll().length + 1;
    const invoice: Invoice = {
      id: generateId('INV'),
      billingAccountId: data.billingAccountId || '',
      policyId: data.policyId || '',
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invCount).padStart(4, '0')}`,
      amount: data.amount || 0,
      amountPaid: 0,
      dueDate: data.dueDate || '',
      status: 'Pending',
      lineItems: data.lineItems || [],
      issuedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    await invoiceRepository.create(invoice);
    return invoice;
  }

  async voidInvoice(id: string): Promise<Invoice | undefined> {
    return invoiceRepository.update(id, { status: 'Void' });
  }

  // ── Payments ──

  listPayments(
    page: number = 1,
    limit: number = 20,
    filters?: { billingAccountId?: string; policyId?: string; status?: string }
  ): { data: Payment[]; total: number } {
    let all = paymentRepository.findAll();
    if (filters?.billingAccountId) all = all.filter((p) => p.billingAccountId === filters.billingAccountId);
    if (filters?.policyId) all = all.filter((p) => p.policyId === filters.policyId);
    if (filters?.status) all = all.filter((p) => p.status === filters.status);
    all.sort((a, b) => new Date(b.processedDate).getTime() - new Date(a.processedDate).getTime());
    return paymentRepository.paginate(all, page, limit);
  }

  getPayment(id: string): Payment | undefined {
    return paymentRepository.findById(id);
  }

  getPaymentsByAccount(billingAccountId: string): Payment[] {
    return paymentRepository.findByBillingAccountId(billingAccountId)
      .sort((a, b) => new Date(b.processedDate).getTime() - new Date(a.processedDate).getTime());
  }

  async recordPayment(data: Partial<Payment>, userId: string): Promise<Payment> {
    const payment: Payment = {
      id: generateId('PAY'),
      billingAccountId: data.billingAccountId || '',
      invoiceId: data.invoiceId,
      policyId: data.policyId || '',
      amount: data.amount || 0,
      method: data.method || 'ACH',
      reference: data.reference || generateId('REF'),
      status: 'Completed',
      processedDate: new Date().toISOString(),
      recordedBy: userId,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    await paymentRepository.create(payment);

    // Update invoice if linked
    if (payment.invoiceId) {
      const invoice = invoiceRepository.findById(payment.invoiceId);
      if (invoice) {
        const newAmountPaid = invoice.amountPaid + payment.amount;
        const newStatus = newAmountPaid >= invoice.amount ? 'Paid' : 'Partially_Paid';
        await invoiceRepository.update(invoice.id, {
          amountPaid: newAmountPaid,
          status: newStatus,
          paidDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
        });
      }
    }

    // Update billing account balance
    const account = billingAccountRepository.findById(payment.billingAccountId);
    if (account) {
      const newBalance = Math.max(0, account.balance - payment.amount);
      await billingAccountRepository.update(account.id, {
        balance: newBalance,
        lastPaymentDate: payment.processedDate,
        lastPaymentAmount: payment.amount,
        status: newBalance === 0 ? 'Active' : account.status,
        updatedAt: new Date().toISOString(),
      });
    }

    // Add ledger entry
    await this.addLedgerEntry({
      billingAccountId: payment.billingAccountId,
      policyId: payment.policyId,
      type: 'Payment',
      description: `Payment received - ${payment.method} (${payment.reference})`,
      debit: 0,
      credit: payment.amount,
      referenceId: payment.id,
    });

    return payment;
  }

  // ── Ledger ──

  getLedger(billingAccountId: string): LedgerEntry[] {
    return ledgerRepository.findByBillingAccountId(billingAccountId);
  }

  getLedgerByPolicy(policyId: string): LedgerEntry[] {
    return ledgerRepository.findByPolicyId(policyId);
  }

  private async addLedgerEntry(data: Partial<LedgerEntry>): Promise<LedgerEntry> {
    // Calculate running balance
    const existing = ledgerRepository.findByBillingAccountId(data.billingAccountId || '');
    const lastBalance = existing.length > 0 ? existing[existing.length - 1].balance : 0;
    const newBalance = lastBalance + (data.debit || 0) - (data.credit || 0);

    const entry: LedgerEntry = {
      id: generateId('LED'),
      billingAccountId: data.billingAccountId || '',
      policyId: data.policyId || '',
      type: data.type || 'Adjustment',
      description: data.description || '',
      debit: data.debit || 0,
      credit: data.credit || 0,
      balance: newBalance,
      referenceId: data.referenceId,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await ledgerRepository.create(entry);
    return entry;
  }

  // ── Installment Plan ──

  calculateInstallments(
    totalPremium: number,
    frequency: PaymentFrequency,
    startDate: string
  ): InstallmentPlan {
    const frequencyMap: Record<PaymentFrequency, number> = {
      Annual: 1,
      'Semi-Annual': 2,
      Quarterly: 4,
      Monthly: 12,
    };

    const numInstallments = frequencyMap[frequency];
    const installmentAmount = Math.round((totalPremium / numInstallments) * 100) / 100;
    const monthsBetween = 12 / numInstallments;

    const installments: Installment[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + i * monthsBetween);
      installments.push({
        number: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: i === numInstallments - 1
          ? Math.round((totalPremium - installmentAmount * (numInstallments - 1)) * 100) / 100
          : installmentAmount,
        status: 'Scheduled',
      });
    }

    return {
      id: generateId('INST'),
      billingAccountId: '',
      policyId: '',
      totalPremium,
      frequency,
      numberOfInstallments: numInstallments,
      installmentAmount,
      installments,
      createdAt: new Date().toISOString(),
    };
  }

  // ── Summary / Aging ──

  getSummary(): BillingSummary {
    const accounts = billingAccountRepository.findAll();
    const invoices = invoiceRepository.findAll();
    const payments = paymentRepository.findAll();

    const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
    const totalCollected = payments
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate aging buckets
    const now = new Date();
    const agingBuckets: AgingBucket[] = [
      { label: 'Current', count: 0, amount: 0 },
      { label: '1-30 Days', count: 0, amount: 0 },
      { label: '31-60 Days', count: 0, amount: 0 },
      { label: '61-90 Days', count: 0, amount: 0 },
      { label: '90+ Days', count: 0, amount: 0 },
    ];

    for (const inv of overdueInvoices) {
      const due = new Date(inv.dueDate);
      const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      const outstanding = inv.amount - inv.amountPaid;

      if (daysOverdue <= 0) {
        agingBuckets[0].count++;
        agingBuckets[0].amount += outstanding;
      } else if (daysOverdue <= 30) {
        agingBuckets[1].count++;
        agingBuckets[1].amount += outstanding;
      } else if (daysOverdue <= 60) {
        agingBuckets[2].count++;
        agingBuckets[2].amount += outstanding;
      } else if (daysOverdue <= 90) {
        agingBuckets[3].count++;
        agingBuckets[3].amount += outstanding;
      } else {
        agingBuckets[4].count++;
        agingBuckets[4].amount += outstanding;
      }
    }

    // Also include pending invoices in "Current"
    const pendingInvoices = invoices.filter((i) => i.status === 'Pending');
    for (const inv of pendingInvoices) {
      agingBuckets[0].count++;
      agingBuckets[0].amount += inv.amount - inv.amountPaid;
    }

    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter((a) => a.status === 'Active').length,
      totalOutstanding: accounts.reduce((sum, a) => sum + a.balance, 0),
      totalOverdue: overdueInvoices.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0),
      overdueCount: overdueInvoices.length,
      totalCollected,
      agingBuckets,
    };
  }
}

export const billingService = new BillingService();
