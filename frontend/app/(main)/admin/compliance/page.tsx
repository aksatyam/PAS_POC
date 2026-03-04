'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { ShieldCheck, Plus, Pencil, Trash2, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Due' | 'In Progress' | 'Not Applicable';
type ComplianceCategory = 'Regulatory' | 'Financial' | 'Operational' | 'Data Privacy' | 'Reporting';

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: ComplianceCategory;
  authority: string;
  status: ComplianceStatus;
  dueDate?: string;
  completedDate?: string;
  assignedTo?: string;
  evidence?: string;
  notes?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  recurrence: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplianceSummary {
  total: number;
  compliant: number;
  nonCompliant: number;
  due: number;
  inProgress: number;
  overdueCount: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

const CATEGORIES: ComplianceCategory[] = ['Regulatory', 'Financial', 'Operational', 'Data Privacy', 'Reporting'];
const STATUSES: ComplianceStatus[] = ['Compliant', 'Non-Compliant', 'Due', 'In Progress', 'Not Applicable'];

export default function CompliancePage() {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Partial<ComplianceRequirement> | null>(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [reqRes, sumRes] = await Promise.all([
        api.get('/compliance/requirements'),
        api.get('/compliance/summary'),
      ]);
      if (reqRes.success) setRequirements(reqRes.data || []);
      if (sumRes.success) setSummary(sumRes.data);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load compliance data' });
    }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditItem({
      name: '', description: '', category: 'Regulatory', authority: '',
      status: 'Due', priority: 'Medium', recurrence: 'Annual',
    });
    setShowForm(true);
  }

  function openEdit(item: ComplianceRequirement) {
    setEditItem({ ...item });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    try {
      if (editItem.id) {
        const res = await api.put(`/compliance/requirements/${editItem.id}`, editItem);
        if (res.success) {
          setRequirements(requirements.map(r => r.id === editItem.id ? { ...r, ...res.data } : r));
          addToast({ type: 'success', title: 'Requirement Updated' });
        }
      } else {
        const res = await api.post('/compliance/requirements', editItem);
        if (res.success) {
          setRequirements([...requirements, res.data]);
          addToast({ type: 'success', title: 'Requirement Created' });
        }
      }
      setShowForm(false);
      loadData();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally { setSaving(false); }
  }

  async function deleteItem(id: string) {
    if (!confirm('Remove this compliance requirement?')) return;
    try {
      await api.delete(`/compliance/requirements/${id}`);
      setRequirements(requirements.filter(r => r.id !== id));
      addToast({ type: 'success', title: 'Requirement Removed' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete compliance requirement' });
    }
  }

  function statusIcon(status: ComplianceStatus) {
    switch (status) {
      case 'Compliant': return <CheckCircle size={16} className="text-success-600 dark:text-success-400" />;
      case 'Non-Compliant': return <XCircle size={16} className="text-error-600 dark:text-error-400" />;
      case 'Due': return <Clock size={16} className="text-warning-500 dark:text-warning-400" />;
      case 'In Progress': return <Clock size={16} className="text-info-500 dark:text-info-400" />;
      default: return null;
    }
  }

  function priorityColor(p: string) {
    switch (p) {
      case 'Critical': return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400';
      case 'High': return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }

  const filtered = filter === 'All' ? requirements : requirements.filter(r => r.status === filter);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-lg" />)}</div>
        {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-1">Compliance Tracker</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{requirements.length} requirements tracked</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Requirement
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-h3 font-bold text-success-600 dark:text-success-400">{summary.compliant}</div>
            <div className="text-small text-neutral-500 dark:text-neutral-400">Compliant</div>
          </div>
          <div className="card text-center">
            <div className="text-h3 font-bold text-error-600 dark:text-error-400">{summary.nonCompliant}</div>
            <div className="text-small text-neutral-500 dark:text-neutral-400">Non-Compliant</div>
          </div>
          <div className="card text-center">
            <div className="text-h3 font-bold text-warning-500 dark:text-warning-400">{summary.due}</div>
            <div className="text-small text-neutral-500 dark:text-neutral-400">Due</div>
          </div>
          <div className="card text-center">
            <div className="text-h3 font-bold text-info-600 dark:text-info-400">{summary.inProgress}</div>
            <div className="text-small text-neutral-500 dark:text-neutral-400">In Progress</div>
          </div>
          <div className="card text-center">
            <div className="text-h3 font-bold text-error-700 dark:text-error-400">{summary.overdueCount}</div>
            <div className="text-small text-neutral-500 dark:text-neutral-400">Overdue</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-small rounded-full border transition-colors ${filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}>
            {s} {s === 'All' ? `(${requirements.length})` : `(${requirements.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Requirements List */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {statusIcon(item.status)}
                  <span className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100">{item.name}</span>
                  <span className={`text-small px-2 py-0.5 rounded-full ${priorityColor(item.priority)}`}>{item.priority}</span>
                  <span className="text-small bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded">{item.category}</span>
                </div>
                <p className="text-small text-neutral-600 dark:text-neutral-400 mb-2">{item.description}</p>
                <div className="flex items-center gap-4 text-small text-neutral-500 dark:text-neutral-400">
                  <span>Authority: {item.authority}</span>
                  <span>Recurrence: {item.recurrence}</span>
                  {item.dueDate && (
                    <span className={new Date(item.dueDate) < new Date() && item.status !== 'Compliant' ? 'text-error-600 dark:text-error-400 font-medium' : ''}>
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {item.completedDate && <span className="text-success-600 dark:text-success-400">Completed: {new Date(item.completedDate).toLocaleDateString()}</span>}
                </div>
                {item.notes && <p className="text-small text-neutral-400 dark:text-neutral-500 mt-1 italic">{item.notes}</p>}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"><Pencil size={16} className="text-neutral-500 dark:text-neutral-400" /></button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 dark:text-error-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-50" />
            <p>No requirements match this filter</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem?.id ? 'Edit Requirement' : 'Add Requirement'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="form-label">Name</label><input className="input-field" value={editItem?.name || ''} onChange={e => setEditItem({ ...editItem, name: e.target.value })} required /></div>
          <div><label className="form-label">Description</label><textarea className="input-field" rows={2} value={editItem?.description || ''} onChange={e => setEditItem({ ...editItem, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Category</label>
              <select className="input-field" value={editItem?.category || 'Regulatory'} onChange={e => setEditItem({ ...editItem, category: e.target.value as ComplianceCategory })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="form-label">Authority</label><input className="input-field" value={editItem?.authority || ''} onChange={e => setEditItem({ ...editItem, authority: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="form-label">Status</label>
              <select className="input-field" value={editItem?.status || 'Due'} onChange={e => setEditItem({ ...editItem, status: e.target.value as ComplianceStatus })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="form-label">Priority</label>
              <select className="input-field" value={editItem?.priority || 'Medium'} onChange={e => setEditItem({ ...editItem, priority: e.target.value as any })}>
                {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="form-label">Recurrence</label>
              <select className="input-field" value={editItem?.recurrence || 'Annual'} onChange={e => setEditItem({ ...editItem, recurrence: e.target.value })}>
                {['One-Time', 'Monthly', 'Quarterly', 'Annual'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Due Date</label><input type="date" className="input-field" value={editItem?.dueDate?.split('T')[0] || ''} onChange={e => setEditItem({ ...editItem, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} /></div>
            <div><label className="form-label">Assigned To (User ID)</label><input className="input-field" value={editItem?.assignedTo || ''} onChange={e => setEditItem({ ...editItem, assignedTo: e.target.value })} /></div>
          </div>
          <div><label className="form-label">Notes</label><textarea className="input-field" rows={2} value={editItem?.notes || ''} onChange={e => setEditItem({ ...editItem, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editItem?.id ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
