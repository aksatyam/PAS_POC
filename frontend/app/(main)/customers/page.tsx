'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Customer } from '@/types';
import { formatDate } from '@/lib/utils';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/customers');
        if (res.success) setCustomers(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', street: '', city: '', state: '', pincode: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/customers', {
        name: form.name, email: form.email, phone: form.phone, dob: form.dob,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
      });
      if (res.success) {
        setShowCreate(false);
        setCustomers([res.data, ...customers]);
        addToast({ type: 'success', title: 'Customer Created', message: `${res.data.name} has been added successfully` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<Customer>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'riskCategory', label: 'Risk', render: (row) => <StatusBadge status={row.riskCategory} /> },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Customers</h1>
        {hasRole('Admin', 'Operations') && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Customer</button>
        )}
      </div>
      <DataTable columns={columns} data={customers} onRowClick={(row) => router.push(`/customers/${row.id}`)} loading={loading} searchable emptyIcon={Users} emptyMessage="No customers found" />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Customer" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Name</label><input className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
            <div><label className="form-label">Email</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
            <div><label className="form-label">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required /></div>
            <div><label className="form-label">Date of Birth</label><input type="date" className="input-field" value={form.dob} onChange={(e) => setForm({...form, dob: e.target.value})} required /></div>
            <div><label className="form-label">City</label><input className="input-field" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} required /></div>
            <div><label className="form-label">State</label><input className="input-field" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} required /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
