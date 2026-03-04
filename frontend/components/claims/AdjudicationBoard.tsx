'use client';

import { Claim, AdjudicationStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useRouter } from 'next/navigation';
import { Search, FileCheck, MessageSquare, DollarSign } from 'lucide-react';

interface Props {
  claims: Claim[];
}

const COLUMNS: { status: AdjudicationStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'Investigation', label: 'Investigation', icon: <Search size={16} />, color: 'border-blue-300 bg-blue-50' },
  { status: 'Evaluation', label: 'Evaluation', icon: <FileCheck size={16} />, color: 'border-indigo-300 bg-indigo-50' },
  { status: 'Negotiation', label: 'Negotiation', icon: <MessageSquare size={16} />, color: 'border-amber-300 bg-amber-50' },
  { status: 'Settlement', label: 'Settlement', icon: <DollarSign size={16} />, color: 'border-green-300 bg-green-50' },
];

export default function AdjudicationBoard({ claims }: Props) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const colClaims = claims.filter((c) => c.adjudicationStatus === col.status);
        return (
          <div key={col.status} className={`rounded-lg border-t-2 ${col.color} p-3`}>
            <div className="flex items-center gap-2 mb-3">
              {col.icon}
              <h4 className="text-sm font-semibold">{col.label}</h4>
              <span className="ml-auto text-xs bg-white rounded-full px-2 py-0.5 font-medium border">
                {colClaims.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {colClaims.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No claims</p>
              ) : (
                colClaims.map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => router.push(`/claims/${claim.id}`)}
                    className="bg-white rounded-lg p-3 border border-gray-100 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-900">{claim.id}</span>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p className="text-xs text-gray-600 truncate">{claim.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium">{formatCurrency(claim.amount)}</span>
                      <span className="text-xs text-gray-400">{formatDate(claim.filedDate)}</span>
                    </div>
                    {claim.fraudScore !== undefined && claim.fraudScore > 25 && (
                      <div className="mt-1.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          claim.fraudScore >= 70 ? 'bg-red-100 text-red-700' :
                          claim.fraudScore >= 50 ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          Fraud: {claim.fraudScore}%
                        </span>
                      </div>
                    )}
                    {claim.reserveAmount !== undefined && claim.reserveAmount > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Reserve: {formatCurrency(claim.reserveAmount)}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
