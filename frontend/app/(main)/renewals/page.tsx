'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Renewal } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth';
import { RefreshCw, CheckCircle, XCircle, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'accept' | 'decline'; id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { hasRole } = useAuth();

  const load = async () => {
    try {
      const res = await api.get('/policies/renewals/pending');
      if (res.success) setRenewals(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = filterStatus ? renewals.filter((r) => r.status === filterStatus) : renewals;

  const handleAccept = async (renewalId: string) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/policies/renewals/${renewalId}/accept`);
      if (res.success) {
        addToast({ type: 'success', title: 'Renewal Accepted', message: `Renewal policy created: ${res.data.renewedPolicyId}` });
        load();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDecline = async (renewalId: string) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/policies/renewals/${renewalId}/decline`);
      if (res.success) {
        addToast({ type: 'success', title: 'Renewal Declined', message: 'Policy reverted to Active' });
        load();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const pendingCount = renewals.filter((r) => r.status === 'Pending' || r.status === 'Quoted').length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-0">Renewal Queue</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{pendingCount} pending renewal{pendingCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-40">
          <option value="">All Status</option>
          {['Pending', 'Quoted', 'Accepted', 'Declined', 'Expired'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={RefreshCw} title="No renewals found" description="Renewals will appear here when policies are up for renewal." />

      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100">{r.id}</span>
                    <StatusBadge status={r.status} />
                    {r.uwReEvaluated && (
                      <span className="text-small bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-400 px-2 py-0.5 rounded-full">UW Re-evaluated</span>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/policies/${r.originalPolicyId}`)}
                    className="text-body-sm text-accent-500 dark:text-accent-400 hover:underline flex items-center gap-1"
                  >
                    Original: {r.originalPolicyId} <ExternalLink size={12} />
                  </button>
                  {r.renewedPolicyId && (
                    <button
                      onClick={() => router.push(`/policies/${r.renewedPolicyId}`)}
                      className="text-body-sm text-success-600 dark:text-success-400 hover:underline flex items-center gap-1"
                    >
                      Renewed: {r.renewedPolicyId} <ExternalLink size={12} />
                    </button>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(r.newPremiumAmount)}</div>
                  <div className={`text-body-sm flex items-center gap-1 justify-end ${r.premiumChange > 0 ? 'text-error-600 dark:text-error-400' : r.premiumChange < 0 ? 'text-success-600 dark:text-success-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {r.premiumChange > 0 ? <TrendingUp size={14} /> : r.premiumChange < 0 ? <TrendingDown size={14} /> : null}
                    {r.premiumChange > 0 ? '+' : ''}{formatCurrency(r.premiumChange)}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-small">
                <div>
                  <span className="block text-neutral-400 dark:text-neutral-500">Coverage</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatCurrency(r.newCoverageAmount)}</span>
                </div>
                <div>
                  <span className="block text-neutral-400 dark:text-neutral-500">Renewal Date</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatDate(r.renewalDate)}</span>
                </div>
                <div>
                  <span className="block text-neutral-400 dark:text-neutral-500">New Period</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatDate(r.newStartDate)} — {formatDate(r.newEndDate)}</span>
                </div>
                {r.newRiskScore !== undefined && (
                  <div>
                    <span className="block text-neutral-400 dark:text-neutral-500">Risk Score</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{r.newRiskScore}/100</span>
                  </div>
                )}
              </div>

              {hasRole('Admin', 'Operations') && (r.status === 'Pending' || r.status === 'Quoted') && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700/50">
                  <button
                    onClick={() => setConfirmAction({ type: 'accept', id: r.id })}
                    className="btn-primary text-xs flex items-center gap-1"
                  >
                    <CheckCircle size={14} /> Accept Renewal
                  </button>
                  <button
                    onClick={() => setConfirmAction({ type: 'decline', id: r.id })}
                    className="btn-danger text-xs flex items-center gap-1"
                  >
                    <XCircle size={14} /> Decline
                  </button>
                </div>
              )}

              <p className="text-small text-neutral-400 dark:text-neutral-500 mt-2">Created {formatDateTime(r.createdAt)} by {r.createdBy}</p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.type === 'accept') handleAccept(confirmAction.id);
          else if (confirmAction?.type === 'decline') handleDecline(confirmAction.id);
        }}
        title={confirmAction?.type === 'accept' ? 'Accept Renewal' : 'Decline Renewal'}
        message={confirmAction?.type === 'accept'
          ? 'This will create a new policy and expire the original. Continue?'
          : 'This will decline the renewal and revert the policy to Active status. Continue?'}
        confirmLabel={confirmAction?.type === 'accept' ? 'Accept' : 'Decline'}
        variant={confirmAction?.type === 'accept' ? 'default' : 'danger'}
        isLoading={actionLoading}
      />
    </div>
  );
}
