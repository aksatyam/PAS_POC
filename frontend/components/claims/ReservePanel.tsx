'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Reserve } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/lib/toast';
import { DollarSign, TrendingUp, TrendingDown, Plus, History } from 'lucide-react';

interface Props {
  claimId: string;
  currentReserve: number;
  reserves: Reserve[];
  onReserveSet: () => void;
}

export default function ReservePanel({ claimId, currentReserve, reserves, onReserveSet }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/claims/${claimId}/reserve`, {
        amount: Number(amount),
        reason,
      });
      if (res.success) {
        addToast({ type: 'success', title: 'Reserve Updated', message: `Reserve set to ${formatCurrency(Number(amount))}` });
        setShowForm(false);
        setAmount('');
        setReason('');
        onReserveSet();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current reserve summary */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <DollarSign size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium">Current Reserve</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(currentReserve)}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={14} /> {showForm ? 'Cancel' : 'Adjust Reserve'}
        </button>
      </div>

      {/* Reserve form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card border border-blue-200 space-y-3">
          <h4 className="font-semibold text-sm">Set Reserve Amount</h4>
          <div>
            <label className="form-label">Amount (INR)</label>
            <input
              type="number"
              className="input-field"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Enter reserve amount"
            />
          </div>
          <div>
            <label className="form-label">Reason</label>
            <textarea
              className="input-field"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Reason for reserve adjustment"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? 'Saving...' : 'Set Reserve'}
            </button>
          </div>
        </form>
      )}

      {/* Reserve history */}
      <div>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-1">
          <History size={14} /> Reserve History ({reserves.length})
        </h4>
        {reserves.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No reserve history</p>
        ) : (
          <div className="space-y-2">
            {[...reserves].reverse().map((r) => {
              const isIncrease = r.amount > r.previousAmount;
              const delta = r.amount - r.previousAmount;
              return (
                <div key={r.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className={`mt-0.5 ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                    {isIncrease ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.type} />
                      <span className="text-sm font-semibold">{formatCurrency(r.amount)}</span>
                      <span className={`text-xs ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                        ({isIncrease ? '+' : ''}{formatCurrency(delta)})
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{r.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(r.createdAt)} by {r.createdBy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
