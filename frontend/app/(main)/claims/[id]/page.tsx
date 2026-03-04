'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Claim, Reserve, FraudAssessment, LossMitigation as LossMitigationType, AuditLog, AdjudicationStatus } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { SkeletonText } from '@/components/ui/Skeleton';
import ReservePanel from '@/components/claims/ReservePanel';
import FraudIndicators from '@/components/claims/FraudIndicators';
import LossMitigationPanel from '@/components/claims/LossMitigation';
import ClaimsTimeline from '@/components/claims/ClaimsTimeline';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import {
  FileText, DollarSign, Shield, Handshake, Clock,
  Search, FileCheck, MessageSquare, ArrowRight,
} from 'lucide-react';

export function generateStaticParams() {
  return [];
}

function DetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="skeleton h-4 w-48 mb-4" />
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2"><div className="skeleton h-8 w-40" /><div className="skeleton h-4 w-32" /></div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card"><SkeletonText lines={5} /></div>
        <div className="card"><SkeletonText lines={3} /></div>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'details', label: 'Details', icon: <FileText size={14} /> },
  { key: 'reserves', label: 'Reserves', icon: <DollarSign size={14} /> },
  { key: 'fraud', label: 'Fraud', icon: <Shield size={14} /> },
  { key: 'mitigation', label: 'Mitigation', icon: <Handshake size={14} /> },
  { key: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
];

const ADJ_STEPS: { status: AdjudicationStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'Investigation', label: 'Investigation', icon: <Search size={14} /> },
  { status: 'Evaluation', label: 'Evaluation', icon: <FileCheck size={14} /> },
  { status: 'Negotiation', label: 'Negotiation', icon: <MessageSquare size={14} /> },
  { status: 'Settlement', label: 'Settlement', icon: <DollarSign size={14} /> },
];

const fraudColor = (score: number) =>
  score >= 70 ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' :
  score >= 50 ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' :
  score >= 25 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
  'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400';

const fraudLabel = (score: number) =>
  score >= 70 ? 'Critical' : score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low';

