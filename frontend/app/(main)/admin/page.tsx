'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, AuditLog } from '@/types';
import { formatDateTime } from '@/lib/utils';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { roleColors } from '@/lib/utils';
import { Plus, Shield, ScrollText, Key, Webhook, Package, ShieldCheck, Layers } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'logs'>('users');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [uRes, lRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/logs').catch(() => ({ success: false, data: [] })),
        ]);
        if (uRes.success) setUsers(uRes.data || []);
        if (lRes.success) setLogs(Array.isArray(lRes.data) ? lRes.data : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (hasRole('Admin')) load();
    else setLoading(false);
  }, []);

  const [form, setForm] = useState({ name: '', email: '', role: 'Viewer', password: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/admin/users', form);
      if (res.success) {
        setShowCreate(false);
        setUsers([res.data, ...users]);
        addToast({ type: 'success', title: 'User Created', message: `${res.data.name} has been added as ${res.data.role}` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmUser) return;
    setToggling(true);
    try {
      const res = await api.delete(`/admin/users/${confirmUser.id}`);
      if (res.success) {
        setUsers(users.map(u => u.id === confirmUser.id ? { ...u, isActive: !u.isActive } : u));
        addToast({ type: 'success', title: 'Status Updated', message: `${confirmUser.name} has been ${confirmUser.isActive ? 'deactivated' : 'activated'}` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setToggling(false);
      setConfirmUser(null);
    }
  };

  if (!hasRole('Admin')) return <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">Access denied. Admin role required.</div>;

  const userColumns: Column<User>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[row.role] || ''}`}>{row.role}</span> },
    { key: 'isActive', label: 'Status', render: (row) => <StatusBadge status={row.isActive ? 'Active' : 'Cancelled'} /> },
    { key: 'actions', label: 'Actions', render: (row) => (
      <button onClick={(e) => { e.stopPropagation(); setConfirmUser(row); }} className="text-small text-error-600 dark:text-error-400 hover:underline">
        {row.isActive ? 'Deactivate' : 'Activate'}
      </button>
    )},
  ];

  const logColumns: Column<AuditLog>[] = [
    { key: 'timestamp', label: 'Time', sortable: true, render: (row) => formatDateTime(row.timestamp) },
    { key: 'action', label: 'Action' },
    { key: 'actor', label: 'Actor', render: (row) => `${row.actor?.userId} (${row.actor?.role})` },
    { key: 'resource', label: 'Resource', render: (row) => `${row.resource?.type} - ${row.resource?.id}` },
    { key: 'ipAddress', label: 'IP' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">Administration</h1>

      <div className="tab-nav flex-wrap">
        <button onClick={() => setTab('users')} className={`flex items-center gap-2 tab-item ${tab === 'users' ? 'tab-item-active' : 'tab-item-inactive'}`}>
          <Shield size={16} /> Users ({users.length})
        </button>
        <button onClick={() => setTab('logs')} className={`flex items-center gap-2 tab-item ${tab === 'logs' ? 'tab-item-active' : 'tab-item-inactive'}`}>
          <ScrollText size={16} /> Audit Logs ({logs.length})
        </button>
        <Link href="/admin/api-keys" className="flex items-center gap-2 tab-item tab-item-inactive">
          <Key size={16} /> API Keys
        </Link>
        <Link href="/admin/webhooks" className="flex items-center gap-2 tab-item tab-item-inactive">
          <Webhook size={16} /> Webhooks
        </Link>
        <Link href="/admin/products" className="flex items-center gap-2 tab-item tab-item-inactive">
          <Package size={16} /> Products
        </Link>
        <Link href="/admin/compliance" className="flex items-center gap-2 tab-item tab-item-inactive">
          <ShieldCheck size={16} /> Compliance
        </Link>
        <Link href="/admin/bulk-operations" className="flex items-center gap-2 tab-item tab-item-inactive">
          <Layers size={16} /> Bulk Operations
        </Link>
      </div>

      {tab === 'users' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add User</button>
          </div>
          <DataTable columns={userColumns} data={users} loading={loading} searchable emptyIcon={Shield} emptyMessage="No users found" />
        </>
      )}

      {tab === 'logs' && <DataTable columns={logColumns} data={logs} pageSize={20} loading={loading} searchable emptyIcon={ScrollText} emptyMessage="No audit logs" />}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="form-label">Name</label><input className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
          <div><label className="form-label">Email</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
          <div><label className="form-label">Role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
              {['Admin','Operations','Underwriter','Claims','Viewer'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div><label className="form-label">Password</label><input type="password" className="input-field" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleToggleStatus}
        title={confirmUser?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${confirmUser?.isActive ? 'deactivate' : 'activate'} ${confirmUser?.name}?`}
        confirmLabel={confirmUser?.isActive ? 'Deactivate' : 'Activate'}
        variant={confirmUser?.isActive ? 'danger' : 'default'}
        isLoading={toggling}
      />
    </div>
  );
}
