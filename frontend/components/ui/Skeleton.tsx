'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return <div className={cn('skeleton', width, height, className)} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('skeleton h-4', i === lines - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonKPICard() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
      <div className="skeleton h-1 rounded-none" />
      <div className="p-4 flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-7 w-24" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="skeleton h-11 w-11 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-700/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={cn('skeleton h-4', i === 0 ? 'w-20' : i === cols - 1 ? 'w-16' : 'w-28')} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-surface-border dark:border-neutral-700">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="skeleton h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonTableRow key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700">
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="p-4 flex items-end justify-around h-[300px]">
        {[60, 80, 45, 90, 55, 70].map((h, i) => (
          <div key={i} className="skeleton rounded-t" style={{ width: 40, height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
