'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Referral, ReferralStatus } from '@/types';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle, ArrowUpRight, Filter } from 'lucide-react';

const STATUS_FILTERS: (ReferralStatus | 'All')[] = ['All', 'Pending', 'Accepted', 'Declined', 'Escalated'];

function priorityColor(p: string) {
  switch (p) {
    case 'Critical': return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
    case 'High': return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default: return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400';
  }
}

function slaStatus(deadline: string) {
  const now = Date.now();
  const sla = new Date(deadline).getTime();
  const hoursLeft = (sla - now) / (1000 * 60 * 60);
  if (hoursLeft < 0) return { label: 'Overdue', color: 'text-error-600 dark:text-error-400', icon: AlertTriangle };
  if (hoursLeft < 8) return { label: `${Math.round(hoursLeft)}h left`, color: 'text-warning-500 dark:text-warning-400', icon: Clock };
  if (hoursLeft < 24) return { label: `${Math.round(hoursLeft)}h left`, color: 'text-yellow-600 dark:text-yellow-400', icon: Clock };
  return { label: `${Math.round(hoursLeft / 24)}d left`, color: 'text-success-600 dark:text-success-400', icon: Clock };
}

export default function ReferralQueuePage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReferralStatus | 'All'>('All');
  const [showResolve, setShowResolve] = useState<Referral | null>(null);
  const [showEscalate, setShowEscalate] = useState<Referral | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolveDecision, setResolveDecision] = useState<'Accepted' | 'Declined'>('Accepted');
  const [escalateTo, setEscalateTo] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user, hasRole } = useAuth();
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');

  useEffect(() => { loadData(); }, [viewMode]);

  async function loadData() {
    setLoading(true);
    try {
      const endpoint = viewMode === 'my' ? '/uw/referrals/my' : '/uw/referrals';
      const [refRes, sumRes] = await Promise.all([
        api.get(endpoint),
        api.get('/uw/referrals/summary'),
      ]);
      if (refRes.success) setReferrals(Array.isArray(refRes.data) ? refRes.data : []);
      if (sumRes.success) setSummary(sumRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleResolve() {
    if (!showResolve || !resolution) return;
    setProcessing(true);
    try {
      const res = await api.put(`/uw/referrals/${showResolve.id}/resolve`, {
        resolution, decision: resolveDecision,
      });
      if (res.success) {
        setReferrals(referrals.map((r) => r.id === showResolve.id ? { ...r, ...res.data } : r));
        addToast({ type: 'success', title: `Referral ${resolveDecision}` });
        setShowResolve(null);
        setResolution('');
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Resolve Failed', message: err.message });
    } finally { setProcessing(false); }
  }

  async function handleEscalate() {
    if (!showEscalate || !escalateTo) return;
    setProcessing(true);
    try {
      const res = await api.put(`/uw/referrals/${showEscalate.id}/escalate`, { escalateTo });
      if (res.success) {
        setReferrals(referrals.map((r) => r.id === showEscalate.id ? { ...r, ...res.data } : r));
        addToast({ type: 'success', title: 'Referral Escalated' });
        setShowEscalate(null);
        setEscalateTo('');
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Escalation Failed', message: err.message });
    } finally { setProcessing(false); }
  }

  const filtered = filter === 'All' ? referrals : referrals.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="card h-20 skeleton" />)}</div>
        {[1, 2, 3].map((i) => <div key={i} className="card h-24 skeleton" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Referral Queue</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('all')} className={`px-3 py-1.5 text-body-sm rounded-lg transition-colors ${viewMode === 'all' ? 'bg-accent-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'}`}>All</button>
          <button onClick={() => setViewMode('my')} className={`px-3 py-1.5 text-body-sm rounded-lg transition-colors ${viewMode === 'my' ? 'bg-accent-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'}`}>My Referrals</button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-h3 font-bold text-accent-600 dark:text-accent-400">{summary.total}</p>
            <p className="text-small text-neutral-500 dark:text-neutral-400">Total</p>
          </div>
          <div className="card text-center">
            <p className="text-h3 font-bold text-warning-600 dark:text-warning-400">{summary.pending}</p>
            <p className="text-small text-neutral-500 dark:text-neutral-400">Pending</p>
          </div>
          <div className="card text-center">
            <p className="text-h3 font-bold text-warning-600 dark:text-warning-400">{summary.escalated}</p>
            <p className="text-small text-neutral-500 dark:text-neutral-400">Escalated</p>
          </div>
          <div className="card text-center">
            <p className="text-h3 font-bold text-error-600 dark:text-error-400">{summary.overdue}</p>
            <p className="text-small text-neutral-500 dark:text-neutral-400">Overdue</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-neutral-400 dark:text-neutral-500" />
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 text-small rounded-full transition-colors ${filter === s ? 'bg-accent-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'}`}>
            {s} {s !== 'All' && <span className="ml-1">({referrals.filter((r) => r.status === s).length})</span>}
          </button>
        ))}
      </div>

      {/* Referral List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card">
            <EmptyState icon={Shield} title="No referrals found" description="Referrals will appear here when cases require manual review." />
          </div>
        )}
        {filtered.map((ref) => {
          const sla = slaStatus(ref.slaDeadline);
          const SlaIcon = sla.icon;
          return (
            <div key={ref.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-small font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 px-2 py-0.5 rounded">{ref.id}</span>
                    <StatusBadge status={ref.status} />
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-small font-medium ${priorityColor(ref.priority)}`}>{ref.priority}</span>
                    {ref.status === 'Pending' && (
                      <span className={`inline-flex items-center gap-1 text-small ${sla.color}`}>
                        <SlaIcon size={12} /> {sla.label}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">{ref.reason}</p>
                  <div className="flex items-center gap-4 text-small text-neutral-500 dark:text-neutral-400">
                    <span>UW: {ref.underwritingId}</span>
                    <span>Policy: {ref.policyId}</span>
                    <span>Risk Score: <span className={`font-medium ${ref.riskScore > 60 ? 'text-error-600 dark:text-error-400' : ref.riskScore > 40 ? 'text-warning-600 dark:text-warning-400' : 'text-success-600 dark:text-success-400'}`}>{ref.riskScore}</span></span>
                    <span>Rules: {ref.triggerRules.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-4 text-small text-neutral-400 dark:text-neutral-500 mt-1">
                    <span>Assigned to: {ref.assignedTo}</span>
                    <span>Created: {new Date(ref.createdAt).toLocaleDateString()}</span>
                    {ref.resolution && <span>Resolution: {ref.resolution}</span>}
                  </div>
                </div>
                {ref.status === 'Pending' && hasRole('Admin', 'Underwriter') && (
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => { setShowResolve(ref); setResolveDecision('Accepted'); setResolution(''); }} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><CheckCircle size={14} /> Resolve</button>
                    <button onClick={() => { setShowEscalate(ref); setEscalateTo(''); }} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><ArrowUpRight size={14} /> Escalate</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Modal */}
      <Modal isOpen={!!showResolve} onClose={() => setShowResolve(null)} title="Resolve Referral">
        <div className="space-y-4">
          <div>
            <label className="form-label">Decision</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setResolveDecision('Accepted')} className={`flex-1 py-2 text-body-sm rounded-lg border transition-colors ${resolveDecision === 'Accepted' ? 'bg-success-50 border-success-300 text-success-700 dark:bg-success-900/20 dark:border-success-700 dark:text-success-400' : 'border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300'}`}>
                <CheckCircle size={16} className="inline mr-1" /> Accept
              </button>
              <button type="button" onClick={() => setResolveDecision('Declined')} className={`flex-1 py-2 text-body-sm rounded-lg border transition-colors ${resolveDecision === 'Declined' ? 'bg-error-50 border-error-300 text-error-700 dark:bg-error-900/20 dark:border-error-700 dark:text-error-400' : 'border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300'}`}>
                <XCircle size={16} className="inline mr-1" /> Decline
              </button>
            </div>
          </div>
          <div>
            <label className="form-label">Resolution Notes</label>
            <textarea className="input-field" rows={3} value={resolution} onChange={(e) => setResolution(e.target.value)} required placeholder="Provide rationale for the decision..." />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowResolve(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleResolve} disabled={!resolution || processing} className="btn-primary">{processing ? 'Processing...' : 'Submit'}</button>
          </div>
        </div>
      </Modal>

      {/* Escalate Modal */}
      <Modal isOpen={!!showEscalate} onClose={() => setShowEscalate(null)} title="Escalate Referral">
        <div className="space-y-4">
          <div>
            <label className="form-label">Escalate To (User ID)</label>
            <input className="input-field" value={escalateTo} onChange={(e) => setEscalateTo(e.target.value)} placeholder="Enter senior underwriter user ID" required />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowEscalate(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleEscalate} disabled={!escalateTo || processing} className="btn-primary">{processing ? 'Escalating...' : 'Escalate'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
