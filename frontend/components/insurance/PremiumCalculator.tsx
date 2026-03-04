'use client';

import { useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';

const COLORS = ['#1E3A5F', '#0D9488', '#F59E0B', '#3B82F6'];

interface PremiumBreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface PremiumCalculatorProps {
  baseAmount: number;
  gstRate?: number;
  stampDutyRate?: number;
  commissionRate?: number;
  onChange?: (total: number) => void;
  className?: string;
  showComparison?: boolean;
  previousTotal?: number;
}

export default function PremiumCalculator({
  baseAmount,
  gstRate = 18,
  stampDutyRate = 0.5,
  commissionRate = 2.5,
  onChange,
  className,
  showComparison,
  previousTotal,
}: PremiumCalculatorProps) {
  const breakdown = useMemo(() => {
    const gst = baseAmount * (gstRate / 100);
    const stampDuty = baseAmount * (stampDutyRate / 100);
    const commission = baseAmount * (commissionRate / 100);
    const total = baseAmount + gst + stampDuty + commission;
    return { gst, stampDuty, commission, total };
  }, [baseAmount, gstRate, stampDutyRate, commissionRate]);

  useEffect(() => {
    onChange?.(breakdown.total);
  }, [breakdown.total, onChange]);

  const items: PremiumBreakdownItem[] = useMemo(() => [
    { label: 'Base Premium', value: baseAmount, color: COLORS[0] },
    { label: `GST (${gstRate}%)`, value: breakdown.gst, color: COLORS[1] },
    { label: `Stamp Duty (${stampDutyRate}%)`, value: breakdown.stampDuty, color: COLORS[2] },
    { label: `Commission (${commissionRate}%)`, value: breakdown.commission, color: COLORS[3] },
  ], [baseAmount, gstRate, stampDutyRate, commissionRate, breakdown]);

  const chartData = items
    .filter(item => item.value > 0)
    .map(item => ({ name: item.label, value: item.value }));

  const change = showComparison && previousTotal ? breakdown.total - previousTotal : null;

  function getChangeColorClass(delta: number): string {
    if (delta > 0) return 'text-error';
    if (delta < 0) return 'text-success';
    return 'text-neutral-500';
  }

  return (
    <div className={cn(
      'bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden',
      className
    )}>
      <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700">
        <h3 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Premium Breakdown
        </h3>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Pie chart */}
          <div className="w-[140px] h-[140px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="transparent"
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line-item breakdown */}
          <div className="flex-1 space-y-2">
            {items.map(item => (
              <div key={item.label} className="flex items-center justify-between text-small">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {item.label}
                  </span>
                </div>
                <span className="font-medium text-neutral-700 dark:text-neutral-200 tabular-nums">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}

            {/* Total */}
            <div className="pt-2 mt-2 border-t border-surface-border dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Total Premium
                </span>
                <span className="text-data-lg font-bold text-accent-600 dark:text-accent-400 tabular-nums">
                  {formatCurrency(breakdown.total)}
                </span>
              </div>

              {change !== null && (
                <div className="flex justify-end mt-1">
                  <span className={cn('text-small font-medium', getChangeColorClass(change))}>
                    {change > 0 ? '+' : ''}{formatCurrency(change)} from previous
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
