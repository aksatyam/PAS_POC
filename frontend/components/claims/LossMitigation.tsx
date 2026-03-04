'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { LossMitigation as LossMitigationType, MitigationType, MitigationStatus } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/lib/toast';
import { Plus, Handshake, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

interface Props {
  claimId: string;
  mitigations: LossMitigationType[];
  onUpdate: () => void;
  canEdit: boolean;
}

const TYPES: MitigationType[] = ['Workout Plan', 'Forbearance', 'Loan Modification', 'Short Sale', 'Other'];
const STATUS_TRANSITIONS: Record<MitigationStatus, MitigationStatus[]> = {
  Proposed: ['Active'],
  Active: ['Completed', 'Failed'],
  Completed: [],
  Failed: [],
};

export default function LossMitigationPanel({ claimId, mitigations, onUpdate, canEdit }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Workout Plan' as MitigationType, description: '', terms: '' });
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/claims/${claimId}/mitigation`, form);
      if (res.success) {
        addToast({ type: 'success', title: 'Mitigation Added', message: `${form.type} action created` });
        setShowForm(false);
        setForm({ type: 'Workout Plan', description: '', terms: '' });
        onUpdate();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (mitigationId: string, newStatus: MitigationStatus) => {
    setUpdatingId(mitigationId);
    try {
      const res = await api.patch(`/claims/mitigations/${mitigationId}/status`, { status: newStatus });
      if (res.success) {
        addToast({ type: 'success', title: 'Status Updated', message: `Mitigation moved to ${newStatus}` });
        onUpdate();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-1">
          <Handshake size={14} /> Loss Mitigation Actions ({mitigations.length})
        </h4>
        {canEdit && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs flex items-center gap-1">
            <Plus size={14} /> {showForm ? 'Cancel' : 'Add Action'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card border border-blue-200 space-y-3">
          <div>
            <label className="form-label">Type</label>
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as MitigationType })}
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder="Describe the mitigation action"
            />
          </div>
          <div>
            <label className="form-label">Terms (optional)</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              placeholder="Terms and conditions"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? 'Creating...' : 'Create Action'}
            </button>
          </div>
        </form>
      )}

      {mitigations.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Handshake size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No mitigation actions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mitigations.map((m) => {
            const nextStatuses = STATUS_TRANSITIONS[m.status] || [];
            return (
              <div key={m.id} className="card border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{m.type}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-sm text-gray-700">{m.description}</p>
                    {m.terms && <p className="text-xs text-gray-500 mt-1">Terms: {m.terms}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>Started {formatDate(m.startDate)}</span>
                      {m.endDate && <span>Ended {formatDate(m.endDate)}</span>}
                      <span>by {m.createdBy}</span>
                    </div>
                  </div>
                </div>

                {canEdit && nextStatuses.length > 0 && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    {nextStatuses.map((ns) => (
                      <button
                        key={ns}
                        onClick={() => handleStatusUpdate(m.id, ns)}
                        disabled={updatingId === m.id}
                        className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded font-medium ${
                          ns === 'Completed' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                          ns === 'Failed' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                          'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {ns === 'Completed' ? <CheckCircle size={12} /> :
                         ns === 'Failed' ? <XCircle size={12} /> :
                         <ArrowRight size={12} />}
                        {ns}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
