'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AgingBucket {
  label: string;
  count: number;
  amount: number;
}

interface AgingReportProps {
  buckets: AgingBucket[];
}

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#991b1b'];

export default function AgingReport({ buckets }: AgingReportProps) {
  const fmt = formatCurrency;

  const data = buckets.map((b, i) => ({
    name: b.label,
    amount: b.amount,
    count: b.count,
    color: COLORS[i] || COLORS[COLORS.length - 1],
  }));

  return (
    <div>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [fmt(value), 'Amount']}
              labelStyle={{ fontWeight: 600 }}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              isAnimationActive={false}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {buckets.map((b, i) => (
          <div key={b.label} className="text-center p-3 rounded-lg bg-gray-50">
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[i] }} />
            <p className="text-xs text-gray-500">{b.label}</p>
            <p className="text-sm font-bold">{fmt(b.amount)}</p>
            <p className="text-xs text-gray-400">{b.count} invoice(s)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
