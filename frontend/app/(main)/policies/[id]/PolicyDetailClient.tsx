'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Policy, PolicyVersion, AuditLog, Endorsement, Renewal, BillingAccount } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import PolicyTimeline from '@/components/policy/PolicyTimeline';
import EndorsementPanel from '@/components/policy/EndorsementPanel';
import StatusFlowDiagram from '@/components/policy/StatusFlowDiagram';
import {
  Clock, History, FileText, PenLine, RefreshCw, BookmarkCheck, Send,
  Undo2, Activity, ArrowRight, FolderOpen, Wand2, Eye, CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import GenerateDialog from '@/components/documents/GenerateDialog';
import DocumentViewer from '@/components/documents/DocumentViewer';

type TabKey = 'details' | 'versions' | 'audit' | 'endorsements' | 'renewals' | 'timeline' | 'documents' | 'billing';

function DetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="skeleton h-4 w-48 mb-4" />
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2"><div className="skeleton h-8 w-40" /><div className="skeleton h-4 w-56" /></div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4"><SkeletonText lines={5} /></div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4"><SkeletonText lines={6} /></div>
      </div>
    </div>
  );
}

export default function PolicyDetailClient() {
  const { id } = useParams();
  const router = useRouter();
  const { hasRole } = useAuth();
  const { addToast } = useToast();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [transitions, setTransitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('details');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [policyDocs, setPolicyDocs] = useState<any[]>([]);
  const [showGenDoc, setShowGenDoc] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<any>(null);
  const [billingAccount, setBillingAccount] = useState<BillingAccount | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [pRes, vRes, aRes, eRes, rRes, tRes, dRes, bRes] = await Promise.all([
        api.get(`/policies/${id}`),
        api.get(`/policies/${id}/versions`).catch(() => ({ success: false, data: [] })),
        api.get(`/policies/${id}/audit`).catch(() => ({ success: false, data: [] })),
        api.get(`/policies/${id}/endorsements`).catch(() => ({ success: false, data: [] })),
        api.get(`/policies/${id}/renewals`).catch(() => ({ success: false, data: [] })),
        api.get(`/policies/${id}/transitions`).catch(() => ({ success: false, data: [] })),
        api.get(`/documents/policy/${id}`).catch(() => ({ success: false, data: [] })),
        api.get(`/billing/accounts/policy/${id}`).catch(() => ({ success: false, data: null })),
      ]);
      if (pRes.success) setPolicy(pRes.data);
      if (vRes.success) setVersions(vRes.data || []);
      if (aRes.success) setAudit(aRes.data || []);
      if (eRes.success) setEndorsements(eRes.data || []);
      if (rRes.success) setRenewals(rRes.data || []);
      if (tRes.success) setTransitions(tRes.data?.allowedTransitions || tRes.data || []);
      if (dRes.success) setPolicyDocs(dRes.data || []);
      if (bRes.success) setBillingAccount(bRes.data || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/policies/${id}/status`, { status: newStatus });
      if (res.success) {
        setPolicy(res.data);
        addToast({ type: 'success', title: 'Status Updated', message: `Policy moved to ${newStatus}` });
        loadAll();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally { setActionLoading(false); setConfirmAction(null); }
  };

  const handleLifecycleAction = async (action: string) => {
    setActionLoading(true);
    try {
      let res;
      switch (action) {
        case 'bind':
          res = await api.post(`/policies/${id}/bind`);
          break;
        case 'issue':
          res = await api.post(`/policies/${id}/issue`);
          break;
        case 'reinstate':
          res = await api.post(`/policies/${id}/reinstate`);
          break;
        case 'renew':
          res = await api.post(`/policies/${id}/renew`);
          break;
        default:
          return;
      }
      if (res?.success) {
        addToast({ type: 'success', title: 'Action Completed', message: `Policy ${action} successful` });
        loadAll();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    } finally { setActionLoading(false); setConfirmAction(null); }
  };

  const requestAction = (action: string) => {
    if (['Cancelled', 'Lapsed', 'bind', 'issue', 'reinstate', 'renew'].includes(action)) {
      setConfirmAction(action);
    } else {
      handleStatusChange(action);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!policy) return <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">Policy not found</div>;

  // Build lifecycle action buttons
  const lifecycleButtons: { label: string; action: string; variant: 'primary' | 'secondary' | 'danger'; icon: React.ReactNode }[] = [];
  if (policy.status === 'Quoted') lifecycleButtons.push({ label: 'Bind Policy', action: 'bind', variant: 'primary', icon: <BookmarkCheck size={14} /> });
  if (policy.status === 'Bound') lifecycleButtons.push({ label: 'Issue Policy', action: 'issue', variant: 'primary', icon: <Send size={14} /> });
  if (policy.status === 'Lapsed') lifecycleButtons.push({ label: 'Reinstate', action: 'reinstate', variant: 'primary', icon: <Undo2 size={14} /> });
  if (['Active', 'Issued', 'Endorsed', 'Reinstated'].includes(policy.status)) {
    lifecycleButtons.push({ label: 'Initiate Renewal', action: 'renew', variant: 'secondary', icon: <RefreshCw size={14} /> });
  }

  // Status transition buttons
  const statusButtons: { label: string; status: string; variant: 'primary' | 'danger' }[] = [];
  if (transitions.includes('Active')) statusButtons.push({ label: 'Activate', status: 'Active', variant: 'primary' });
  if (transitions.includes('Lapsed')) statusButtons.push({ label: 'Lapse', status: 'Lapsed', variant: 'danger' });
  if (transitions.includes('Cancelled')) statusButtons.push({ label: 'Cancel', status: 'Cancelled', variant: 'danger' });

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'details', label: 'Details', icon: <FileText size={15} /> },
    { key: 'endorsements', label: 'Endorsements', icon: <PenLine size={15} />, count: endorsements.length },
    { key: 'renewals', label: 'Renewals', icon: <RefreshCw size={15} />, count: renewals.length },
    { key: 'timeline', label: 'Timeline', icon: <Activity size={15} /> },
    { key: 'versions', label: 'Versions', icon: <History size={15} />, count: versions.length },
    { key: 'billing', label: 'Billing', icon: <CreditCard size={15} /> },
    { key: 'documents', label: 'Documents', icon: <FolderOpen size={15} />, count: policyDocs.length },
    { key: 'audit', label: 'Audit', icon: <Clock size={15} />, count: audit.length },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">{policy.id}</h1>
          <p className="text-neutral-500 dark:text-neutral-400">{policy.policyType} &middot; Version {policy.version}</p>
          {policy.renewalOf && (
            <p className="text-sm text-warning mt-1">
              Renewed from <button onClick={() => router.push(`/policies/${policy.renewalOf}`)} className="underline hover:text-amber-800 dark:hover:text-amber-300">{policy.renewalOf}</button>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <StatusBadge status={policy.status} />
          {hasRole('Admin', 'Operations') && (
            <>
              {lifecycleButtons.map((btn) => (
                <button key={btn.action} onClick={() => requestAction(btn.action)} disabled={actionLoading}
                  className={`${btn.variant === 'danger' ? 'px-4 py-2 bg-error hover:bg-red-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm' : btn.variant === 'secondary' ? 'px-4 py-2 bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg font-medium text-body-sm transition-colors duration-micro' : 'px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm'} text-sm flex items-center gap-1`}>
                  {btn.icon} {btn.label}
                </button>
              ))}
              {statusButtons.map((btn) => (
                <button key={btn.status} onClick={() => requestAction(btn.status)} disabled={actionLoading}
                  className={`${btn.variant === 'danger' ? 'px-4 py-2 bg-error hover:bg-red-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm' : 'px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm'} text-sm`}>
                  {btn.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Status Flow Diagram */}
      <div className="mb-6">
        <StatusFlowDiagram
          currentStatus={policy.status}
          allowedTransitions={transitions}
          onTransition={hasRole('Admin', 'Operations') ? (s) => requestAction(s) : undefined}
          isLoading={actionLoading}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-border dark:border-neutral-700 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? 'px-4 py-2.5 text-body-sm font-medium text-accent-600 dark:text-accent-400 border-b-2 border-accent-500 -mb-px transition-colors duration-micro' : 'px-4 py-2.5 text-body-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 border-b-2 border-transparent hover:border-neutral-300 -mb-px transition-colors duration-micro'}>
            <span className="inline-flex items-center gap-1.5">
              {t.icon}
              {t.label}
              {t.count !== undefined && <span className="text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded-full">{t.count}</span>}
            </span>
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4">
            <h3 className="font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Policy Information</h3>
            <dl className="space-y-3 text-sm">
              {([
                ['Policy ID', policy.id],
                ['Type', policy.policyType],
                ['Status', policy.status],
                ['Risk Category', policy.riskCategory],
                ['Version', policy.version],
              ] as [string, any][]).map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">{String(val)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4">
            <h3 className="font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Financial Details</h3>
            <dl className="space-y-3 text-sm">
              {([
                ['Premium', formatCurrency(policy.premiumAmount)],
                ['Coverage', formatCurrency(policy.coverageAmount)],
                ['Start Date', formatDate(policy.startDate)],
                ['End Date', formatDate(policy.endDate)],
                ['Customer', policy.customerId],
                ['Created', formatDateTime(policy.createdAt)],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {tab === 'endorsements' && (
        <EndorsementPanel policy={policy} endorsements={endorsements} onRefresh={loadAll} />
      )}

      {tab === 'renewals' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={18} className="text-warning" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Renewals</h3>
            <span className="text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full">{renewals.length}</span>
          </div>
          {renewals.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <RefreshCw size={32} className="mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
              No renewals for this policy
            </div>
          ) : (
            <div className="space-y-3">
              {renewals.map((r) => (
                <div key={r.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{r.id}</span>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">{formatCurrency(r.newPremiumAmount)}</span>
                      <p className={`text-xs ${r.premiumChange > 0 ? 'text-error' : r.premiumChange < 0 ? 'text-success' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {r.premiumChange > 0 ? '+' : ''}{formatCurrency(r.premiumChange)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <div><span className="block text-neutral-400 dark:text-neutral-500">Coverage</span>{formatCurrency(r.newCoverageAmount)}</div>
                    <div><span className="block text-neutral-400 dark:text-neutral-500">New Period</span>{formatDate(r.newStartDate)} — {formatDate(r.newEndDate)}</div>
                    <div><span className="block text-neutral-400 dark:text-neutral-500">Renewal Date</span>{formatDate(r.renewalDate)}</div>
                  </div>
                  {r.renewedPolicyId && (
                    <p className="text-sm text-success mt-2">
                      <ArrowRight size={12} className="inline mr-1" />
                      Renewed as <button onClick={() => router.push(`/policies/${r.renewedPolicyId}`)} className="underline hover:text-emerald-700 dark:hover:text-emerald-300">{r.renewedPolicyId}</button>
                    </p>
                  )}
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">Created {formatDateTime(r.createdAt)} by {r.createdBy}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4">
          <PolicyTimeline audit={audit} endorsements={endorsements} renewals={renewals} />
        </div>
      )}

      {tab === 'versions' && (
        <div className="space-y-3">
          {versions.length === 0 ? (
            <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">No version history</p>
          ) : versions.map((v) => (
            <div key={v.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">Version {v.version}</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{formatDateTime(v.timestamp)}</span>
              </div>
              <div className="text-sm space-y-1">
                {Object.entries(v.changes).map(([field, change]) => (
                  <p key={field}><span className="text-neutral-500 dark:text-neutral-400">{field}:</span> <span className="text-error line-through">{String(change.from)}</span> → <span className="text-success">{String(change.to)}</span></p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'billing' && (
        <div>
          {billingAccount ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Premium</p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(billingAccount.totalPremium)}</p>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Balance</p>
                  <p className={`text-lg font-bold ${billingAccount.balance > 0 ? 'text-error' : 'text-success'}`}>
                    {formatCurrency(billingAccount.balance)}
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Frequency</p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{billingAccount.paymentFrequency}</p>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
                  <StatusBadge status={billingAccount.status} />
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4">
                <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><dt className="text-neutral-500 dark:text-neutral-400">Account ID</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{billingAccount.id}</dd></div>
                  <div><dt className="text-neutral-500 dark:text-neutral-400">Payment Method</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{billingAccount.paymentMethod.replace('_', ' ')}</dd></div>
                  <div><dt className="text-neutral-500 dark:text-neutral-400">Next Due</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{formatDate(billingAccount.nextDueDate)}</dd></div>
                  <div><dt className="text-neutral-500 dark:text-neutral-400">Last Payment</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{billingAccount.lastPaymentDate ? formatDate(billingAccount.lastPaymentDate) : '—'}</dd></div>
                  <div><dt className="text-neutral-500 dark:text-neutral-400">Grace Period</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{billingAccount.gracePeriodDays} days</dd></div>
                  <div><dt className="text-neutral-500 dark:text-neutral-400">Auto-Pay</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{billingAccount.autopay ? 'Enabled' : 'Disabled'}</dd></div>
                </dl>
              </div>
              <button onClick={() => router.push(`/billing/${billingAccount.id}`)} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm text-sm flex items-center gap-1.5">
                <CreditCard size={14} /> View Full Billing Details
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <CreditCard size={32} className="mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
              No billing account linked to this policy
            </div>
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div>
          <div className="flex justify-end mb-3">
            <button onClick={() => setShowGenDoc(true)} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-body-sm transition-colors duration-micro shadow-sm text-sm flex items-center gap-1.5">
              <Wand2 size={15} /> Generate Document
            </button>
          </div>
          {policyDocs.length === 0 ? (
            <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">No documents for this policy</p>
          ) : (
            <div className="space-y-2">
              {policyDocs.map((doc: any) => (
                <div key={doc.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-accent-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{doc.filename}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{doc.type} &middot; {(doc.size / 1024).toFixed(0)} KB &middot; v{doc.version || 1}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewerDoc(doc)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"><Eye size={15} className="text-neutral-500 dark:text-neutral-400" /></button>
                </div>
              ))}
            </div>
          )}
          <GenerateDialog
            isOpen={showGenDoc}
            onClose={() => setShowGenDoc(false)}
            policyId={String(id)}
            defaultData={{
              policyNumber: policy?.id || '',
              insuredName: policy?.customerId || '',
              policyType: policy?.policyType || '',
              effectiveDate: policy?.startDate ? formatDate(policy.startDate) : '',
              expiryDate: policy?.endDate ? formatDate(policy.endDate) : '',
              coverageAmount: policy?.coverageAmount ? formatCurrency(policy.coverageAmount) : '',
              premium: policy?.premiumAmount ? formatCurrency(policy.premiumAmount) : '',
            }}
            onGenerated={(doc, html) => {
              addToast({ type: 'success', title: 'Generated', message: `${doc.filename} created` });
              setViewerDoc({ ...doc, htmlContent: html });
              loadAll();
            }}
          />
          <DocumentViewer isOpen={!!viewerDoc} onClose={() => setViewerDoc(null)} document={viewerDoc} />
        </div>
      )}

      {tab === 'audit' && (
        <div className="space-y-2">
          {audit.length === 0 ? (
            <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">No audit logs</p>
          ) : audit.map((log) => (
            <div key={log.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 py-3">
              <div className="flex justify-between items-center text-sm">
                <div className="text-neutral-900 dark:text-neutral-100"><span className="font-medium">{log.action}</span> by <span className="text-accent-600 dark:text-accent-400">{log.actor.userId}</span> ({log.actor.role})</div>
                <span className="text-neutral-500 dark:text-neutral-400">{formatDateTime(log.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return;
          if (['bind', 'issue', 'reinstate', 'renew'].includes(confirmAction)) {
            handleLifecycleAction(confirmAction);
          } else {
            handleStatusChange(confirmAction);
          }
        }}
        title={
          confirmAction === 'Cancelled' ? 'Cancel Policy' :
          confirmAction === 'Lapsed' ? 'Lapse Policy' :
          confirmAction === 'bind' ? 'Bind Policy' :
          confirmAction === 'issue' ? 'Issue Policy' :
          confirmAction === 'reinstate' ? 'Reinstate Policy' :
          confirmAction === 'renew' ? 'Initiate Renewal' : 'Confirm Action'
        }
        message={
          confirmAction === 'Cancelled' ? `Are you sure you want to cancel policy ${policy.id}? This action cannot be undone.` :
          confirmAction === 'Lapsed' ? `Are you sure you want to mark policy ${policy.id} as lapsed?` :
          confirmAction === 'bind' ? `Bind policy ${policy.id}? This locks in the quoted terms.` :
          confirmAction === 'issue' ? `Issue policy ${policy.id}? This will make the policy effective.` :
          confirmAction === 'reinstate' ? `Reinstate policy ${policy.id}? Back-premium may apply.` :
          confirmAction === 'renew' ? `Initiate renewal for policy ${policy.id}? A renewal quote will be generated.` :
          'Are you sure?'
        }
        confirmLabel={
          confirmAction === 'Cancelled' ? 'Cancel Policy' :
          confirmAction === 'Lapsed' ? 'Mark Lapsed' :
          confirmAction === 'bind' ? 'Bind' :
          confirmAction === 'issue' ? 'Issue' :
          confirmAction === 'reinstate' ? 'Reinstate' :
          confirmAction === 'renew' ? 'Initiate Renewal' : 'Confirm'
        }
        variant={['Cancelled', 'Lapsed'].includes(confirmAction || '') ? 'danger' : 'default'}
        isLoading={actionLoading}
      />
    </div>
  );
}
