'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import WorkflowProgress from '@/components/ui/WorkflowProgress';
import AIRecommendation from '@/components/underwriting/AIRecommendation';
import Timeline from '@/components/ui/Timeline';
import {
  ArrowLeft, MessageSquare, Flag, CheckCircle, XCircle,
  AlertTriangle, Send, User, Clock, FileText, Shield,
} from 'lucide-react';
import Link from 'next/link';

function InfoField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-[10px] text-neutral-400 uppercase block">{label}</span>
      <span className={cn('text-body-sm font-medium', highlight ? 'text-accent-500' : 'text-neutral-900 dark:text-neutral-100')}>{value}</span>
    </div>
  );
}

export default function UWDetailClient() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [showFlag, setShowFlag] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get(`/underwriting/${id}`);
        if (res.success) setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-xl w-1/3" />
        <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />)}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <Shield size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
        <p className="text-body-sm text-neutral-500">Case not found</p>
        <Link href="/underwriting" className="text-accent-500 hover:underline text-body-sm mt-2 inline-block">Back to Underwriting</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/underwriting" className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={18} className="text-neutral-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Underwriting Case: {id}</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Review application details, AI recommendation, and take action</p>
        </div>
        <StatusBadge status={data.decision} />
      </div>

      {/* Workflow Progress */}
      <WorkflowProgress currentStage="underwriting" />

      {/* Application Summary Bar */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
        <InfoField label="Policy ID" value={data.policyId} highlight />
        <InfoField label="Applicant" value={data.applicantName || 'Rajesh Kumar'} />
        <InfoField label="Age" value={`${data.applicantAge} years`} />
        <InfoField label="Credit Score" value={String(data.creditScore)} />
        <InfoField label="Income" value={formatCurrency(data.income)} />
        <InfoField label="LTV" value={`${data.ltvRatio}%`} />
        <InfoField label="Risk Score" value={String(data.riskScore)} />
        <InfoField label="Premium" value={formatCurrency(data.annualPremium)} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* AI Recommendation */}
          <AIRecommendation
            decision={data.aiRecommendation?.decision || data.decision}
            confidence={data.aiRecommendation?.confidence || 87}
            riskScore={data.riskScore}
            factors={data.aiRecommendation?.factors || [
              { label: 'Credit Score', impact: data.creditScore >= 700 ? 'positive' as const : 'negative' as const, detail: `Score of ${data.creditScore} is ${data.creditScore >= 700 ? 'above' : 'below'} the threshold of 700` },
              { label: 'LTV Ratio', impact: data.ltvRatio <= 75 ? 'positive' as const : 'negative' as const, detail: `LTV of ${data.ltvRatio}% is ${data.ltvRatio <= 75 ? 'within' : 'exceeding'} acceptable range` },
              { label: 'Income Adequacy', impact: 'positive' as const, detail: `Annual income of ${formatCurrency(data.income)} supports premium obligations` },
              { label: 'Property Zone', impact: 'neutral' as const, detail: `${data.propertyZone} classification - standard risk profile` },
            ]}
            summary={data.aiRecommendation?.summary || `Based on comprehensive analysis of ${data.rulesApplied?.length || 3} underwriting rules, the application shows a ${data.riskScore < 40 ? 'low' : data.riskScore < 60 ? 'moderate' : 'high'} risk profile. Key drivers include credit history, debt-to-income ratio, and property valuation assessment.`}
          />

          {/* Property & Financial Details */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-5">
            <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Financial Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><span className="text-[10px] text-neutral-400 uppercase block">Property Value</span><span className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(data.propertyValue)}</span></div>
              <div><span className="text-[10px] text-neutral-400 uppercase block">Loan Amount</span><span className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(data.loanAmount || data.propertyValue * data.ltvRatio / 100)}</span></div>
              <div><span className="text-[10px] text-neutral-400 uppercase block">Property Zone</span><span className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{data.propertyZone}</span></div>
              <div><span className="text-[10px] text-neutral-400 uppercase block">Annual Premium</span><span className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(data.annualPremium)}</span></div>
              <div><span className="text-[10px] text-neutral-400 uppercase block">Rules Applied</span><span className="text-body-sm font-mono text-neutral-700 dark:text-neutral-300">{data.rulesApplied?.join(', ')}</span></div>
              <div><span className="text-[10px] text-neutral-400 uppercase block">Evaluated</span><span className="text-body-sm text-neutral-700 dark:text-neutral-300">{formatDate(data.evaluatedAt)}</span></div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border dark:border-neutral-700 flex items-center gap-2">
              <MessageSquare size={14} className="text-accent-500" />
              <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Comments</h4>
            </div>
            <div className="p-5 space-y-4">
              {(data.comments || [
                { user: 'Priya Sharma', role: 'Underwriter', text: 'Credit score is strong but LTV is borderline. Need property valuation confirmation.', time: '2 hrs ago' },
                { user: 'Rahul Verma', role: 'Senior UW', text: 'Property valuation report received. Looks acceptable. Recommend approval with standard terms.', time: '1 hr ago' },
              ]).map((c: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center shrink-0">
                    <User size={14} className="text-accent-600 dark:text-accent-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{c.user}</span>
                      <span className="text-[10px] text-neutral-400">{c.role}</span>
                      <span className="text-[10px] text-neutral-400 ml-auto">{c.time}</span>
                    </div>
                    <p className="text-small text-neutral-600 dark:text-neutral-400 mt-1">{c.text}</p>
                  </div>
                </div>
              ))}
              {/* Add Comment */}
              <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-body-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                />
                <button className="px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] space-y-4 flex-shrink-0">
          {/* Actions */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 space-y-3">
            <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Actions</h4>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-body-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">
              <CheckCircle size={16} /> Approve
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-body-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
              <XCircle size={16} /> Reject
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-body-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
              <AlertTriangle size={16} /> Refer to Senior
            </button>
            <button onClick={() => setShowFlag(!showFlag)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-body-sm font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
              <Flag size={16} /> Flag Case
            </button>
            {showFlag && (
              <div className="space-y-2">
                <textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} rows={2}
                  placeholder="Reason for flagging..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-body-sm resize-none outline-none focus:ring-2 focus:ring-orange-500/30" />
                <button className="w-full py-1.5 text-small font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Submit Flag</button>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 flex items-center gap-2">
              <FileText size={14} className="text-accent-500" />
              <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Internal Notes</h4>
            </div>
            <div className="p-4">
              <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-body-sm resize-none outline-none focus:ring-2 focus:ring-orange-500/30"
                placeholder="Add internal notes (visible to UW team only)..." />
              <button className="mt-2 w-full py-1.5 text-small font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors">Save Note</button>
            </div>
          </div>

          {/* Case Timeline */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 flex items-center gap-2">
              <Clock size={14} className="text-accent-500" />
              <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Case Timeline</h4>
            </div>
            <div className="p-4">
              <Timeline events={data.timeline || [
                { id: 'tl-1', title: 'Case Created', description: 'Application submitted via QDE', timestamp: '2026-03-01T09:00:00Z', status: 'success' as const },
                { id: 'tl-2', title: 'DDE Completed', description: 'Data entry verified by Priya Sharma', timestamp: '2026-03-02T14:30:00Z', status: 'success' as const },
                { id: 'tl-3', title: 'UW Assigned', description: 'Auto-assigned to Rahul Verma', timestamp: '2026-03-03T10:00:00Z', status: 'success' as const },
                { id: 'tl-4', title: 'AI Analysis', description: 'Risk engine evaluated — score: ' + data.riskScore, timestamp: '2026-03-04T11:15:00Z', status: 'info' as const },
                { id: 'tl-5', title: 'Pending Decision', description: 'Awaiting underwriter review', timestamp: '2026-03-05T08:00:00Z', status: 'warning' as const },
              ]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
