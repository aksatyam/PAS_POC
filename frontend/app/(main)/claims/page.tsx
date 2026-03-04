'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Claim } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import AdjudicationBoard from '@/components/claims/AdjudicationBoard';
import { Plus, AlertTriangle, Bell, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const router = useRouter();
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const params: any = {};
        if (filterStatus) params.status = filterStatus;
        const res = await api.get('/claims', params);
        if (res.success) setClaims(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [filterStatus]);

  const [form, setForm] = useState({ policyId: '', claimType: 'Default', description: '', amount: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/claims', { ...form, amount: Number(form.amount) });
      if (res.success) {
        setShowCreate(false);
        setClaims([res.data, ...claims]);
        addToast({ type: 'success', title: 'Claim Filed', message: `Claim ${res.data.id} has been registered` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Filing Failed', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<Claim>[] = [
    { key: 'id', label: 'Claim ID', sortable: true },
    { key: 'policyId', label: 'Policy', sortable: true },
    { key: 'claimType', label: 'Type' },
    { key: 'amount', label: 'Amount', sortable: true, render: (row) => formatCurrency(row.amount) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'adjudicationStatus' as any,
      label: 'Adjudication',
      render: (row) => row.adjudicationStatus ? <StatusBadge status={row.adjudicationStatus} /> : <span className="text-neutral-400 dark:text-neutral-500 text-xs">—</span>,
    },
    {
      key: 'fraudScore' as any,
      label: 'Fraud',
      render: (row) => row.fraudScore !== undefined ? (
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
          row.fraudScore >= 70 ? 'bg-red-50 text-error dark:bg-red-950 dark:text-red-400' :
          row.fraudScore >= 50 ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400' :
          row.fraudScore >= 25 ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400' :
          'bg-emerald-50 text-success dark:bg-emerald-950 dark:text-emerald-400'
        }`}>{row.fraudScore}%</span>
      ) : <span className="text-neutral-400 dark:text-neutral-500 text-xs">—</span>,
    },
    { key: 'filedDate', label: 'Filed', render: (row) => formatDate(row.filedDate) },
  ];

  // Claims with adjudication status (for board view)
  const adjudicatedClaims = claims.filter((c) => c.adjudicationStatus);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100 mb-0">Claims</h1>
        <div className="flex gap-2">
          {hasRole('Admin', 'Claims', 'Operations') && (
            <button onClick={() => router.push('/claims/fnol')} className="px-4 py-2 bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg font-medium text-body-sm transition-colors duration-micro flex items-center gap-2">
              <Bell size={18} /> FNOL Intake
            </button>
          )}
          {hasRole('Admin', 'Claims') && (
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm flex items-center gap-2">
              <Plus size={18} /> New Claim
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro w-40">
          <option value="">All Status</option>
          {['Filed', 'Under Review', 'Approved', 'Rejected', 'Settled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="ml-auto flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
              viewMode === 'table' ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            <List size={14} /> Table
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
              viewMode === 'board' ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            <LayoutGrid size={14} /> Adjudication Board
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={columns} data={claims} onRowClick={(row) => router.push(`/claims/${row.id}`)} loading={loading} searchable emptyIcon={AlertTriangle} emptyMessage="No claims found" />
      ) : (
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{adjudicatedClaims.length} claims in adjudication workflow</p>
          <AdjudicationBoard claims={adjudicatedClaims} />
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Register Claim">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Policy ID</label><input className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })} required placeholder="e.g. POL-2025-00001" /></div>
          <div><label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Claim Type</label><select className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.claimType} onChange={(e) => setForm({ ...form, claimType: e.target.value })}><option>Default</option><option>Property Damage</option><option>Fraud</option><option>Other</option></select></div>
          <div><label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Amount (INR)</label><input type="number" className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <div><label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Description</label><textarea className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg font-medium text-body-sm transition-colors duration-micro">Cancel</button>
            <button type="submit" disabled={creating} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm">{creating ? 'Submitting...' : 'Submit Claim'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
