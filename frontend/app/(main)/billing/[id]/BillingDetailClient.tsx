'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { BillingAccount, Invoice, Payment, LedgerEntry } from '@/types';
import LedgerView from '@/components/billing/LedgerView';
import PaymentDialog from '@/components/billing/PaymentDialog';
import InvoiceView from '@/components/billing/InvoiceView';
import {
  ChevronRight, ArrowLeft, DollarSign, FileText, CreditCard,
  BookOpen, Clock, CheckCircle, XCircle, AlertTriangle, Eye,
} from 'lucide-react';

type TabKey = 'overview' | 'invoices' | 'payments' | 'ledger';

const statusColors: Record<string, string> = {
  Active: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
  Grace_Period: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
  Delinquent: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400',
  Suspended: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300',
  Closed: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
  Pending: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
  Paid: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
  Overdue: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400',
  Void: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300',
  Partially_Paid: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400',
  Completed: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
  Failed: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400',
  Refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function BillingDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('overview');
  const [account, setAccount] = useState<BillingAccount | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [payForInvoice, setPayForInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const fmt = formatCurrency;

  const loadAll = useCallback(async () => {
    try {
      const [accRes, invRes, payRes, ledRes] = await Promise.all([
        api.get(`/billing/accounts/${id}`),
        api.get(`/billing/invoices/account/${id}`),
        api.get(`/billing/payments/account/${id}`),
        api.get(`/billing/ledger/${id}`),
      ]);
      setAccount(accRes.data || null);
      setInvoices(invRes.data || []);
      setPayments(payRes.data || []);
      setLedger(ledRes.data || []);
    } catch (err) {
      console.error('Failed to load billing detail', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: <CreditCard size={16} /> },
    { key: 'invoices', label: 'Invoices', icon: <FileText size={16} />, count: invoices.length },
    { key: 'payments', label: 'Payments', icon: <DollarSign size={16} />, count: payments.length },
    { key: 'ledger', label: 'Ledger', icon: <BookOpen size={16} />, count: ledger.length },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="skeleton h-8 w-1/3" />
        <div className="card p-8"><div className="skeleton h-6 w-1/2 mb-4" /><div className="skeleton h-4 w-full" /></div>
      </div>
    );
  }

  if (!account) {
    return <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">Billing account not found</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/billing')} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <h1 className="text-h2 font-bold text-neutral-900 dark:text-neutral-100">{account.id}</h1>
            <p className="text-body-sm text-neutral-500 dark:text-neutral-400">Policy: {account.policyId} | Customer: {account.customerId}</p>
          </div>
          <span className={cn('px-3 py-1 rounded-full text-small font-medium', statusColors[account.status] || 'bg-neutral-100 dark:bg-neutral-700')}>
            {account.status.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={() => setShowPayment(true)}
          className="btn-primary flex items-center gap-2"
        >
          <DollarSign size={16} /> Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4 text-center">
          <p className="text-small text-neutral-500 dark:text-neutral-400 mb-1">Total Premium</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{fmt(account.totalPremium)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-small text-neutral-500 dark:text-neutral-400 mb-1">Balance</p>
          <p className={cn('text-lg font-bold', account.balance > 0 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400')}>{fmt(account.balance)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-small text-neutral-500 dark:text-neutral-400 mb-1">Frequency</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{account.paymentFrequency}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-small text-neutral-500 dark:text-neutral-400 mb-1">Next Due</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{new Date(account.nextDueDate).toLocaleDateString()}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-small text-neutral-500 dark:text-neutral-400 mb-1">Last Payment</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{account.lastPaymentAmount ? fmt(account.lastPaymentAmount) : '—'}</p>
          {account.lastPaymentDate && <p className="text-small text-neutral-400 dark:text-neutral-500">{new Date(account.lastPaymentDate).toLocaleDateString()}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-border dark:border-neutral-700">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-body-sm font-medium border-b-2 transition-colors',
                tab === t.key ? 'border-accent-500 text-accent-500 dark:text-accent-400' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
            >
              {t.icon} {t.label}
              {t.count !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 text-small bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border dark:border-neutral-700">
              <h3 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">Account Details</h3>
            </div>
            <div className="p-4 space-y-3 text-body-sm">
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Payment Method</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{account.paymentMethod.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Autopay</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{account.autopay ? 'Enabled' : 'Disabled'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Grace Period</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{account.gracePeriodDays} days</span></div>
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Created</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{new Date(account.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Last Updated</span><span className="font-medium text-neutral-900 dark:text-neutral-100">{new Date(account.updatedAt).toLocaleDateString()}</span></div>
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border dark:border-neutral-700">
              <h3 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">Recent Activity</h3>
            </div>
            <div className="p-4 space-y-3">
              {payments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3 text-body-sm">
                  <div className={cn('p-1.5 rounded-full', p.status === 'Completed' ? 'bg-success-100 dark:bg-success-900/30' : 'bg-error-100 dark:bg-error-900/30')}>
                    {p.status === 'Completed' ? <CheckCircle size={14} className="text-success-600 dark:text-success-400" /> : <XCircle size={14} className="text-error-600 dark:text-error-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{fmt(p.amount)} — {p.method.replace('_', ' ')}</p>
                    <p className="text-small text-neutral-400 dark:text-neutral-500">{new Date(p.processedDate).toLocaleDateString()}</p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-small font-medium', statusColors[p.status])}>
                    {p.status}
                  </span>
                </div>
              ))}
              {payments.length === 0 && <p className="text-neutral-400 dark:text-neutral-500 text-body-sm">No payments recorded</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'invoices' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-surface-border dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Paid</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Balance</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-small font-medium', statusColors[inv.status])}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-900 dark:text-neutral-100">{fmt(inv.amount)}</td>
                    <td className="px-4 py-3 text-right font-mono text-success-600 dark:text-success-400">{fmt(inv.amountPaid)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100">{fmt(inv.amount - inv.amountPaid)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-500 dark:text-neutral-400 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        {(inv.status === 'Pending' || inv.status === 'Overdue' || inv.status === 'Partially_Paid') && (
                          <button
                            onClick={() => { setPayForInvoice(inv); setShowPayment(true); }}
                            className="p-1.5 hover:bg-success-100 dark:hover:bg-success-900/30 rounded text-success-600 dark:text-success-400 transition-colors"
                            title="Pay"
                          >
                            <DollarSign size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">No invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-surface-border dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Reference</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">{p.id}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{new Date(p.processedDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-neutral-100">{p.method.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 font-mono text-small">{p.reference}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-small font-medium', statusColors[p.status])}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100">{fmt(p.amount)}</td>
                    <td className="px-4 py-3 text-neutral-400 dark:text-neutral-500 text-small">{p.notes || '—'}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">No payments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-surface-border dark:border-neutral-700">
            <h3 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">Account Ledger</h3>
          </div>
          <LedgerView entries={ledger} />
        </div>
      )}

      {/* Dialogs */}
      {showPayment && (
        <PaymentDialog
          billingAccountId={account.id}
          policyId={account.policyId}
          invoiceId={payForInvoice?.id}
          suggestedAmount={payForInvoice ? payForInvoice.amount - payForInvoice.amountPaid : account.balance}
          onClose={() => { setShowPayment(false); setPayForInvoice(null); }}
          onSuccess={() => { setShowPayment(false); setPayForInvoice(null); loadAll(); }}
        />
      )}
      {viewInvoice && (
        <InvoiceView invoice={viewInvoice} onClose={() => setViewInvoice(null)} />
      )}
    </div>
  );
}
