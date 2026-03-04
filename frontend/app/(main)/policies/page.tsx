'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Policy } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { Plus, FileText, FileSearch } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

const ALL_STATUSES = ['Draft', 'Quoted', 'Bound', 'Issued', 'Active', 'Endorsed', 'Renewal_Pending', 'Reinstated', 'Lapsed', 'Cancelled', 'Expired'];

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const params: any = {};
        if (filterStatus) params.status = filterStatus;
        if (filterType) params.type = filterType;
        const res = await api.get('/policies', params);
        if (res.success) setPolicies(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [filterStatus, filterType]);

  const [form, setForm] = useState({ customerId: '', policyType: 'Mortgage Guarantee', premiumAmount: '', coverageAmount: '', startDate: '', endDate: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/policies', {
        ...form,
        premiumAmount: Number(form.premiumAmount),
        coverageAmount: Number(form.coverageAmount),
      });
      if (res.success) {
        setShowCreate(false);
        setPolicies([res.data, ...policies]);
        setForm({ customerId: '', policyType: 'Mortgage Guarantee', premiumAmount: '', coverageAmount: '', startDate: '', endDate: '' });
        addToast({ type: 'success', title: 'Policy Created', message: `Policy ${res.data.id} has been created successfully` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<Policy>[] = [
    { key: 'id', label: 'Policy ID', sortable: true },
    { key: 'policyType', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'premiumAmount', label: 'Premium', sortable: true, render: (row) => formatCurrency(row.premiumAmount) },
    { key: 'coverageAmount', label: 'Coverage', sortable: true, render: (row) => formatCurrency(row.coverageAmount) },
    { key: 'riskCategory', label: 'Risk', render: (row) => <StatusBadge status={row.riskCategory} /> },
    { key: 'startDate', label: 'Start', render: (row) => formatDate(row.startDate) },
    { key: 'version', label: 'Ver', sortable: true },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100 mb-0">Policies</h1>
        {hasRole('Admin', 'Operations') && (
          <div className="flex gap-2">
            <button onClick={() => router.push('/policies/quote')} className="px-4 py-2 bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg font-medium text-body-sm transition-colors duration-micro flex items-center gap-2">
              <FileSearch size={18} /> New Quote
            </button>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm flex items-center gap-2">
              <Plus size={18} /> New Policy
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-48">
          <option value="">All Status</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-52">
          <option value="">All Types</option>
          {['Mortgage Guarantee','Credit Protection','Coverage Plus'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={policies} onRowClick={(row) => router.push(`/policies/${row.id}`)} loading={loading} searchable emptyIcon={FileText} emptyMessage="No policies found" />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Policy" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Customer ID</label>
              <input className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.customerId} onChange={(e) => setForm({...form, customerId: e.target.value})} required placeholder="e.g. CUST001" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Policy Type</label>
              <select className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.policyType} onChange={(e) => setForm({...form, policyType: e.target.value})}>
                <option>Mortgage Guarantee</option><option>Credit Protection</option><option>Coverage Plus</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Premium (INR)</label>
              <input type="number" className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.premiumAmount} onChange={(e) => setForm({...form, premiumAmount: e.target.value})} required />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Coverage (INR)</label>
              <input type="number" className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.coverageAmount} onChange={(e) => setForm({...form, coverageAmount: e.target.value})} required />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Start Date</label>
              <input type="date" className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} required />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">End Date</label>
              <input type="date" className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg font-medium text-body-sm transition-colors duration-micro">Cancel</button>
            <button type="submit" disabled={creating} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm">{creating ? 'Creating...' : 'Create Policy'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
