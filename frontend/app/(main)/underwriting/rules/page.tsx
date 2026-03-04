'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UnderwritingRule, RuleCategory, UnderwritingDecision } from '@/types';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { Settings, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Shield, AlertTriangle } from 'lucide-react';

const CATEGORIES: RuleCategory[] = ['Risk Assessment', 'Eligibility', 'Compliance', 'Pricing'];
const OPERATORS = ['gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'in', 'between'] as const;
const DECISIONS: UnderwritingDecision[] = ['Auto-Approve', 'Refer', 'Reject'];

const emptyRule: Partial<UnderwritingRule> = {
  name: '', category: 'Risk Assessment', criteria: '', field: '', operator: 'gte',
  value: 0, decision: 'Refer', notes: '', isActive: true, priority: 5,
};

export default function RulesConfigPage() {
  const [rules, setRules] = useState<UnderwritingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<Partial<UnderwritingRule> | null>(null);
  const [saving, setSaving] = useState(false);
  const { hasRole } = useAuth();
  const { addToast } = useToast();
  const isAdmin = hasRole('Admin');

  useEffect(() => { loadRules(); }, []);

  async function loadRules() {
    try {
      const res = await api.get('/uw/rules');
      if (res.success) setRules(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditRule({ ...emptyRule, id: '' });
    setShowForm(true);
  }

  function openEdit(rule: UnderwritingRule) {
    setEditRule({ ...rule });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editRule) return;
    setSaving(true);
    try {
      if (editRule.id) {
        const res = await api.put(`/uw/rules/${editRule.id}`, editRule);
        if (res.success) {
          setRules(rules.map((r) => r.id === editRule.id ? { ...r, ...res.data } : r));
          addToast({ type: 'success', title: 'Rule Updated' });
        }
      } else {
        const payload = { ...editRule }; delete (payload as any).id;
        const res = await api.post('/uw/rules', payload);
        if (res.success) {
          setRules([...rules, res.data]);
          addToast({ type: 'success', title: 'Rule Created' });
        }
      }
      setShowForm(false);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this rule?')) return;
    try {
      await api.delete(`/uw/rules/${id}`);
      setRules(rules.filter((r) => r.id !== id));
      addToast({ type: 'success', title: 'Rule Deleted' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  }

  async function toggleActive(rule: UnderwritingRule) {
    try {
      const res = await api.put(`/uw/rules/${rule.id}`, { isActive: !rule.isActive });
      if (res.success) {
        setRules(rules.map((r) => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));
        addToast({ type: 'success', title: `Rule ${!rule.isActive ? 'activated' : 'deactivated'}` });
      }
    } catch { /* ignore */ }
  }

  const groupedRules = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = rules.filter((r) => r.category === cat).sort((a, b) => a.priority - b.priority);
    return acc;
  }, {} as Record<string, UnderwritingRule[]>);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        {[1, 2, 3].map((i) => <div key={i} className="card h-32 animate-pulse bg-gray-100" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-1">Rule Configuration</h1>
          <p className="text-sm text-gray-500">{rules.length} rules configured, {rules.filter((r) => r.isActive).length} active</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Rule
          </button>
        )}
      </div>

      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const catRules = groupedRules[cat] || [];
          if (catRules.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                {cat === 'Risk Assessment' && <AlertTriangle size={14} />}
                {cat === 'Compliance' && <Shield size={14} />}
                {cat === 'Eligibility' && <Settings size={14} />}
                {cat}
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{catRules.length}</span>
              </h2>
              <div className="space-y-2">
                {catRules.map((rule) => (
                  <div key={rule.id} className={`card flex items-center justify-between transition-opacity ${!rule.isActive ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs font-medium text-accent-600 bg-accent-50 px-2 py-0.5 rounded">{rule.id}</span>
                        <span className="font-medium text-sm">{rule.name}</span>
                        <StatusBadge status={rule.decision} />
                        <span className="text-xs text-gray-400">Priority: {rule.priority}</span>
                      </div>
                      <p className="text-sm text-gray-600">{rule.criteria}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Field: <code className="bg-gray-100 px-1 rounded">{rule.field}</code> {rule.operator} <code className="bg-gray-100 px-1 rounded">{JSON.stringify(rule.value)}</code>
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => toggleActive(rule)} className="p-1.5 rounded hover:bg-gray-100" title={rule.isActive ? 'Deactivate' : 'Activate'}>
                          {rule.isActive ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} className="text-gray-400" />}
                        </button>
                        <button onClick={() => openEdit(rule)} className="p-1.5 rounded hover:bg-gray-100"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editRule?.id ? 'Edit Rule' : 'Create Rule'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Rule Name</label><input className="input-field" value={editRule?.name || ''} onChange={(e) => setEditRule({ ...editRule, name: e.target.value })} required /></div>
            <div>
              <label className="form-label">Category</label>
              <select className="input-field" value={editRule?.category || 'Risk Assessment'} onChange={(e) => setEditRule({ ...editRule, category: e.target.value as RuleCategory })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className="form-label">Criteria Description</label><input className="input-field" value={editRule?.criteria || ''} onChange={(e) => setEditRule({ ...editRule, criteria: e.target.value })} required /></div>
            <div><label className="form-label">Field</label><input className="input-field" placeholder="e.g. creditScore" value={editRule?.field || ''} onChange={(e) => setEditRule({ ...editRule, field: e.target.value })} required /></div>
            <div>
              <label className="form-label">Operator</label>
              <select className="input-field" value={editRule?.operator || 'gte'} onChange={(e) => setEditRule({ ...editRule, operator: e.target.value as any })}>
                {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            <div><label className="form-label">Value</label><input className="input-field" value={typeof editRule?.value === 'object' ? JSON.stringify(editRule?.value) : String(editRule?.value ?? '')} onChange={(e) => { let v: any = e.target.value; try { v = JSON.parse(v); } catch { v = isNaN(Number(v)) ? v : Number(v); } setEditRule({ ...editRule, value: v }); }} required /></div>
            <div>
              <label className="form-label">Decision</label>
              <select className="input-field" value={editRule?.decision || 'Refer'} onChange={(e) => setEditRule({ ...editRule, decision: e.target.value as UnderwritingDecision })}>
                {DECISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="form-label">Priority (1-10)</label><input type="number" min={1} max={10} className="input-field" value={editRule?.priority ?? 5} onChange={(e) => setEditRule({ ...editRule, priority: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isActive" checked={editRule?.isActive ?? true} onChange={(e) => setEditRule({ ...editRule, isActive: e.target.checked })} className="rounded" />
              <label htmlFor="isActive" className="text-sm">Active</label>
            </div>
            <div className="col-span-2"><label className="form-label">Notes</label><textarea className="input-field" rows={2} value={editRule?.notes || ''} onChange={(e) => setEditRule({ ...editRule, notes: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editRule?.id ? 'Update Rule' : 'Create Rule'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
