'use client';

import { PolicyStatus } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { ArrowRight, Check } from 'lucide-react';

const FLOW_STEPS: { status: PolicyStatus; label: string }[] = [
  { status: 'Draft', label: 'Draft' },
  { status: 'Quoted', label: 'Quoted' },
  { status: 'Bound', label: 'Bound' },
  { status: 'Issued', label: 'Issued' },
  { status: 'Active', label: 'Active' },
];

const STATUS_ORDER: Record<string, number> = {
  Draft: 0, Quoted: 1, Bound: 2, Issued: 3, Active: 4,
  Endorsed: 5, Reinstated: 4, Renewal_Pending: 5,
};

interface StatusFlowDiagramProps {
  currentStatus: PolicyStatus;
  allowedTransitions: string[];
  onTransition?: (status: string) => void;
  isLoading?: boolean;
}

export default function StatusFlowDiagram({ currentStatus, allowedTransitions, onTransition, isLoading }: StatusFlowDiagramProps) {
  const currentOrder = STATUS_ORDER[currentStatus] ?? -1;

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">Policy Lifecycle</h3>

      {/* Main flow */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {FLOW_STEPS.map((step, i) => {
          const stepOrder = STATUS_ORDER[step.status];
          const isCompleted = currentOrder > stepOrder;
          const isCurrent = currentStatus === step.status;
          const isFuture = currentOrder < stepOrder;

          return (
            <div key={step.status} className="flex items-center">
              <div className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[80px] transition-all ${
                isCurrent ? 'bg-imgc-orange/10 ring-2 ring-imgc-orange' :
                isCompleted ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                  isCurrent ? 'bg-imgc-orange text-white' :
                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'
                }`}>
                  {isCompleted ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${
                  isCurrent ? 'text-imgc-orange' :
                  isCompleted ? 'text-green-700' : 'text-gray-400'
                }`}>{step.label}</span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <ArrowRight size={16} className={`mx-1 shrink-0 ${isCompleted ? 'text-green-400' : 'text-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Available transitions */}
      {allowedTransitions.length > 0 && onTransition && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Available Actions:</p>
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((t) => {
              const isDanger = ['Cancelled', 'Lapsed'].includes(t);
              return (
                <button
                  key={t}
                  onClick={() => onTransition(t)}
                  disabled={isLoading}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    isDanger ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                    'bg-imgc-orange/10 text-imgc-orange hover:bg-imgc-orange/20'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