export default function ClaimDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Extra data
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [fraud, setFraud] = useState<FraudAssessment | null>(null);
  const [mitigations, setMitigations] = useState<LossMitigationType[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadClaim = async () => {
    try {
      const res = await api.get(`/claims/${id}`);
      if (res.success) setClaim(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadExtras = async () => {
    const [resR, resF, resM] = await Promise.all([
      api.get(`/claims/${id}/reserve-history`).catch(() => ({ success: false, data: [] })),
      api.get(`/claims/${id}/fraud-score`).catch(() => ({ success: false, data: null })),
      api.get(`/claims/${id}/mitigations`).catch(() => ({ success: false, data: [] })),
    ]);
    if (resR.success) setReserves(resR.data || []);
    if (resF.success) setFraud(resF.data);
    if (resM.success) setMitigations(resM.data || []);
  };

  useEffect(() => {
    loadClaim();
    loadExtras();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/claims/${id}/status`, { status: newStatus });
      if (res.success) {
        setClaim(res.data);
        addToast({ type: 'success', title: 'Status Updated', message: `Claim moved to ${newStatus}` });
        loadExtras();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setActionLoading(false);
      setShowRejectConfirm(false);
    }
  };

  const handleSettle = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/claims/${id}/settle`, { settlementAmount: claim?.amount });
      if (res.success) {
        setClaim(res.data);
        addToast({ type: 'success', title: 'Claim Settled', message: `Settlement of ${formatCurrency(res.data.settlementAmount)} processed` });
        loadExtras();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Settlement Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjudication = async (adjStatus: AdjudicationStatus) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/claims/${id}/adjudicate`, { adjudicationStatus: adjStatus });
      if (res.success) {
        setClaim(res.data);
        addToast({ type: 'success', title: 'Adjudication Updated', message: `Moved to ${adjStatus}` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!claim) return <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">Claim not found</div>;

  const canEdit = hasRole('Admin', 'Claims');
  const currentAdjIdx = claim.adjudicationStatus
    ? ADJ_STEPS.findIndex((s) => s.status === claim.adjudicationStatus)
    : -1;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-h2 font-bold text-neutral-900 dark:text-neutral-100">{claim.id}</h1>
          <p className="text-neutral-500 dark:text-neutral-400">{claim.claimType} Claim</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={claim.status} />
          {claim.adjudicationStatus && <StatusBadge status={claim.adjudicationStatus} />}
          {claim.fraudScore !== undefined && (
            <span className={`text-small px-2 py-1 rounded font-medium ${fraudColor(claim.fraudScore)}`}>
              Fraud: {claim.fraudScore}%
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {canEdit && (
        <div className="flex gap-2 mb-6">
          {claim.status === 'Filed' && (
            <button onClick={() => handleStatusChange('Under Review')} disabled={actionLoading} className="btn-primary text-sm">
              Start Review
            </button>
          )}
          {claim.status === 'Under Review' && (
            <>
              <button onClick={() => handleStatusChange('Approved')} disabled={actionLoading} className="btn-primary text-sm">Approve</button>
              <button onClick={() => setShowRejectConfirm(true)} className="btn-danger text-sm">Reject</button>
            </>
          )}
          {claim.status === 'Approved' && (
            <button onClick={handleSettle} disabled={actionLoading} className="btn-primary text-sm">
              Settle Claim
            </button>
          )}
        </div>
      )}

      {/* Adjudication progress bar */}
      {claim.adjudicationStatus && (
        <div className="card mb-6">
          <h3 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Adjudication Progress</h3>
          <div className="flex items-center gap-2">
            {ADJ_STEPS.map((step, i) => {
              const isActive = step.status === claim.adjudicationStatus;
              const isDone = i < currentAdjIdx;
              return (
                <div key={step.status} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => canEdit && handleAdjudication(step.status)}
                    disabled={actionLoading || !canEdit}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-small font-medium transition-all w-full justify-center ${
                      isActive ? 'bg-accent-500 text-white shadow dark:bg-accent-600' :
                      isDone ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' :
                      'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600'
                    } ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {step.icon} {step.label}
                  </button>
                  {i < ADJ_STEPS.length - 1 && <ArrowRight size={14} className="text-neutral-300 dark:text-neutral-600 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-surface-border dark:border-neutral-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-body-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}
          >
            {t.icon} {t.label}
            {t.key === 'reserves' && claim.reserveAmount ? (
              <span className="ml-1 text-small bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400 px-1.5 py-0.5 rounded-full">{formatCurrency(claim.reserveAmount)}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab: Details */}
      {tab === 'details' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Claim Details</h3>
              <dl className="space-y-3 text-body-sm">
                {[
                  ['Claim ID', claim.id],
                  ['Policy', claim.policyId],
                  ['Type', claim.claimType],
                  ['Status', claim.status],
                  ['Filed', formatDate(claim.filedDate)],
                  ...(claim.incidentDate ? [['Incident Date', formatDate(claim.incidentDate)]] : []),
                  ...(claim.incidentLocation ? [['Incident Location', claim.incidentLocation]] : []),
                  ...(claim.reportedBy ? [['Reported By', claim.reportedBy]] : []),
                  ...(claim.assignedTo ? [['Assigned To', claim.assignedTo]] : []),
                  ...(claim.fnolId ? [['FNOL', claim.fnolId]] : []),
                ].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between">
                    <dt className="text-neutral-500 dark:text-neutral-400">{l}</dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Financial</h3>
              <dl className="space-y-3 text-body-sm">
                <div className="flex justify-between"><dt className="text-neutral-500 dark:text-neutral-400">Claim Amount</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{formatCurrency(claim.amount)}</dd></div>
                {claim.reserveAmount !== undefined && claim.reserveAmount > 0 && (
                  <div className="flex justify-between"><dt className="text-neutral-500 dark:text-neutral-400">Reserve</dt><dd className="font-medium text-info-600 dark:text-info-400">{formatCurrency(claim.reserveAmount)}</dd></div>
                )}
                {claim.settlementAmount !== undefined && (
                  <div className="flex justify-between"><dt className="text-neutral-500 dark:text-neutral-400">Settlement</dt><dd className="font-medium text-success-600 dark:text-success-400">{formatCurrency(claim.settlementAmount)}</dd></div>
                )}
              </dl>

              {/* Fraud quick summary */}
              {claim.fraudScore !== undefined && (
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700/50">
                  <h4 className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Fraud Assessment</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-body-sm font-bold ${fraudColor(claim.fraudScore)}`}>
                      {claim.fraudScore}
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {fraudLabel(claim.fraudScore)} Risk
                      </p>
                      {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
                        <p className="text-small text-neutral-500 dark:text-neutral-400">{claim.fraudIndicators.length} indicator(s) triggered</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Description</h3>
            <p className="text-body-sm text-neutral-700 dark:text-neutral-300">{claim.description}</p>
          </div>

          {claim.documents && claim.documents.length > 0 && (
            <div className="card mt-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Documents ({claim.documents.length})</h3>
              <div className="space-y-2">
                {claim.documents.map((doc, i) => (
                  <div key={i} className="flex justify-between text-body-sm p-2 bg-neutral-50 dark:bg-neutral-800/80 rounded">
                    <span className="text-neutral-900 dark:text-neutral-100">{doc.name}</span><span className="text-neutral-500 dark:text-neutral-400">{doc.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: Reserves */}
      {tab === 'reserves' && (
        <ReservePanel
          claimId={String(id)}
          currentReserve={claim.reserveAmount || 0}
          reserves={reserves}
          onReserveSet={() => { loadClaim(); loadExtras(); }}
        />
      )}

      {/* Tab: Fraud */}
      {tab === 'fraud' && (
        fraud ? <FraudIndicators assessment={fraud} /> : (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Shield size={32} className="mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
            <p className="text-body-sm">No fraud assessment available</p>
          </div>
        )
      )}

      {/* Tab: Mitigation */}
      {tab === 'mitigation' && (
        <LossMitigationPanel
          claimId={String(id)}
          mitigations={mitigations}
          onUpdate={() => loadExtras()}
          canEdit={canEdit}
        />
      )}

      {/* Tab: Timeline */}
      {tab === 'timeline' && (
        <ClaimsTimeline auditLogs={auditLogs} reserves={reserves} />
      )}

      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={() => handleStatusChange('Rejected')}
        title="Reject Claim"
        message={`Are you sure you want to reject claim ${claim.id}? This will notify the policyholder.`}
        confirmLabel="Reject Claim"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
}
