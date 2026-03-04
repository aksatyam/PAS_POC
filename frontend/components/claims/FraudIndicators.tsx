'use client';

import { FraudAssessment } from '@/types';
import { ShieldAlert, ShieldCheck, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
  assessment: FraudAssessment;
}

const levelConfig = {
  Low: { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-200' },
  Medium: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  High: { icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  Critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200' },
};

export default function FraudIndicators({ assessment }: Props) {
  const config = levelConfig[assessment.level];
  const Icon = config.icon;
  const triggered = assessment.indicators.filter((i) => i.triggered);
  const clean = assessment.indicators.filter((i) => !i.triggered);

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className={`flex items-center gap-4 p-4 rounded-lg ${config.bg} ring-1 ${config.ring}`}>
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${config.bg} ring-2 ${config.ring}`}>
            <span className={`text-2xl font-bold ${config.color}`}>{assessment.score}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon size={18} className={config.color} />
            <span className="font-semibold text-gray-900">Fraud Risk: {assessment.level}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {triggered.length} of {assessment.indicators.length} indicators triggered
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Assessed {new Date(assessment.assessedAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={assessment.level} />
      </div>

      {/* Triggered indicators */}
      {triggered.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
            <AlertTriangle size={14} /> Triggered Indicators
          </h4>
          <div className="space-y-2">
            {triggered.map((ind) => (
              <div key={ind.rule} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{ind.rule.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-600">{ind.description}</p>
                </div>
                <span className="text-xs font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  +{ind.weight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clean indicators */}
      {clean.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
            <CheckCircle size={14} /> Clear Indicators
          </h4>
          <div className="space-y-1">
            {clean.map((ind) => (
              <div key={ind.rule} className="flex items-center gap-3 p-2 text-sm text-gray-600">
                <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                <span>{ind.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
