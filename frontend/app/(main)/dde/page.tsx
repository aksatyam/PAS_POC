'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import Tabs from '@/components/ui/Tabs';
import StatusBadge from '@/components/ui/StatusBadge';
import WorkflowProgress from '@/components/ui/WorkflowProgress';
import { Save, Send, FileText, Calculator, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

function MetricCard({ label, value, status }: { label: string; value: string; status: 'pass' | 'warn' | 'fail' }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-small text-neutral-500 dark:text-neutral-400">{label}</span>
        {status === 'pass' ? <CheckCircle size={14} className="text-emerald-500" /> :
         status === 'warn' ? <AlertCircle size={14} className="text-amber-500" /> :
         <AlertCircle size={14} className="text-red-500" />}
      </div>
      <p className={cn('text-data-lg font-bold', status === 'pass' ? 'text-emerald-600 dark:text-emerald-400' : status === 'warn' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400')}>{value}</p>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 pb-2">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-small font-medium text-neutral-500 dark:text-neutral-400 mb-1">{label}</label>
      <div className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-body-sm text-neutral-900 dark:text-neutral-100">{value || '—'}</div>
    </div>
  );
}

export default function DDEPage() {
  const [loan, setLoan] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [loanRes, docsRes, eligRes] = await Promise.all([
          api.get('/dde/current'),
          api.get('/dde/documents'),
          api.get('/dde/eligibility'),
        ]);
        if (loanRes.success) setLoan(loanRes.data);
        if (docsRes.success) setDocuments(docsRes.data || []);
        if (eligRes.success) setEligibility(eligRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
        <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />)}</div>
      </div>
    );
  }

  const dataTabs = [
    {
      value: 'loan-chars',
      label: 'Loan Chars',
      content: (
        <FormSection title="Loan Characteristics">
          <ReadOnlyField label="Loan Amount" value={formatCurrency(loan?.loanAmount || 0)} />
          <ReadOnlyField label="Tenure" value={`${loan?.tenure || 0} months`} />
          <ReadOnlyField label="Interest Rate" value={`${loan?.interestRate || 0}%`} />
          <ReadOnlyField label="Product Type" value={loan?.productType || ''} />
          <ReadOnlyField label="Loan Purpose" value={loan?.purpose || ''} />
          <ReadOnlyField label="Disbursement Date" value={loan?.disbursementDate ? formatDate(loan.disbursementDate) : '—'} />
        </FormSection>
      ),
    },
    {
      value: 'general',
      label: 'General Data',
      content: (
        <FormSection title="General Information">
          <ReadOnlyField label="Borrower Name" value={loan?.borrowerName || ''} />
          <ReadOnlyField label="PAN" value={loan?.pan || ''} />
          <ReadOnlyField label="Mobile" value={loan?.mobile || ''} />
          <ReadOnlyField label="Property Type" value={loan?.propertyType || ''} />
          <ReadOnlyField label="Property Value" value={formatCurrency(loan?.propertyValue || 0)} />
          <ReadOnlyField label="Property Location" value={loan?.propertyLocation || ''} />
        </FormSection>
      ),
    },
    {
      value: 'employment',
      label: 'Employment',
      content: (
        <FormSection title="Employment Details">
          <ReadOnlyField label="Employment Type" value={loan?.employmentType || ''} />
          <ReadOnlyField label="Employer Name" value={loan?.employer || ''} />
          <ReadOnlyField label="Designation" value={loan?.designation || ''} />
          <ReadOnlyField label="Experience" value={`${loan?.experience || 0} years`} />
          <ReadOnlyField label="Monthly Salary" value={formatCurrency(loan?.salary || 0)} />
        </FormSection>
      ),
    },
    {
      value: 'income',
      label: 'Income Details',
      content: (
        <FormSection title="Income Details">
          <ReadOnlyField label="Gross Monthly Income" value={formatCurrency(loan?.grossIncome || 0)} />
          <ReadOnlyField label="Net Monthly Income" value={formatCurrency(loan?.netIncome || 0)} />
          <ReadOnlyField label="Other Income" value={formatCurrency(loan?.otherIncome || 0)} />
          <ReadOnlyField label="Total Annual Income" value={formatCurrency((loan?.grossIncome || 0) * 12)} />
        </FormSection>
      ),
    },
    {
      value: 'banking',
      label: 'Banking',
      content: (
        <FormSection title="Banking Details">
          <ReadOnlyField label="Primary Bank" value={loan?.primaryBank || ''} />
          <ReadOnlyField label="Account Type" value={loan?.accountType || ''} />
          <ReadOnlyField label="Avg Monthly Balance" value={formatCurrency(loan?.avgBalance || 0)} />
          <ReadOnlyField label="Bank Statement Period" value={loan?.statementPeriod || ''} />
        </FormSection>
      ),
    },
    {
      value: 'obligations',
      label: 'Obligations',
      content: (
        <FormSection title="Existing Obligations">
          <ReadOnlyField label="Existing EMI" value={formatCurrency(loan?.existingEmi || 0)} />
          <ReadOnlyField label="Total Liabilities" value={formatCurrency(loan?.totalLiabilities || 0)} />
          <ReadOnlyField label="Number of Loans" value={String(loan?.existingLoans || 0)} />
          <ReadOnlyField label="Credit Card Outstanding" value={formatCurrency(loan?.creditCardOutstanding || 0)} />
        </FormSection>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Detailed Data Entry (DDE)</h1>
        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Review and verify loan application details</p>
      </div>

      {/* Loan Header Bar */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
        <div><span className="text-[10px] text-neutral-400 uppercase">Loan ID</span><p className="text-body-sm font-semibold text-accent-500">{loan?.loanId || 'LN-2026-0891'}</p></div>
        <div><span className="text-[10px] text-neutral-400 uppercase">Lender</span><p className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{loan?.lender || 'HDFC Bank'}</p></div>
        <div><span className="text-[10px] text-neutral-400 uppercase">Deal ID</span><p className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{loan?.dealId || 'DL-4521'}</p></div>
        <div><span className="text-[10px] text-neutral-400 uppercase">Employment</span><p className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{loan?.employmentType || 'Salaried'}</p></div>
        <div><span className="text-[10px] text-neutral-400 uppercase">Principal</span><p className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(loan?.loanAmount || 4500000)}</p></div>
        <div className="ml-auto"><StatusBadge status="In Review" /></div>
      </div>

      {/* Workflow Progress */}
      <WorkflowProgress currentStage="dde" />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="LTV Ratio" value={`${loan?.ltv || 72}%`} status={loan?.ltv > 80 ? 'fail' : loan?.ltv > 75 ? 'warn' : 'pass'} />
        <MetricCard label="FOIR" value={`${loan?.foir || 42}%`} status={loan?.foir > 50 ? 'fail' : loan?.foir > 45 ? 'warn' : 'pass'} />
        <MetricCard label="CIBIL Score" value={String(loan?.cibilScore || 742)} status={loan?.cibilScore < 650 ? 'fail' : loan?.cibilScore < 700 ? 'warn' : 'pass'} />
        <MetricCard label="EMI/NMI" value={`${loan?.emiNmi || 38}%`} status={loan?.emiNmi > 50 ? 'fail' : loan?.emiNmi > 45 ? 'warn' : 'pass'} />
      </div>

      {/* Main Content: Tabs + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Data Tabs */}
        <div className="flex-1 min-w-0">
          <Tabs tabs={dataTabs} />
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] space-y-4 flex-shrink-0">
          {/* Documents Checklist */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 flex items-center gap-2">
              <FileText size={14} className="text-accent-500" />
              <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Documents</h4>
            </div>
            <div className="divide-y divide-surface-border dark:divide-neutral-700">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-small text-neutral-700 dark:text-neutral-300">{doc.name}</span>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          {eligibility && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 flex items-center gap-2">
                <Calculator size={14} className="text-accent-500" />
                <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Eligibility</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-small text-neutral-500">Max Eligible</span>
                  <span className="text-body-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(eligibility.maxEligible)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small text-neutral-500">Applied Amount</span>
                  <span className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(eligibility.applied)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-700 pt-2">
                  <span className="text-small text-neutral-500">Buffer</span>
                  <span className="text-body-sm font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(eligibility.buffer)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 flex items-center gap-2">
              <MessageSquare size={14} className="text-accent-500" />
              <h4 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Remarks / Case Notes</h4>
            </div>
            <div className="p-4">
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-body-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none resize-none"
                placeholder="Add remarks or case notes..." />
              <button className="mt-2 w-full py-1.5 text-small font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors">
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-surface-border dark:border-neutral-700 px-6 py-3 -mx-6 -mb-6 flex items-center justify-between shadow-elevation-2">
        <p className="text-small text-neutral-400">Last modified by <span className="font-medium text-neutral-600 dark:text-neutral-300">Priya Sharma</span> on {formatDate(new Date().toISOString())}</p>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
            <Save size={14} /> Save
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
            <Send size={14} /> Submit to Underwriting
          </button>
        </div>
      </div>
    </div>
  );
}
