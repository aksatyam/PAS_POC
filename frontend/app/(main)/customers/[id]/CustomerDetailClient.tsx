'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Customer, Policy } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonText } from '@/components/ui/Skeleton';

function DetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="skeleton h-4 w-48 mb-4" />
      <div className="skeleton h-8 w-56 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card"><SkeletonText lines={5} /></div>
        <div className="card"><SkeletonText lines={3} /></div>
      </div>
      <div className="skeleton h-6 w-40 mb-4" />
      <div className="space-y-3">
        <div className="card"><SkeletonText lines={2} /></div>
        <div className="card"><SkeletonText lines={2} /></div>
      </div>
    </div>
  );
}

export default function CustomerDetailClient() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/customers/${id}`);
        if (res.success) {
          setCustomer(res.data?.customer || res.data);
          setPolicies(res.data?.policies || []);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!customer) return <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">Customer not found</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="text-h2 font-bold text-neutral-900 dark:text-neutral-100 mb-6">{customer.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Customer Information</h3>
          <dl className="space-y-3 text-body-sm">
            {[['ID', customer.id], ['Email', customer.email], ['Phone', customer.phone], ['DOB', formatDate(customer.dob)], ['Risk', customer.riskCategory]].map(([l, v]) => (
              <div key={String(l)} className="flex justify-between"><dt className="text-neutral-500 dark:text-neutral-400">{l}</dt><dd className="font-medium text-neutral-900 dark:text-neutral-100">{String(v)}</dd></div>
            ))}
          </dl>
        </div>
        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Address</h3>
          <p className="text-body-sm text-neutral-700 dark:text-neutral-300">{customer.address?.street}<br />{customer.address?.city}, {customer.address?.state} - {customer.address?.pincode}</p>
        </div>
      </div>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Linked Policies ({policies.length})</h2>
      {policies.length === 0 ? <p className="text-neutral-500 dark:text-neutral-400">No policies linked</p> : (
        <div className="space-y-3">
          {policies.map((p) => (
            <div key={p.id} onClick={() => router.push(`/policies/${p.id}`)} className="card cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all flex justify-between items-center">
              <div><p className="font-medium text-neutral-900 dark:text-neutral-100">{p.id}</p><p className="text-body-sm text-neutral-500 dark:text-neutral-400">{p.policyType}</p></div>
              <div className="text-right"><StatusBadge status={p.status} /><p className="text-body-sm mt-1 text-neutral-700 dark:text-neutral-300">{formatCurrency(p.premiumAmount)}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
