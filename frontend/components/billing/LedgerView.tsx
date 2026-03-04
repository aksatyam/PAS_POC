'use client';

import { LedgerEntry } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface LedgerViewProps {
  entries: LedgerEntry[];
}

export default function LedgerView({ entries }: LedgerViewProps) {
  const fmt = formatCurrency;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Debit</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Credit</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(entry.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  {entry.debit > 0 ? (
                    <ArrowUpRight size={14} className="text-red-500" />
                  ) : (
                    <ArrowDownLeft size={14} className="text-green-500" />
                  )}
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">
                    {entry.type}
                  </span>
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{entry.description}</td>
              <td className="px-4 py-3 text-right text-red-600 font-mono">
                {entry.debit > 0 ? fmt(entry.debit) : '—'}
              </td>
              <td className="px-4 py-3 text-right text-green-600 font-mono">
                {entry.credit > 0 ? fmt(entry.credit) : '—'}
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold">
                {fmt(entry.balance)}
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                No ledger entries found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
