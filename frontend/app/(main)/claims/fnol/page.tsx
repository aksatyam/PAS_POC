'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FNOL } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth';
import { Bell, Plus, ArrowRight, FileText, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = ['Incident Info', 'Policy & Contact', 'Damage & Parties', 'Review & Submit'];

export default function FNOLPage() {
  const [fnols, setFnols] = useState<FNOL[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [processConfirm, setProcessConfirm] = useState<string | null>(null);
  const [processLoading, setProcessLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { hasRole } = useAuth();

  const [form, setForm] = useState({
    policyId: '', claimType: 'Default' as const, incidentDate: '', incidentLocation: '',
    description: '', reportedBy: '', contactPhone: '', contactEmail: '',
    damageDescription: '', estimatedAmount: '',
    parties: [{ name: '', role: 'Claimant', contact: '' }],
  });

  const load = async () => {
    try {
      const res = await api.get('/claims/fnol', filterStatus ? { status: filterStatus } : undefined);
      if (res.success) setFnols(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/claims/fnol', {
        ...form,
        estimatedAmount: Number(form.estimatedAmount),
        partiesInvolved: form.parties.filter((p) => p.name),
      });
      if (res.success) {
        addToast({ type: 'success', title: 'FNOL Submitted', message: `FNOL ${res.data.id} created successfully` });
        setShowWizard(false);
        setStep(0);
        setForm({ policyId: '', claimType: 'Default', incidentDate: '', incidentLocation: '', description: '', reportedBy: '', contactPhone: '', contactEmail: '', damageDescription: '', estimatedAmount: '', parties: [{ name: '', role: 'Claimant', contact: '' }] });
        load();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async (fnolId: string) => {
    setProcessLoading(true);
    try {
      const res = await api.post(`/claims/fnol/${fnolId}/process`);
      if (res.success) {
        addToast({ type: 'success', title: 'FNOL Processed', message: `Claim ${res.data.claim.id} created from FNOL` });
        load();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setProcessLoading(false);
      setProcessConfirm(null);
    }
  };

  const addParty = () => setForm({ ...form, parties: [...form.parties, { name: '', role: '', contact: '' }] });
  const updateParty = (i: number, field: string, value: string) => {
    const updated = [...form.parties];
    (updated[i] as any)[field] = value;
    setForm({ ...form, parties: updated });
  };

  const pendingCount = fnols.filter((f) => f.status === 'Submitted').length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-0">First Notice of Loss</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{pendingCount} pending FNOL{pendingCount !== 1 ? 's' : ''}</p>
        </div>
        {hasRole('Admin', 'Claims', 'Operations') && (
          <button onClick={() => setShowWizard(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New FNOL
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-48">
          <option value="">All Status</option>
          {['Submitted', 'Processing', 'Claim Created'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
      ) : fnols.length === 0 ? (
        <EmptyState icon={Bell} title="No FNOLs found" description="Submit a First Notice of Loss to begin the claims process." />

      ) : (
        <div className="space-y-3">
          {fnols.map((fnol) => (
            <div key={fnol.id} className="card border border-neutral-100 dark:border-neutral-700 hover:border-neutral-200 dark:hover:border-neutral-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100">{fnol.id}</span>
                    <StatusBadge status={fnol.status} />
                    <span className="text-small text-neutral-500 dark:text-neutral-400">{fnol.claimType}</span>
                  </div>
                  <p className="text-body-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">{fnol.description}</p>
                  <div className="flex gap-4 mt-2 text-small text-neutral-400 dark:text-neutral-500">
                    <span>Policy: {fnol.policyId}</span>
                    <span>Incident: {formatDate(fnol.incidentDate)}</span>
                    <span>Reported by: {fnol.reportedBy}</span>
                  </div>
                  {fnol.claimId && (
                    <button
                      onClick={() => router.push(`/claims/${fnol.claimId}`)}
                      className="text-body-sm text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      Claim: {fnol.claimId} <ChevronRight size={12} />
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(fnol.estimatedAmount)}</p>
                  <p className="text-small text-neutral-400 dark:text-neutral-500">Estimated</p>
                </div>
              </div>

              {hasRole('Admin', 'Claims') && fnol.status === 'Submitted' && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700/50">
                  <button
                    onClick={() => setProcessConfirm(fnol.id)}
                    className="btn-primary text-xs flex items-center gap-1"
                  >
                    <ArrowRight size={14} /> Process & Create Claim
                  </button>
                </div>
              )}

              <p className="text-small text-neutral-400 dark:text-neutral-500 mt-2">{formatDateTime(fnol.createdAt)} by {fnol.createdBy}</p>
            </div>
          ))}
        </div>
      )}

      {/* FNOL Wizard Modal */}
      <Modal isOpen={showWizard} onClose={() => { setShowWizard(false); setStep(0); }} title="Submit FNOL" size="lg">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-small font-bold ${
                i < step ? 'bg-success-500 text-white' : i === step ? 'bg-accent-500 text-white' : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
              }`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-small hidden sm:inline ${i === step ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />}
            </div>
          ))}
        </div>

        {/* Step 0: Incident Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Incident Date</label>
                <input type="datetime-local" className="input-field" value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Claim Type</label>
                <select className="input-field" value={form.claimType} onChange={(e) => setForm({ ...form, claimType: e.target.value as any })}>
                  <option>Default</option><option>Property Damage</option><option>Fraud</option><option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Incident Location</label>
              <input className="input-field" value={form.incidentLocation} onChange={(e) => setForm({ ...form, incidentLocation: e.target.value })} required placeholder="Location where incident occurred" />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Describe the incident" />
            </div>
          </div>
        )}

        {/* Step 1: Policy & Contact */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Policy ID</label>
              <input className="input-field" value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })} required placeholder="e.g. POL-2025-00001" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Reported By</label>
                <input className="input-field" value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} required placeholder="Name of reporter" />
              </div>
              <div>
                <label className="form-label">Contact Phone</label>
                <input className="input-field" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} required placeholder="Phone number" />
              </div>
            </div>
            <div>
              <label className="form-label">Contact Email (optional)</label>
              <input type="email" className="input-field" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="Email address" />
            </div>
          </div>
        )}

        {/* Step 2: Damage & Parties */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Damage Description</label>
              <textarea className="input-field" rows={3} value={form.damageDescription} onChange={(e) => setForm({ ...form, damageDescription: e.target.value })} required placeholder="Detailed description of damage" />
            </div>
            <div>
              <label className="form-label">Estimated Amount (INR)</label>
              <input type="number" className="input-field" value={form.estimatedAmount} onChange={(e) => setForm({ ...form, estimatedAmount: e.target.value })} required placeholder="Estimated loss amount" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">Parties Involved</label>
                <button type="button" onClick={addParty} className="text-small text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1"><Plus size={12} /> Add Party</button>
              </div>
              {form.parties.map((p, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  <input className="input-field text-sm" placeholder="Name" value={p.name} onChange={(e) => updateParty(i, 'name', e.target.value)} />
                  <input className="input-field text-sm" placeholder="Role" value={p.role} onChange={(e) => updateParty(i, 'role', e.target.value)} />
                  <input className="input-field text-sm" placeholder="Contact" value={p.contact} onChange={(e) => updateParty(i, 'contact', e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100 mb-2">Review FNOL Details</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-body-sm">
                <div><dt className="text-neutral-500 dark:text-neutral-400">Incident Date</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.incidentDate || '—'}</dd></div>
                <div><dt className="text-neutral-500 dark:text-neutral-400">Claim Type</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.claimType}</dd></div>
                <div><dt className="text-neutral-500 dark:text-neutral-400">Policy ID</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.policyId || '—'}</dd></div>
                <div><dt className="text-neutral-500 dark:text-neutral-400">Estimated Amount</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.estimatedAmount ? formatCurrency(Number(form.estimatedAmount)) : '—'}</dd></div>
                <div><dt className="text-neutral-500 dark:text-neutral-400">Reported By</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.reportedBy || '—'}</dd></div>
                <div><dt className="text-neutral-500 dark:text-neutral-400">Phone</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{form.contactPhone || '—'}</dd></div>
              </dl>
              <div className="text-body-sm mt-2">
                <p className="text-neutral-500 dark:text-neutral-400 text-small">Location</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{form.incidentLocation || '—'}</p>
              </div>
              <div className="text-body-sm">
                <p className="text-neutral-500 dark:text-neutral-400 text-small">Description</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{form.description || '—'}</p>
              </div>
              <div className="text-body-sm">
                <p className="text-neutral-500 dark:text-neutral-400 text-small">Damage</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{form.damageDescription || '—'}</p>
              </div>
              {form.parties.filter((p) => p.name).length > 0 && (
                <div className="text-body-sm">
                  <p className="text-neutral-500 dark:text-neutral-400 text-small mb-1">Parties Involved</p>
                  {form.parties.filter((p) => p.name).map((p, i) => (
                    <p key={i} className="font-medium text-neutral-900 dark:text-neutral-100">{p.name} ({p.role}){p.contact ? ` — ${p.contact}` : ''}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-700/50">
          <button
            type="button"
            onClick={() => step > 0 ? setStep(step - 1) : setShowWizard(false)}
            className="btn-secondary flex items-center gap-1"
          >
            <ChevronLeft size={14} /> {step > 0 ? 'Back' : 'Cancel'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn-primary flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex items-center gap-1"
            >
              {submitting ? 'Submitting...' : 'Submit FNOL'}
            </button>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!processConfirm}
        onClose={() => setProcessConfirm(null)}
        onConfirm={() => processConfirm && handleProcess(processConfirm)}
        title="Process FNOL"
        message="This will create a new claim from this FNOL and link them together. Continue?"
        confirmLabel="Process & Create Claim"
        variant="default"
        isLoading={processLoading}
      />
    </div>
  );
}
