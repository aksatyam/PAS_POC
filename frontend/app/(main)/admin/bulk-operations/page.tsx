'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import Modal from '@/components/ui/Modal';
import { Layers, Play, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

type OperationType = 'renewal' | 'cancel' | 'claim-update' | 'invoice';

interface BulkResult {
  entityId: string;
  success: boolean;
  message: string;
}

interface BulkOperation {
  id: string;
  type: string;
  status: string;
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  results: BulkResult[];
  startedAt: string;
  completedAt?: string;
  createdBy: string;
}

const OPERATIONS: { value: OperationType; label: string; description: string; placeholder: string }[] = [
  { value: 'renewal', label: 'Bulk Renewal', description: 'Mark policies for renewal processing', placeholder: 'POL-001, POL-002, POL-003' },
  { value: 'cancel', label: 'Bulk Cancellation', description: 'Cancel multiple policies at once', placeholder: 'POL-004, POL-005' },
  { value: 'claim-update', label: 'Bulk Claim Status Update', description: 'Update status on multiple claims', placeholder: 'CLM-001, CLM-002' },
  { value: 'invoice', label: 'Bulk Invoice Generation', description: 'Generate invoices for multiple billing accounts', placeholder: 'BA-001, BA-002' },
];

export default function BulkOperationsPage() {
  const [history, setHistory] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExecute, setShowExecute] = useState(false);
  const [selectedOp, setSelectedOp] = useState<OperationType>('renewal');
  const [entityIdsInput, setEntityIdsInput] = useState('');
  const [claimStatus, setClaimStatus] = useState('Under Review');
  const [invoiceAmount, setInvoiceAmount] = useState(1000);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<BulkOperation | null>(null);
  const { addToast } = useToast();

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const res = await api.get('/bulk');
      if (res.success) setHistory(res.data || []);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load bulk operations history' });
    }
    finally { setLoading(false); }
  }

  async function handleExecute() {
    const ids = entityIdsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      addToast({ type: 'error', title: 'No IDs provided' });
      return;
    }

    setExecuting(true);
    try {
      const body: any = { entityIds: ids };
      if (selectedOp === 'claim-update') body.parameters = { status: claimStatus };
      if (selectedOp === 'invoice') body.parameters = { amount: invoiceAmount };

      const res = await api.post(`/bulk/${selectedOp}`, body);
      if (res.success) {
        setResult(res.data);
        setHistory([res.data, ...history]);
        addToast({ type: 'success', title: 'Bulk Operation Complete', message: `${res.data.successCount} succeeded, ${res.data.failureCount} failed` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Operation Failed', message: err.message });
    } finally { setExecuting(false); }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'Completed': return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400';
      case 'Failed': return 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400';
      case 'Partial': return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400';
      case 'Processing': return 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400';
      default: return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-1">Bulk Operations</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">Execute batch operations on policies, claims, and billing</p>
        </div>
        <button onClick={() => { setShowExecute(true); setResult(null); }} className="btn-primary flex items-center gap-2">
          <Play size={18} /> New Operation
        </button>
      </div>

      {/* Operation Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {OPERATIONS.map(op => (
          <div key={op.value} className="card hover:border-accent-300 dark:hover:border-accent-700 cursor-pointer transition-colors" onClick={() => { setSelectedOp(op.value); setShowExecute(true); setResult(null); }}>
            <div className="flex items-center gap-3 mb-1">
              <Layers size={18} className="text-accent-600 dark:text-accent-400" />
              <span className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100">{op.label}</span>
            </div>
            <p className="text-small text-neutral-500 dark:text-neutral-400">{op.description}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <h2 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Recent Operations</h2>
      <div className="space-y-3">
        {history.map(op => (
          <div key={op.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100">{op.type.replace(/_/g, ' ')}</span>
                  <span className={`text-small px-2 py-0.5 rounded-full ${statusColor(op.status)}`}>{op.status}</span>
                </div>
                <div className="flex items-center gap-4 text-small text-neutral-500 dark:text-neutral-400">
                  <span>Total: {op.totalItems}</span>
                  <span className="text-success-600 dark:text-success-400">Success: {op.successCount}</span>
                  <span className="text-error-600 dark:text-error-400">Failed: {op.failureCount}</span>
                  <span>{new Date(op.startedAt).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => setResult(op)} className="btn-secondary text-xs px-3 py-1.5">View Results</button>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
            <Layers size={40} className="mx-auto mb-3 opacity-50" />
            <p>No bulk operations executed yet</p>
          </div>
        )}
      </div>

      {/* Execute Modal */}
      <Modal isOpen={showExecute && !result} onClose={() => setShowExecute(false)} title="Execute Bulk Operation" size="lg">
        <div className="space-y-4">
          <div>
            <label className="form-label">Operation Type</label>
            <select className="input-field" value={selectedOp} onChange={e => setSelectedOp(e.target.value as OperationType)}>
              {OPERATIONS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
            </select>
            <p className="text-small text-neutral-500 dark:text-neutral-400 mt-1">{OPERATIONS.find(o => o.value === selectedOp)?.description}</p>
          </div>

          <div>
            <label className="form-label">Entity IDs (comma-separated)</label>
            <textarea className="input-field" rows={3} value={entityIdsInput} onChange={e => setEntityIdsInput(e.target.value)}
              placeholder={OPERATIONS.find(o => o.value === selectedOp)?.placeholder} />
            <p className="text-small text-neutral-500 dark:text-neutral-400 mt-1">{entityIdsInput.split(',').filter(s => s.trim()).length} items</p>
          </div>

          {selectedOp === 'claim-update' && (
            <div>
              <label className="form-label">New Claim Status</label>
              <select className="input-field" value={claimStatus} onChange={e => setClaimStatus(e.target.value)}>
                {['Filed', 'Under Review', 'Approved', 'Rejected', 'Settled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {selectedOp === 'invoice' && (
            <div>
              <label className="form-label">Invoice Amount ($)</label>
              <input type="number" className="input-field" value={invoiceAmount} onChange={e => setInvoiceAmount(Number(e.target.value))} />
            </div>
          )}

          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/40 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warning-800 dark:text-warning-300 text-body-sm">
              <AlertTriangle size={16} />
              <span className="font-medium">This operation will process {entityIdsInput.split(',').filter(s => s.trim()).length} items and cannot be easily undone.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowExecute(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleExecute} disabled={executing || !entityIdsInput.trim()} className="btn-primary">
              {executing ? 'Processing...' : 'Execute Operation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal isOpen={!!result} onClose={() => setResult(null)} title="Operation Results" size="lg">
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="card bg-neutral-50 dark:bg-neutral-800/50 text-center">
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{result.totalItems}</div>
                <div className="text-small text-neutral-500 dark:text-neutral-400">Total</div>
              </div>
              <div className="card bg-success-50 dark:bg-success-900/20 text-center">
                <div className="text-lg font-bold text-success-600 dark:text-success-400">{result.successCount}</div>
                <div className="text-small text-neutral-500 dark:text-neutral-400">Success</div>
              </div>
              <div className="card bg-error-50 dark:bg-error-900/20 text-center">
                <div className="text-lg font-bold text-error-600 dark:text-error-400">{result.failureCount}</div>
                <div className="text-small text-neutral-500 dark:text-neutral-400">Failed</div>
              </div>
              <div className="card bg-info-50 dark:bg-info-900/20 text-center">
                <div className={`text-lg font-bold ${result.status === 'Completed' ? 'text-success-600 dark:text-success-400' : result.status === 'Failed' ? 'text-error-600 dark:text-error-400' : 'text-warning-600 dark:text-warning-400'}`}>{result.status}</div>
                <div className="text-small text-neutral-500 dark:text-neutral-400">Status</div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {result.results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-body-sm py-1.5 px-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  {r.success ? <CheckCircle size={14} className="text-success-600 dark:text-success-400 shrink-0" /> : <XCircle size={14} className="text-error-600 dark:text-error-400 shrink-0" />}
                  <code className="text-small bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded">{r.entityId}</code>
                  <span className="text-small text-neutral-600 dark:text-neutral-400">{r.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
