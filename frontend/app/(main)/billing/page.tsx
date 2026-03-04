'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { BillingAccount, BillingSummary } from '@/types';
import AgingReport from '@/components/billing/AgingReport';
import EmptyState from '@/components/ui/EmptyState';
import {
  CreditCard, DollarSign, AlertTriangle, TrendingUp,
  Search, Filter,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  Active: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
  Grace_Period: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
  Delinquent: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400',
  Suspended: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300',
  Closed: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
};

function SkeletonCard() {
  return <div className="card p-5"><div className="skeleton h-4 w-1/3 mb-3" /><div className="skeleton h-8 w-1/2" /></div>;
}

export default function BillingPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<BillingAccount[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accRes, sumRes] = await Promise.all([
        api.get('/billing/accounts'),
        api.get('/billing/summary'),
      ]);
      setAccounts(accRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      console.error('Failed to load billing data', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = formatCurrency;

  const filtered = accounts.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.id.toLowerCase().includes(q) || a.policyId.toLowerCase().includes(q) || a.customerId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-header mb-0">Billing & Payments</h1>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent-50 dark:bg-accent-950 rounded-lg"><CreditCard size={18} className="text-accent-500 dark:text-accent-400" /></div>
              <span className="text-body-sm text-neutral-500 dark:text-neutral-400">Total Accounts</span>
            </div>
            <p className="text-h3 font-bold text-neutral-900 dark:text-neutral-100">{summary.totalAccounts}</p>
            <p className="text-small text-neutral-400 dark:text-neutral-500 mt-1">{summary.activeAccounts} active</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg"><DollarSign size={18} className="text-accent-600 dark:text-accent-400" /></div>
              <span className="text-body-sm text-neutral-500 dark:text-neutral-400">Outstanding</span>
            </div>
            <p className="text-h3 font-bold text-neutral-900 dark:text-neutral-100">{fmt(summary.totalOutstanding)}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-lg"><AlertTriangle size={18} className="text-error-600 dark:text-error-400" /></div>
              <span className="text-body-sm text-neutral-500 dark:text-neutral-400">Overdue</span>
            </div>
            <p className="text-h3 font-bold text-error-600 dark:text-error-400">{fmt(summary.totalOverdue)}</p>
            <p className="text-small text-neutral-400 dark:text-neutral-500 mt-1">{summary.overdueCount} invoice(s)</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg"><TrendingUp size={18} className="text-success-600 dark:text-success-400" /></div>
              <span className="text-body-sm text-neutral-500 dark:text-neutral-400">Collected</span>
            </div>
            <p className="text-h3 font-bold text-success-600 dark:text-success-400">{fmt(summary.totalCollected)}</p>
          </div>
        </div>
      )}

      {/* Aging Report */}
      {summary && summary.agingBuckets.some((b) => b.amount > 0) && (
        <div className="card">
          <div className="px-5 py-3 border-b border-surface-border dark:border-neutral-700">
            <h3 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">Receivables Aging</h3>
          </div>
          <div className="p-4">
            <AgingReport buckets={summary.agingBuckets} />
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-surface-border dark:border-neutral-700 flex items-center justify-between">
          <span className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">Billing Accounts</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 pr-3 py-1.5 text-small w-48"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-9 pr-3 py-1.5 text-small appearance-none"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Grace_Period">Grace Period</option>
                <option value="Delinquent">Delinquent</option>
                <option value="Suspended">Suspended</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-neutral-400 dark:text-neutral-500">
            <div className="skeleton h-4 w-32 mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-surface-border dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Account</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Policy</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Frequency</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Premium</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Balance</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Next Due</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Method</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => router.push(`/billing/${a.id}`)}
                    className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-accent-50 dark:hover:bg-accent-950 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-accent-500 dark:text-accent-400">{a.id}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{a.policyId}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{a.paymentFrequency}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-small font-medium', statusColors[a.status] || 'bg-neutral-100 dark:bg-neutral-700')}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-900 dark:text-neutral-100">{fmt(a.totalPremium)}</td>
                    <td className={cn('px-4 py-3 text-right font-mono font-semibold', a.balance > 0 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400')}>
                      {fmt(a.balance)}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{new Date(a.nextDueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{a.paymentMethod.replace('_', ' ')}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500">No billing accounts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
