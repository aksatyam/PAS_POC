import { BaseRepository } from './base.repository';
import { BillingAccount, Invoice, Payment, LedgerEntry } from '../models';

class BillingAccountRepository extends BaseRepository<BillingAccount> {
  constructor() {
    super('billing-accounts.json');
  }

  findByPolicyId(policyId: string): BillingAccount | undefined {
    return this.loadData().find((a) => a.policyId === policyId);
  }

  findByCustomerId(customerId: string): BillingAccount[] {
    return this.loadData().filter((a) => a.customerId === customerId);
  }

  findByStatus(status: string): BillingAccount[] {
    return this.loadData().filter((a) => a.status === status);
  }

  findOverdue(): BillingAccount[] {
    return this.loadData().filter(
      (a) => a.status === 'Delinquent' || a.status === 'Grace_Period' || a.status === 'Suspended'
    );
  }
}

class InvoiceRepository extends BaseRepository<Invoice> {
  constructor() {
    super('invoices.json');
  }

  findByBillingAccountId(billingAccountId: string): Invoice[] {
    return this.loadData().filter((i) => i.billingAccountId === billingAccountId);
  }

  findByPolicyId(policyId: string): Invoice[] {
    return this.loadData().filter((i) => i.policyId === policyId);
  }

  findByStatus(status: string): Invoice[] {
    return this.loadData().filter((i) => i.status === status);
  }

  findOverdue(): Invoice[] {
    return this.loadData().filter((i) => i.status === 'Overdue');
  }
}

class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payments.json');
  }

  findByBillingAccountId(billingAccountId: string): Payment[] {
    return this.loadData().filter((p) => p.billingAccountId === billingAccountId);
  }

  findByPolicyId(policyId: string): Payment[] {
    return this.loadData().filter((p) => p.policyId === policyId);
  }

  findByStatus(status: string): Payment[] {
    return this.loadData().filter((p) => p.status === status);
  }
}

class LedgerRepository extends BaseRepository<LedgerEntry> {
  constructor() {
    super('ledger.json');
  }

  findByBillingAccountId(billingAccountId: string): LedgerEntry[] {
    return this.loadData()
      .filter((e) => e.billingAccountId === billingAccountId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  findByPolicyId(policyId: string): LedgerEntry[] {
    return this.loadData()
      .filter((e) => e.policyId === policyId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export const billingAccountRepository = new BillingAccountRepository();
export const invoiceRepository = new InvoiceRepository();
export const paymentRepository = new PaymentRepository();
export const ledgerRepository = new LedgerRepository();
