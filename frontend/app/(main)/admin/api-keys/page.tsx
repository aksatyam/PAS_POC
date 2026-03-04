'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import Modal from '@/components/ui/Modal';
import { Key, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Shield, Clock } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  rateLimit: number;
  lastUsedAt?: string;
  usageCount: number;
  permissions: string[];
  createdAt: string;
}

const PERMISSIONS = [
  'policies.read', 'policies.write',
  'claims.read', 'claims.write',
  'underwriting.read', 'underwriting.write',
  'billing.read', 'billing.write',
  'payments.write', 'documents.read', 'documents.write',
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<ApiKey | null>(null);
  const [form, setForm] = useState({ name: '', rateLimit: 100, permissions: [] as string[] });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadKeys(); }, []);

  async function loadKeys() {
    try {
      const res = await api.get('/integrations/keys');
      if (res.success) setKeys(res.data || []);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Operation failed' });
    }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/integrations/keys', form);
      if (res.success) {
        setNewKeyResult(res.data);
        setShowCreate(false);
        loadKeys();
        addToast({ type: 'success', title: 'API Key Created' });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally { setSaving(false); }
  }

  async function toggleKey(key: ApiKey) {
    try {
      await api.put(`/integrations/keys/${key.id}`, { isActive: !key.isActive });
      setKeys(keys.map((k) => k.id === key.id ? { ...k, isActive: !k.isActive } : k));
      addToast({ type: 'success', title: `Key ${!key.isActive ? 'activated' : 'deactivated'}` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Operation failed' });
    }
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    try {
      await api.delete(`/integrations/keys/${id}`);
      setKeys(keys.filter((k) => k.id !== id));
      addToast({ type: 'success', title: 'API Key Revoked' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Operation failed' });
    }
  }

  function togglePermission(perm: string) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-1">API Key Management</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{keys.length} keys, {keys.filter((k) => k.isActive).length} active</p>
        </div>
        <button onClick={() => { setForm({ name: '', rateLimit: 100, permissions: [] }); setShowCreate(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Generate Key
        </button>
      </div>

      {/* New Key Result */}
      {newKeyResult && (
        <div className="card bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800/40 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-success-600 dark:text-success-400" />
            <span className="text-body-sm font-medium text-success-800 dark:text-success-300">New API Key Generated</span>
          </div>
          <p className="text-small text-success-700 dark:text-success-400 mb-2">Copy this key now. It won't be shown in full again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white dark:bg-neutral-800 border border-success-200 dark:border-success-800/40 rounded px-3 py-2 text-body-sm font-mono text-neutral-900 dark:text-neutral-100">{newKeyResult.key}</code>
            <button onClick={() => { navigator.clipboard.writeText(newKeyResult.key); addToast({ type: 'success', title: 'Copied!' }); }} className="btn-secondary p-2"><Copy size={16} /></button>
          </div>
          <button onClick={() => setNewKeyResult(null)} className="text-small text-success-600 dark:text-success-400 mt-2 underline">Dismiss</button>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        {keys.map((key) => (
          <div key={key.id} className={`card transition-opacity ${!key.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Key size={16} className="text-accent-600 dark:text-accent-400" />
                  <span className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100">{key.name}</span>
                  <span className={`text-small px-2 py-0.5 rounded-full ${key.isActive ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'}`}>
                    {key.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-small text-neutral-500 dark:text-neutral-400 mt-1">
                  <code className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">{key.key}</code>
                  <span>Rate: {key.rateLimit}/min</span>
                  <span>Usage: {key.usageCount.toLocaleString()}</span>
                  {key.lastUsedAt && <span className="flex items-center gap-1"><Clock size={10} /> Last: {new Date(key.lastUsedAt).toLocaleDateString()}</span>}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {key.permissions.map((p) => (
                    <span key={p} className="text-small bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-400 px-2 py-0.5 rounded">{p}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleKey(key)} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  {key.isActive ? <ToggleRight size={20} className="text-success-600 dark:text-success-400" /> : <ToggleLeft size={20} className="text-neutral-400 dark:text-neutral-500" />}
                </button>
                <button onClick={() => revokeKey(key.id)} className="p-1.5 rounded hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 dark:text-error-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Generate API Key" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="form-label">Key Name</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. LOS Integration" required /></div>
          <div><label className="form-label">Rate Limit (requests/min)</label><input type="number" className="input-field" value={form.rateLimit} onChange={(e) => setForm({ ...form, rateLimit: Number(e.target.value) })} min={10} max={1000} /></div>
          <div>
            <label className="form-label">Permissions</label>
            <div className="grid grid-cols-3 gap-2">
              {PERMISSIONS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-body-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePermission(p)} className="rounded" />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Generating...' : 'Generate Key'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
