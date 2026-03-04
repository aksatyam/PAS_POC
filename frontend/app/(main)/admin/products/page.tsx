'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { Package, Plus, Pencil, Trash2, DollarSign, FileText } from 'lucide-react';

interface CoverageOption { name: string; minAmount: number; maxAmount: number; defaultAmount: number; }
interface EligibilityCriteria { field: string; label: string; operator: string; value: number | string | number[]; }

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  policyType: string;
  coverageOptions: CoverageOption[];
  eligibilityCriteria: EligibilityCriteria[];
  requiredDocuments: string[];
  defaultTermMonths: number;
  minPremium: number;
  maxPremium: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

const POLICY_TYPES = ['Mortgage Guarantee', 'Credit Protection', 'Coverage Plus'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const { addToast } = useToast();

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      const res = await api.get('/products');
      if (res.success) setProducts(res.data || []);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load products' });
    }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditProduct({
      name: '', code: '', description: '', status: 'Draft', policyType: 'Mortgage Guarantee',
      coverageOptions: [], eligibilityCriteria: [], requiredDocuments: [],
      defaultTermMonths: 12, minPremium: 500, maxPremium: 25000, commissionRate: 0.15,
    });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct({ ...p });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduct) return;
    setSaving(true);
    try {
      if (editProduct.id) {
        const res = await api.put(`/products/${editProduct.id}`, editProduct);
        if (res.success) {
          setProducts(products.map(p => p.id === editProduct.id ? { ...p, ...res.data } : p));
          addToast({ type: 'success', title: 'Product Updated' });
        }
      } else {
        const res = await api.post('/products', editProduct);
        if (res.success) {
          setProducts([...products, res.data]);
          addToast({ type: 'success', title: 'Product Created' });
        }
      }
      setShowForm(false);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally { setSaving(false); }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.map(p => p.id === id ? { ...p, status: 'Inactive' } : p));
      addToast({ type: 'success', title: 'Product Deactivated' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to deactivate product' });
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-1">Product Configuration</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{products.length} products, {products.filter(p => p.status === 'Active').length} active</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Product
        </button>
      </div>

      <div className="grid gap-4">
        {products.map(product => (
          <div key={product.id} className={`card ${product.status === 'Inactive' ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Package size={18} className="text-accent-600 dark:text-accent-400" />
                  <span className="font-semibold text-body-sm text-neutral-900 dark:text-neutral-100">{product.name}</span>
                  <code className="text-small bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">{product.code}</code>
                  <StatusBadge status={product.status} />
                </div>
                <p className="text-body-sm text-neutral-600 dark:text-neutral-400 mb-3">{product.description}</p>
                <div className="grid grid-cols-4 gap-4 text-small">
                  <div><span className="text-neutral-500 dark:text-neutral-400">Type:</span> <span className="font-medium text-neutral-700 dark:text-neutral-300">{product.policyType}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Term:</span> <span className="font-medium text-neutral-700 dark:text-neutral-300">{product.defaultTermMonths} months</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Premium:</span> <span className="font-medium text-neutral-700 dark:text-neutral-300">${product.minPremium.toLocaleString()} - ${product.maxPremium.toLocaleString()}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Commission:</span> <span className="font-medium text-neutral-700 dark:text-neutral-300">{(product.commissionRate * 100).toFixed(1)}%</span></div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.coverageOptions.map((c, i) => (
                    <span key={i} className="text-small bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-400 px-2 py-0.5 rounded">{c.name}: ${c.minAmount.toLocaleString()}-${c.maxAmount.toLocaleString()}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => setDetailProduct(product)} className="btn-secondary text-xs px-3 py-1.5">View Details</button>
                <button onClick={() => openEdit(product)} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"><Pencil size={16} className="text-neutral-500 dark:text-neutral-400" /></button>
                {product.status !== 'Inactive' && (
                  <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded hover:bg-error-50 dark:hover:bg-error-900/20 text-error-500 dark:text-error-400 transition-colors"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detailProduct} onClose={() => setDetailProduct(null)} title={detailProduct?.name || ''} size="lg">
        {detailProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-neutral-50 dark:bg-neutral-800/50">
                <h3 className="text-body-sm font-medium mb-2 flex items-center gap-2 text-neutral-900 dark:text-neutral-100"><DollarSign size={14} /> Coverage Options</h3>
                {detailProduct.coverageOptions.map((c, i) => (
                  <div key={i} className="text-small text-neutral-600 dark:text-neutral-400 mb-1">
                    <span className="font-medium">{c.name}</span>: ${c.minAmount.toLocaleString()} - ${c.maxAmount.toLocaleString()} (default: ${c.defaultAmount.toLocaleString()})
                  </div>
                ))}
              </div>
              <div className="card bg-neutral-50 dark:bg-neutral-800/50">
                <h3 className="text-body-sm font-medium mb-2 flex items-center gap-2 text-neutral-900 dark:text-neutral-100"><FileText size={14} /> Required Documents</h3>
                {detailProduct.requiredDocuments.map((d, i) => (
                  <div key={i} className="text-small text-neutral-600 dark:text-neutral-400 mb-1">- {d}</div>
                ))}
              </div>
            </div>
            <div className="card bg-neutral-50 dark:bg-neutral-800/50">
              <h3 className="text-body-sm font-medium mb-2 text-neutral-900 dark:text-neutral-100">Eligibility Criteria</h3>
              <div className="space-y-1">
                {detailProduct.eligibilityCriteria.map((c, i) => (
                  <div key={i} className="text-small text-neutral-600 dark:text-neutral-400">
                    <span className="font-medium">{c.label}</span>: {c.field} {c.operator} {Array.isArray(c.value) ? c.value.join(', ') : c.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editProduct?.id ? 'Edit Product' : 'New Product'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Product Name</label><input className="input-field" value={editProduct?.name || ''} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} required /></div>
            <div><label className="form-label">Product Code</label><input className="input-field" value={editProduct?.code || ''} onChange={e => setEditProduct({ ...editProduct, code: e.target.value })} required /></div>
          </div>
          <div><label className="form-label">Description</label><textarea className="input-field" rows={2} value={editProduct?.description || ''} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="form-label">Policy Type</label>
              <select className="input-field" value={editProduct?.policyType || ''} onChange={e => setEditProduct({ ...editProduct, policyType: e.target.value })}>
                {POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="form-label">Status</label>
              <select className="input-field" value={editProduct?.status || 'Draft'} onChange={e => setEditProduct({ ...editProduct, status: e.target.value })}>
                {['Draft', 'Active', 'Inactive'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="form-label">Term (months)</label><input type="number" className="input-field" value={editProduct?.defaultTermMonths ?? 12} onChange={e => setEditProduct({ ...editProduct, defaultTermMonths: Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="form-label">Min Premium ($)</label><input type="number" className="input-field" value={editProduct?.minPremium ?? 0} onChange={e => setEditProduct({ ...editProduct, minPremium: Number(e.target.value) })} /></div>
            <div><label className="form-label">Max Premium ($)</label><input type="number" className="input-field" value={editProduct?.maxPremium ?? 0} onChange={e => setEditProduct({ ...editProduct, maxPremium: Number(e.target.value) })} /></div>
            <div><label className="form-label">Commission Rate (%)</label><input type="number" step="0.01" className="input-field" value={((editProduct?.commissionRate ?? 0) * 100).toFixed(1)} onChange={e => setEditProduct({ ...editProduct, commissionRate: Number(e.target.value) / 100 })} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editProduct?.id ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
