'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import KPICard from '@/components/ui/KPICard';
import Tabs from '@/components/ui/Tabs';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonKPICard } from '@/components/ui/Skeleton';
import { DollarSign, AlertTriangle, TrendingUp, CheckCircle, PlusCircle } from 'lucide-react';

export default function FinancePage() {
  const [summary, setSummary] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, invRes, payRes, recRes] = await Promise.all([
          api.get('/finance/summary'),
          api.get('/finance/invoices'),
          api.get('/finance/payments'),
          api.get('/finance/reconciliation'),
        ]);
        if (sumRes.success) setSummary(sumRes.data);
        if (invRes.success) setInvoices(invRes.data || []);
        if (payRes.success) setPayments(payRes.data || []);
        if (recRes.success) setReconciliation(recRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  const tabs = [
    {
      value: 'invoices',
      label: 'Invoices',
      badge: invoices.length,
      content: (
        <DataTable
          data={invoices}
          columns={[
            { key: 'id', label: 'Invoice ID', render: (row: any) => <span className="font-medium text-accent-500">{row.id}</span> },
            { key: 'lender', label: 'Lender' },
            { key: 'dealId', label: 'Deal ID' },
            { key: 'type', label: 'Type', render: (row: any) => <span className="text-small font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">{row.type}</span> },
            { key: 'amount', label: 'Amount', render: (row: any) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
            { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
            { key: 'date', label: 'Date', render: (row: any) => formatDate(row.date) },
          ]}
          searchable
          loading={loading}
        />
      ),
    },
    {
      value: 'payments',
      label: 'Payments',
      badge: payments.length,
      content: (
        <DataTable
          data={payments}
          columns={[
            { key: 'id', label: 'Payment ID', render: (row: any) => <span className="font-medium text-accent-500">{row.id}</span> },
            { key: 'invoiceId', label: 'Invoice' },
            { key: 'amount', label: 'Amount', render: (row: any) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
            { key: 'method', label: 'Method' },
            { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
            { key: 'processedDate', label: 'Processed', render: (row: any) => formatDate(row.processedDate) },
          ]}
          searchable
          loading={loading}
        />
      ),
    },
    {
      value: 'reconciliation',
      label: 'Reconciliation',
      content: (
        <div className="space-y-4">
          {reconciliation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 text-center">
                <p className="text-small text-emerald-600 dark:text-emerald-400">Total Matched</p>
                <p className="text-data-lg font-bold text-emerald-700 dark:text-emerald-300">{reconciliation.matched}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 text-center">
                <p className="text-small text-red-600 dark:text-red-400">Unmatched</p>
                <p className="text-data-lg font-bold text-red-700 dark:text-red-300">{reconciliation.unmatched}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 text-center">
                <p className="text-small text-amber-600 dark:text-amber-400">Pending</p>
                <p className="text-data-lg font-bold text-amber-700 dark:text-amber-300">{reconciliation.pending}</p>
              </div>
            </div>
          )}
          <DataTable
            data={reconciliation?.entries || []}
            columns={[
              { key: 'id', label: 'Recon ID', render: (row: any) => <span className="font-medium text-accent-500">{row.id}</span> },
              { key: 'invoiceId', label: 'Invoice' },
              { key: 'paymentId', label: 'Payment' },
              { key: 'amount', label: 'Amount', render: (row: any) => formatCurrency(row.amount) },
              { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
              { key: 'date', label: 'Date', render: (row: any) => formatDate(row.date) },
            ]}
            searchable
            loading={loading}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Finance</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Invoice management, payments, and reconciliation</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
          <PlusCircle size={14} /> Generate Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? <><SkeletonKPICard /><SkeletonKPICard /><SkeletonKPICard /><SkeletonKPICard /></> : (
          <>
            <KPICard title="Total Revenue" value={formatCurrency(summary?.totalRevenue || 0)} icon={DollarSign} variant="primary" trend={{ value: 15, isPositive: true }} />
            <KPICard title="Outstanding" value={formatCurrency(summary?.outstanding || 0)} icon={AlertTriangle} variant="accent" trend={{ value: 8, isPositive: false }} />
            <KPICard title="Collected" value={formatCurrency(summary?.collected || 0)} icon={TrendingUp} variant="secondary" trend={{ value: 12, isPositive: true }} />
            <KPICard title="Reconciled" value={`${summary?.reconciledPct || 0}%`} icon={CheckCircle} trend={{ value: 2.5, isPositive: true }} />
          </>
        )}
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
}
