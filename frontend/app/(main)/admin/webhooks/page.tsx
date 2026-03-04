'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { Webhook, Plus, Trash2, TestTube, Pencil, ExternalLink } from 'lucide-react';

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  secret: string;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: number;
  failureCount: number;
  maxRetries: number;
  createdAt: string;
}

const EVENTS = [
  'policy.created', 'policy.updated', 'policy.cancelled',
  'claim.filed', 'claim.updated', 'claim.settled',
  'underwriting.evaluated', 'underwriting.overridden',
  'payment.recorded', 'invoice.generated',
];

export default function WebhooksPage() {
  const [hooks, setHooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editHook, setEditHook] = useState<Partial<WebhookData> | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => { loadHooks(); }, []);

  async function loadHooks() {
    try {
      const res = await api.get('/integrations/webhooks');
      if (res.success) setHooks(res.data || []);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Operation failed' });
    }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditHook({ name: '', url: '', events: [], maxRetries: 3 });
    setShowForm(true);
  }

  function openEdit(hook: WebhookData) {
    setEditHook({ ...hook });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editHook) return;
    setSaving(true);
    try {
      if (editHook.id) {
        const res = await api.put(`/integrations/webhooks/${editHook.id}`, editHook);
        if (res.success) {
          setHooks(hooks.map((h) => h.id === editHook.id ? { ...h, ...res.data } : h));
          addToast({ type: 'success', title: 'Webhook Updated' });
        }
      } else {
        const res = await api.post('/integrations/webhooks', editHook);
        if (res.success) {
          setHooks([...hooks, res.data]);
          addToast({ type: 'success', title: 'Webhook Created' });
        }
      }
      setShowForm(false);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally { setSaving(false); }
  }

  async function deleteHook(id: string) {
    if (!confirm('Remove this webhook?')) return;
    try {
      await api.delete(`/integrations/webhooks/${id}`);
      setHooks(hooks.filter((h) => h.id !== id));
      addToast({ type: 'success', title: 'Webhook Removed' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Operation failed' });
    }
  }

  async function testHook(id: string) {
    setTesting(id);
    try {
      const res = await api.post(`/integrations/webhooks/${id}/test`);
      if (res.success) {
        addToast({ type: 'success', title: 'Test Delivery', message: `Status: ${res.data.responseStatus} (${res.data.responseTime})` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Test Failed', message: err.message });
    } finally { setTesting(null); }
  }

  function toggleEvent(event: string) {
    if (!editHook) return;
    const events = editHook.events || [];
    setEditHook({
      ...editHook,
      events: events.includes(event) ? events.filter((e) => e !== event) : [...events, event],
    });
  }

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-1">Webhook Configuration</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{hooks.length} webhooks configured</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Webhook
        </button>
      </div>

      <div className="space-y-3">
        {hooks.map((hook) => (
          <div key={hook.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Webhook size={16} className="text-accent-600 dark:text-accent-400" />
                  <span className="font-medium text-body-sm text-neutral-900 dark:text-neutral-100">{hook.name}</span>
                  <StatusBadge status={hook.status} />
                  {hook.failureCount > 0 && (
                    <span className="text-small bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-400 px-2 py-0.5 rounded-full">{hook.failureCount} failures</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-small text-neutral-500 dark:text-neutral-400 mb-2">
                  <ExternalLink size={12} />
                  <code className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded truncate max-w-md">{hook.url}</code>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hook.events.map((ev) => (
                    <span key={ev} className="text-small bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-400 px-2 py-0.5 rounded">{ev}</span>
                  ))}
                </div>
                {hook.lastDeliveryAt && (
                  <div className="text-small text-neutral-400 dark:text-neutral-500 mt-2">
                    Last delivery: {new Date(hook.lastDeliveryAt).toLocaleString()} — Status: {hook.lastDeliveryStatus}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => testHook(hook.id)} disabled={testing === hook.id} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <TestTube size={14} /> {testing === hook.id ? 'Testing...' : 'Test'}
                </button>
                <button onClick={() => openEdit(hook)} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"><Pencil size={16} className="text-neutral-500 dark:text-neutral-400" /></button>
                <button onClick={() => deleteHook(hook.id)} className="p-1.5 rounded hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 dark:text-error-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editHook?.id ? 'Edit Webhook' : 'Add Webhook'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="form-label">Name</label><input className="input-field" value={editHook?.name || ''} onChange={(e) => setEditHook({ ...editHook, name: e.target.value })} required /></div>
          <div><label className="form-label">Callback URL</label><input type="url" className="input-field" value={editHook?.url || ''} onChange={(e) => setEditHook({ ...editHook, url: e.target.value })} placeholder="https://..." required /></div>
          <div>
            <label className="form-label">Events</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENTS.map((ev) => (
                <label key={ev} className="flex items-center gap-2 text-body-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={editHook?.events?.includes(ev) || false} onChange={() => toggleEvent(ev)} className="rounded" />
                  {ev}
                </label>
              ))}
            </div>
          </div>
          <div><label className="form-label">Max Retries</label><input type="number" min={0} max={10} className="input-field" value={editHook?.maxRetries ?? 3} onChange={(e) => setEditHook({ ...editHook, maxRetries: Number(e.target.value) })} /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editHook?.id ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
