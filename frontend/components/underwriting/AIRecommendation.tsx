'use client';

import { cn } from '@/lib/utils';
import { Brain, CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Shield } from 'lucide-react';

interface AIRecommendationProps {
  decision: string;
  confidence: number;
  riskScore: number;
  factors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[];
  summary: string;
}

export default function AIRecommendation({ decision, confidence, riskScore, factors, summary }: AIRecommendationProps) {
  const decisionConfig = {
    'Approve': { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/40' },
    'Refer': { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/40' },
    'Reject': { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800/40' },
  }[decision] || { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };

  const DecisionIcon = decisionConfig.icon;

  return (
    <div className={cn('rounded-xl border p-5', decisionConfig.bg, decisionConfig.border)}>
      <div className="flex items-center gap-2 mb-4">
        <Brain size={18} className="text-accent-500" />
        <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200">AI Recommendation</h4>
        <span className="ml-auto text-[10px] font-medium text-neutral-400 uppercase">Powered by IMGC AI Engine</span>
      </div>

      {/* Decision & Confidence */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <DecisionIcon size={20} className={decisionConfig.color} />
          <span className={cn('text-data-lg font-bold', decisionConfig.color)}>{decision}</span>
        </div>
        <div className="flex-1" />
        <div className="text-right">
          <p className="text-[10px] text-neutral-400 uppercase">Confidence</p>
          <p className="text-body-sm font-bold text-neutral-900 dark:text-neutral-100">{confidence}%</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-400 uppercase">Risk Score</p>
          <p className={cn('text-body-sm font-bold', riskScore >= 60 ? 'text-red-500' : riskScore >= 40 ? 'text-amber-500' : 'text-emerald-500')}>{riskScore}/100</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 mb-4">
        <div className="h-1.5 rounded-full bg-accent-500 transition-all" style={{ width: `${confidence}%` }} />
      </div>

      {/* Summary */}
      <p className="text-small text-neutral-600 dark:text-neutral-400 mb-4">{summary}</p>

      {/* Key Factors */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-neutral-400 uppercase">Key Factors</p>
        {factors.map((factor, i) => (
          <div key={i} className="flex items-start gap-2 py-1.5">
            {factor.impact === 'positive' ? <TrendingUp size={14} className="text-emerald-500 mt-0.5 shrink-0" /> :
             factor.impact === 'negative' ? <TrendingDown size={14} className="text-red-500 mt-0.5 shrink-0" /> :
             <Shield size={14} className="text-neutral-400 mt-0.5 shrink-0" />}
            <div>
              <span className="text-small font-medium text-neutral-700 dark:text-neutral-300">{factor.label}</span>
              <span className="text-small text-neutral-500 dark:text-neutral-400 ml-1">— {factor.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
