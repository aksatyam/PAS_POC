'use client';

import { useState } from 'react';
import { Endorsement, EndorsementType, Policy } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth';
import { PenLine, Plus, CheckCircle, PlayCircle, ArrowUpDown } from 'lucide-react';

interface EndorsementPanelProps {
  policy: Policy;
  endorsements: Endorsement[];
  onRefresh: () => void;
}

export default function EndorsementPanel({ policy, endorsements, onRefresh }: EndorsementPanelProps) {
  const { hasRole } = useAuth();
  const { addToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'Coverage Change' as EndorsementType,
    description: '',
    effectiveDate: '',
    coverageAmount: '',
    premiumAmount: '',
  });

  const canEndorse = ['Active', 'Issued', 'Endorsed', 'Reinstated'].includes(policy.status);
  const canManage = hasRole('Admin', 'Operations');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const body: any = {
        type: form.type,
        description: form.description,
        effectiveDate: form.effectiveDate,
        changes: {},
      };
      if (form.coverageAmount) body.changes.coverageAmount = { from: policy.coverageAmount, to: Number(form.coverageAmount) };
      if (form.premiumAmount) body.changes.premiumAmount = { from: policy.premiumAmount, to: Number(form.premiumAmount) };

      const res = await api.post(`/policies/${policy.id}/endorse`, body);
      if (res.success) {
        addToast({ type: 'success', title: 'Endorsement Created', message: `Endorsement ${res.data.id} created` });
        setShowCreate(false);
        setForm({ type: 'Coverage Change', description: '', effectiveDate: '', coverageAmount: '', premiumAmount: '' });
        onRefresh();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (endorsementId: string) => {
    setProcessing(endorsementId);
    try {
      const res = await api.post(`/policies/endorsements/${endorsementId}/approve`);
      if (res.success) {
        addToast({ type: 'success', title: 'Approved', message: 'Endorsement approved successfully' });
        onRefresh();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setProcessing(null);
    }
  };

  const handleApply = async (endorsementId: string) => {
    setProcessing(endorsementId);
    try {
      const res = await api.post(`/policies/endorsements/${endorsementId}/apply`);
      if (res.success) {
        addToast({ type: 'success', title: 'Applied', message: 'Endorsement applied to policy' });
        onRefresh();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PenLine size={18} className="text-cyan-600" />
          <h3 className="font-semibold text-gray-900">Endorsements</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{endorsements.length}</span>
        </div>
        {canManage && canEndorse && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-1">
            <Plus size={14} /> New Endorsement
          </button>
        )}
      </div>

      {endorsements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <PenLine size={32} className="mx-auto mb-2 text-gray-300" />
          No endorsements for this policy
        </div>
      ) : (
        <div className="space-y-3">
          {endorsements.map((e) => (
            <div key={e.id} className="card border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{e.id}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <span className="text-xs text-gray-500">{e.type}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${e.premiumDelta > 0 ? 'text-red-600' : e.premiumDelta < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {e.premiumDelta > 0 ? '+' : ''}{formatCurrency(e.premiumDelta)}
                  </span>
                  <p className="text-xs text-gray-400">Effective: {formatDate(e.effectiveDate)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{e.description}</p>

              {Object.keys(e.changes).length > 0 && (
                <div className="bg-gray-50 rounded p-2 mb-2">
                  {Object.entries(e.changes).map(([field, change]) => (
                    <div key={field} className="flex items-center gap-2 text-xs">
                      <ArrowUpDown size={12} className="text-gray-400" />
                      <span className="text-gray-500">{field}:</span>
                      <span className="text-red-500 line-through">{String(change.from)}</span>
                      <span className="text-gray-400">&rarr;</span>
                      <span className="text-green-600 font-medium">{String(change.to)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Created {formatDateTime(e.createdAt)} by {e.createdBy}</span>
                {canManage && (
                  <div className="flex gap-2">
                    {e.status === 'Pending' && (
                      <button
                        onClick={() => handleApprove(e.id)}
                        disabled={processing === e.id}
                        className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                      >
                        <CheckCircle size={12} /> Approve
                      </button>
                    )}
                    {e.status === 'Approved' && (
                      <button
                        onClick={() => handleApply(e.id)}
                        disabled={processing === e.id}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <PlayCircle size={12} /> Apply
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Endorsement" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Endorsement Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EndorsementType })}>
                <option>Coverage Change</option>
                <option>Premium Adjustment</option>
                <option>Beneficiary Change</option>
                <option>Term Extension</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Effective Date</label>
              <input type="date" className="input-field" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Describe the endorsement..." />
          </div>
          {(form.type === 'Coverage Change' || form.type === 'Other') && (
            <div>
              <label className="form-label">New Coverage Amount (INR)</label>
              <input type="number" className="input-field" value={form.coverageAmount} onChange={(e) => setForm({ ...form, coverageAmount: e.target.value })} placeholder={`Current: ${formatCurrency(policy.coverageAmount)}`} />
            </div>
          )}
          {(form.type === 'Premium Adjustment' || form.type === 'Other') && (
            <div>
              <label className="form-label">New Premium Amount (INR)</label>
              <input type="number" className="input-field" value={form.premiumAmount} onChange={(e) => setForm({ ...form, premiumAmount: e.target.value })} placeholder={`Current: ${formatCurrency(policy.premiumAmount)}`} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create Endorsement'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
