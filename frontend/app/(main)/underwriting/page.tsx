'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UnderwritingRecord, RuleResult } from '@/types';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import Link from 'next/link';
import { Play, Shield, Settings, GitPullRequest, Eye, X } from 'lucide-react';

const riskColor = (score: number) =>
  score >= 60 ? 'text-error-600 dark:text-error-400' : score >= 40 ? 'text-warning-600 dark:text-warning-400' : 'text-success-600 dark:text-success-400';
const riskBg = (score: number) =>
  score >= 60 ? 'bg-error-500' : score >= 40 ? 'bg-warning-500' : 'bg-success-500';
const barColor = (ratio: number) =>
  ratio > 0.6 ? 'bg-error-400' : ratio > 0.3 ? 'bg-warning-400' : 'bg-success-400';

function RiskScorecard({ record }: { record: UnderwritingRecord }) {
  const categories = [
    { label: 'Credit', score: record.creditScore >= 750 ? 15 : record.creditScore >= 700 ? 25 : record.creditScore >= 650 ? 40 : 60, max: 60 },
    { label: 'LTV', score: record.ltvRatio > 80 ? 50 : record.ltvRatio > 70 ? 35 : record.ltvRatio > 60 ? 20 : 10, max: 50 },
    { label: 'Age', score: (record.applicantAge < 21 || record.applicantAge > 65) ? 30 : 10, max: 30 },
    { label: 'Income', score: record.income < 3 * record.annualPremium ? 40 : record.income < 5 * record.annualPremium ? 20 : 5, max: 40 },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className={`text-4xl font-bold ${riskColor(record.riskScore)}`}>{record.riskScore}</div>
        <div className="text-small text-neutral-500 dark:text-neutral-400">Overall Risk Score</div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
          <div className={`h-2 rounded-full ${riskBg(record.riskScore)}`} style={{ width: `${record.riskScore}%` }} />
        </div>
      </div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-3">
            <span className="text-small text-neutral-600 dark:text-neutral-400 w-16">{cat.label}</span>
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-700 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${barColor(cat.score / cat.max)}`}
                style={{ width: `${(cat.score / cat.max) * 100}%` }} />
            </div>
            <span className="text-small text-neutral-500 dark:text-neutral-400 w-10 text-right">{cat.score}/{cat.max}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RuleResultsPanel({ results }: { results: RuleResult[] }) {
  return (
    <div className="space-y-2">
      {results.map((r) => (
        <div key={r.ruleId} className="flex items-start gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/80">
          <StatusBadge status={r.decision} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-small text-accent-600 dark:text-accent-400">{r.ruleId}</span>
              <span className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{r.ruleName}</span>
            </div>
            <p className="text-small text-neutral-500 dark:text-neutral-400">{r.detail}</p>
            <span className="text-small text-neutral-400 dark:text-neutral-500">{r.category}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UnderwritingPage() {
  const [records, setRecords] = useState<UnderwritingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEvaluate, setShowEvaluate] = useState(false);
  const [showDetail, setShowDetail] = useState<UnderwritingRecord | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/underwriting', { page: 1, limit: 100 });
        if (res.success) setRecords(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const [form, setForm] = useState({ policyId: '', applicantAge: '', creditScore: '', income: '', propertyValue: '', loanAmount: '', propertyZone: 'Residential', annualPremium: '' });

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      const res = await api.post('/underwriting/evaluate', {
        policyId: form.policyId,
        applicantAge: Number(form.applicantAge),
        creditScore: Number(form.creditScore),
        income: Number(form.income),
        propertyValue: Number(form.propertyValue),
        loanAmount: Number(form.loanAmount),
        propertyZone: form.propertyZone,
        annualPremium: Number(form.annualPremium),
      });
      if (res.success) {
        setShowEvaluate(false);
        setRecords([res.data, ...records]);
        addToast({ type: 'success', title: 'Evaluation Complete', message: `Decision: ${res.data.decision} (Risk Score: ${res.data.riskScore})` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Evaluation Failed', message: err.message });
    } finally {
      setEvaluating(false);
    }
  };

  const columns: Column<UnderwritingRecord>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'policyId', label: 'Policy' },
    { key: 'creditScore', label: 'Credit', sortable: true },
    { key: 'ltvRatio', label: 'LTV %', sortable: true, render: (row) => `${row.ltvRatio}%` },
    { key: 'riskScore', label: 'Risk', sortable: true, render: (row) => (
      <span className={`font-medium ${riskColor(row.riskScore)}`}>
        {row.riskScore}
      </span>
    )},
    { key: 'decision', label: 'Decision', render: (row) => <StatusBadge status={row.decision} /> },
    { key: 'rulesApplied', label: 'Rules', render: (row) => <span className="text-small">{row.rulesApplied?.join(', ')}</span> },
    { key: 'overridden' as any, label: '', render: (row) => (
      <button onClick={() => setShowDetail(row)} className="text-accent-600 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300"><Eye size={16} /></button>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Underwriting</h1>
        <div className="flex items-center gap-3">
          {hasRole('Admin') && (
            <Link href="/underwriting/rules" className="btn-secondary flex items-center gap-2 text-sm">
              <Settings size={16} /> Rule Config
            </Link>
          )}
          {hasRole('Admin', 'Underwriter') && (
            <Link href="/underwriting/referrals" className="btn-secondary flex items-center gap-2 text-sm">
              <GitPullRequest size={16} /> Referrals
            </Link>
          )}
          {hasRole('Admin', 'Underwriter') && (
            <button onClick={() => setShowEvaluate(true)} className="btn-primary flex items-center gap-2">
              <Play size={18} /> Evaluate
            </button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={records} loading={loading} searchable emptyIcon={Shield} emptyMessage="No evaluations found" />

      {/* Evaluate Modal */}
      <Modal isOpen={showEvaluate} onClose={() => setShowEvaluate(false)} title="Evaluate Application" size="lg">
        <form onSubmit={handleEvaluate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Policy ID</label><input className="input-field" value={form.policyId} onChange={(e) => setForm({...form, policyId: e.target.value})} required /></div>
            <div><label className="form-label">Applicant Age</label><input type="number" className="input-field" value={form.applicantAge} onChange={(e) => setForm({...form, applicantAge: e.target.value})} required /></div>
            <div><label className="form-label">Credit Score</label><input type="number" className="input-field" value={form.creditScore} onChange={(e) => setForm({...form, creditScore: e.target.value})} required /></div>
            <div><label className="form-label">Annual Income (INR)</label><input type="number" className="input-field" value={form.income} onChange={(e) => setForm({...form, income: e.target.value})} required /></div>
            <div><label className="form-label">Property Value (INR)</label><input type="number" className="input-field" value={form.propertyValue} onChange={(e) => setForm({...form, propertyValue: e.target.value})} required /></div>
            <div><label className="form-label">Loan Amount (INR)</label><input type="number" className="input-field" value={form.loanAmount} onChange={(e) => setForm({...form, loanAmount: e.target.value})} required /></div>
            <div><label className="form-label">Property Zone</label><input className="input-field" value={form.propertyZone} onChange={(e) => setForm({...form, propertyZone: e.target.value})} /></div>
            <div><label className="form-label">Annual Premium (INR)</label><input type="number" className="input-field" value={form.annualPremium} onChange={(e) => setForm({...form, annualPremium: e.target.value})} required /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowEvaluate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={evaluating} className="btn-primary">{evaluating ? 'Evaluating...' : 'Run Evaluation'}</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Evaluation Detail" size="lg">
        {showDetail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusBadge status={showDetail.decision} />
                  {showDetail.overridden && <span className="text-small bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400 px-2 py-0.5 rounded-full">Overridden</span>}
                  {showDetail.referralId && <span className="text-small bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400 px-2 py-0.5 rounded-full">Referred</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 text-body-sm">
                  <div><span className="text-neutral-500 dark:text-neutral-400">ID:</span> <span className="font-mono text-neutral-900 dark:text-neutral-100">{showDetail.id}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Policy:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.policyId}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Credit Score:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.creditScore}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">LTV Ratio:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.ltvRatio}%</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Age:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.applicantAge}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Income:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.income?.toLocaleString()}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Property:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.propertyValue?.toLocaleString()}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Zone:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.propertyZone}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Premium:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.annualPremium?.toLocaleString()}</span></div>
                  <div><span className="text-neutral-500 dark:text-neutral-400">Evaluated:</span> <span className="text-neutral-900 dark:text-neutral-100">{showDetail.evaluatedAt ? new Date(showDetail.evaluatedAt).toLocaleDateString() : '-'}</span></div>
                </div>
                {showDetail.overridden && showDetail.overrideReason && (
                  <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800/40">
                    <p className="text-small font-medium text-warning-700 dark:text-warning-400">Override Reason</p>
                    <p className="text-body-sm text-warning-800 dark:text-warning-300">{showDetail.overrideReason}</p>
                    <p className="text-small text-warning-500 dark:text-warning-500 mt-1">By: {showDetail.overrideBy}</p>
                  </div>
                )}
                {showDetail.notes && (
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 rounded-lg">
                    <p className="text-small text-neutral-500 dark:text-neutral-400">Notes</p>
                    <p className="text-body-sm text-neutral-900 dark:text-neutral-100">{showDetail.notes}</p>
                  </div>
                )}
              </div>

              {/* Right: Risk Scorecard */}
              <div>
                <h3 className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Risk Scorecard</h3>
                <RiskScorecard record={showDetail} />
              </div>
            </div>

            {/* Rule Results */}
            {showDetail.ruleResults && showDetail.ruleResults.length > 0 && (
              <div>
                <h3 className="text-body-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Rule Evaluation Results</h3>
                <RuleResultsPanel results={showDetail.ruleResults} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
