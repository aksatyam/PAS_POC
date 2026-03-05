'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkflowStage = 'qde' | 'dde' | 'underwriting' | 'decision' | 'issuance';

interface WorkflowProgressProps {
  currentStage: WorkflowStage;
  className?: string;
}

const STAGES: { key: WorkflowStage; label: string }[] = [
  { key: 'qde', label: 'QDE' },
  { key: 'dde', label: 'DDE' },
  { key: 'underwriting', label: 'Underwriting' },
  { key: 'decision', label: 'Decision' },
  { key: 'issuance', label: 'Issuance' },
];

export default function WorkflowProgress({ currentStage, className }: WorkflowProgressProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className={cn('flex items-center w-full', className)}>
      {STAGES.map((stage, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;
        const isPending = i > currentIndex;

        return (
          <div key={stage.key} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                  isCompleted && 'bg-emerald-500 border-emerald-500 text-white',
                  isActive && 'bg-orange-500 border-orange-500 text-white',
                  isPending && 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500'
                )}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium mt-1.5 whitespace-nowrap',
                  isCompleted && 'text-emerald-600 dark:text-emerald-400',
                  isActive && 'text-orange-600 dark:text-orange-400 font-semibold',
                  isPending && 'text-neutral-400 dark:text-neutral-500'
                )}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STAGES.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-18px]',
                  i < currentIndex ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
