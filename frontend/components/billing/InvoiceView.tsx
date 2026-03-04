'use client';

import { Invoice } from '@/types';
import { X, Printer, FileText } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface InvoiceViewProps {
  invoice: Invoice;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Paid: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
  Void: 'bg-gray-100 text-gray-800',
  Partially_Paid: 'bg-blue-100 text-blue-800',
};

export default function InvoiceView({ invoice, onClose }: InvoiceViewProps) {
  const fmt = formatCurrency;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Invoice {invoice.invoiceNumber}
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="p-1.5 hover:bg-gray-100 rounded" title="Print">
              <Printer size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded"><X size={18} /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Policy</p>
              <p className="font-medium">{invoice.policyId}</p>
            </div>
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusColors[invoice.status] || 'bg-gray-100')}>
              {invoice.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Issued</p>
              <p className="font-medium">{new Date(invoice.issuedDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Paid Date</p>
              <p className="font-medium">{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '—'}</p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Description</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((li, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2">{li.description}</td>
                    <td className="px-4 py-2 text-gray-500">{li.type}</td>
                    <td className="px-4 py-2 text-right font-mono">{fmt(li.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">{fmt(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="text-green-600 font-medium">{fmt(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-1">
              <span className="font-medium">Balance Due</span>
              <span className="font-bold text-lg">{fmt(invoice.amount - invoice.amountPaid)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="w-full px-4 py-2 border rounded-lg text-sm hover:bg-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
