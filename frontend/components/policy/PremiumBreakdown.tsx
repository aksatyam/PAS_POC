'use client';

import { PremiumCalculation } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PremiumBreakdownProps {
  calculation: PremiumCalculation;
  className?: string;
}

export default function PremiumBreakdown({ calculation, className = '' }: PremiumBreakdownProps) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-imgc-orange" />
        <h3 className="font-semibold text-gray-900">Premium Breakdown</h3>
      </div>

      <div className="space-y-3">
        {calculation.breakdown.map((item, i) => {
          const isPositive = item.impact > 0;
          const isNeutral = item.impact === 0;
          return (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {isNeutral ? (
                  <Minus size={14} className="text-gray-400" />
                ) : isPositive ? (
                  <TrendingUp size={14} className="text-red-500" />
                ) : (
                  <TrendingDown size={14} className="text-green-500" />
                )}
                <span className="text-gray-600">{item.factor}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">{item.value.toFixed(2)}x</span>
                <span className={`font-medium ${isNeutral ? 'text-gray-500' : isPositive ? 'text-red-600' : 'text-green-600'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(item.impact)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total Annual Premium</span>
          <span className="text-xl font-bold text-imgc-orange">{formatCurrency(calculation.totalPremium)}</span>
        </div>
      </div>
    </div>
  );
}
