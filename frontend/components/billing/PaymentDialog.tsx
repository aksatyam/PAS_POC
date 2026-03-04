'use client';

import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { PaymentMethod } from '@/types';

interface PaymentDialogProps {
  billingAccountId: string;
  policyId: string;
  invoiceId?: string;
  suggestedAmount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['ACH', 'Wire', 'Check', 'Credit_Card', 'Escrow'];

export default function PaymentDialog({
  billingAccountId, policyId, invoiceId, suggestedAmount, onClose, onSuccess,
}: PaymentDialogProps) {
  const { addToast } = useToast();
  const [amount, setAmount] = useState(suggestedAmount || 0);
  const [method, setMethod] = useState<PaymentMethod>('ACH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) { addToast({ type: 'error', title: 'Amount must be greater than 0' }); return; }
    setSubmitting(true);
    try {
      await api.post('/billing/payments', {
        billingAccountId,
        policyId,
        invoiceId,
        amount,
        method,
        reference: reference || undefined,
        notes: notes || undefined,
      });
      addToast({ type: 'success', title: 'Payment recorded successfully' });
      onSuccess();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Payment Failed', message: err.message || 'Failed to record payment' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" /> Record Payment
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., Check #1234, Wire Ref"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
