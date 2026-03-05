'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { SkeletonChart, SkeletonKPICard } from '@/components/ui/Skeleton';
import { FileText, AlertTriangle, Shield, CreditCard, TrendingUp, Download, Play, Calendar, Users, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#F59E0B', '#0D9488', '#1E3A5F', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];

type TabKey = 'policies' | 'claims' | 'underwriting' | 'billing' | 'executive';

const DATE_PRESETS: { label: string; from: string; to: string }[] = (() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    { label: 'This Month', from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}` },
    { label: 'Last Month', from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}` },
    { label: 'This Quarter', from: `${y}-${pad(Math.floor(m / 3) * 3 + 1)}-01`, to: `${y}-${pad(Math.floor(m / 3) * 3 + 3)}-${pad(new Date(y, Math.floor(m / 3) * 3 + 3, 0).getDate())}` },
    { label: 'YTD', from: `${y}-01-01`, to: now.toISOString().split('T')[0] },
    { label: 'All Time', from: '2020-01-01', to: '2030-12-31' },
  ];
})();

export default function ReportsPage() {
  const [policyReport, setPolicyReport] = useState<any>(null);
  const [claimsReport, setClaimsReport] = useState<any>(null);
  const [uwReport, setUwReport] = useState<any>(null);
  const [billingReport, setBillingReport] = useState<any>(null);
  const [execReport, setExecReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('policies');
  const [dateFrom, setDateFrom] = useState(DATE_PRESETS[4].from);
  const [dateTo, setDateTo] = useState(DATE_PRESETS[4].to);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pRes, cRes, uwRes, bRes, eRes] = await Promise.all([
          api.get('/reports/policies', { from: dateFrom, to: dateTo }),
          api.get('/reports/claims', { from: dateFrom, to: dateTo }),
          api.get('/reports/underwriting', { from: dateFrom, to: dateTo }),
          api.get('/reports/billing').catch(() => ({ success: false, data: null })),
          api.get('/reports/executive').catch(() => ({ success: false, data: null })),
        ]);
        if (pRes.success) setPolicyReport(pRes.data);
        if (cRes.success) setClaimsReport(cRes.data);
        if (uwRes.success) setUwReport(uwRes.data);
        if (bRes.success) setBillingReport(bRes.data);
        if (eRes.success) setExecReport(eRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [dateFrom, dateTo]);

  const handleExport = async (type: 'policies' | 'claims') => {
    setExporting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/reports/export/${type}?from=${dateFrom}&to=${dateTo}`, {
        headers: { Authorization: `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || ''}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error('Export failed:', err); }
    finally { setExporting(false); }
  };

  const applyPreset = (preset: typeof DATE_PRESETS[0]) => {
    setDateFrom(preset.from);
    setDateTo(preset.to);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'policies', label: 'Policies', icon: <FileText size={15} /> },
    { key: 'claims', label: 'Claims', icon: <AlertTriangle size={15} /> },
    { key: 'underwriting', label: 'Underwriting', icon: <Shield size={15} /> },
    { key: 'billing', label: 'Billing', icon: <CreditCard size={15} /> },
    { key: 'executive', label: 'Executive KPIs', icon: <TrendingUp size={15} /> },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-2">
        <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Reports</h1>
        <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Analytics, KPIs, and report generation</p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro w-40" />
        </div>
        <div>
          <label className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 text-body-sm bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors duration-micro w-40" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {DATE_PRESETS.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className={`px-2.5 py-1.5 text-xs rounded-md border transition ${
                dateFrom === p.from && dateTo === p.to
                  ? 'bg-accent-50 border-accent-300 text-accent-700 font-medium dark:bg-accent-950 dark:border-accent-600 dark:text-accent-300'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-border dark:border-neutral-700 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 ${tab === t.key ? 'px-4 py-2.5 text-body-sm font-medium text-accent-600 dark:text-accent-400 border-b-2 border-accent-500 -mb-px transition-colors duration-micro' : 'px-4 py-2.5 text-body-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 border-b-2 border-transparent hover:border-neutral-300 -mb-px transition-colors duration-micro'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Policy Report */}
      {tab === 'policies' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => handleExport('policies')} disabled={exporting}
              className="px-4 py-2 bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg font-medium text-body-sm transition-colors duration-micro text-sm flex items-center gap-1.5">
              <Download size={14} /> {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
          {loading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)}</div>
              <SkeletonChart />
            </>
          ) : policyReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Total Policies</p><p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{policyReport.total}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Active</p><p className="text-2xl font-bold text-success">{policyReport.active}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Total Premium</p><p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(policyReport.totalPremium)}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Total Coverage</p><p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(policyReport.totalCoverage)}</p></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {policyReport.byStatus && (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Policies by Status</div>
                    <div className="p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={Object.entries(policyReport.byStatus).map(([name, value]) => ({ name, value }))}>
                          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
                          <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                {policyReport.byType && (
                  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Policies by Type</div>
                    <div className="p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={Object.entries(policyReport.byType).map(([name, value]) => ({ name, value }))}
                            cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label>
                            {Object.keys(policyReport.byType).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip /><Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Claims Report */}
      {tab === 'claims' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => handleExport('claims')} disabled={exporting}
              className="px-4 py-2 bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg font-medium text-body-sm transition-colors duration-micro text-sm flex items-center gap-1.5">
              <Download size={14} /> {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
          {loading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonKPICard key={i} />)}</div>
              <SkeletonChart />
            </>
          ) : claimsReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Total Claims</p><p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{claimsReport.total}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Total Amount</p><p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(claimsReport.totalAmount)}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Total Settled</p><p className="text-2xl font-bold text-success">{formatCurrency(claimsReport.totalSettled)}</p></div>
              </div>
              {claimsReport.byStatus && (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Claims by Status</div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.entries(claimsReport.byStatus).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Underwriting Report */}
      {tab === 'underwriting' && (
        <div className="space-y-6">
          {loading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonKPICard key={i} />)}</div>
              <SkeletonChart />
            </>
          ) : uwReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Total Evaluations</p><p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{uwReport.total}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Avg Risk Score</p><p className="text-2xl font-bold text-warning">{uwReport.avgRiskScore}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Auto-Approve Rate</p><p className="text-2xl font-bold text-success">{uwReport.autoApproveRate}%</p></div>
              </div>
              {uwReport.byDecision && (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Decisions Distribution</div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={Object.entries(uwReport.byDecision).map(([name, value]) => ({ name, value }))}
                          cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                          {Object.keys(uwReport.byDecision).map((name, i) => (
                            <Cell key={i} fill={name === 'Auto-Approve' ? '#10B981' : name === 'Refer' ? '#F59E0B' : '#EF4444'} />
                          ))}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Billing Report */}
      {tab === 'billing' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)}</div>
          ) : billingReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Total Accounts</p><p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{billingReport.totalAccounts}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Outstanding</p><p className="text-2xl font-bold text-warning">{formatCurrency(billingReport.totalOutstanding)}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Overdue</p><p className="text-2xl font-bold text-error">{formatCurrency(billingReport.totalOverdue)}</p></div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center"><p className="text-sm text-neutral-500 dark:text-neutral-400">Collected</p><p className="text-2xl font-bold text-success">{formatCurrency(billingReport.totalCollected)}</p></div>
              </div>
              {billingReport.agingBuckets && (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-border dark:border-neutral-700 text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Aging Receivables</div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={billingReport.agingBuckets}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis /><Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                          {billingReport.agingBuckets.map((_: any, i: number) => (
                            <Cell key={i} fill={['#10B981', '#F59E0B', '#F59E0B', '#EF4444', '#EF4444'][i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Executive KPIs */}
      {tab === 'executive' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)}</div>
          ) : execReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPIGauge label="Loss Ratio" value={execReport.lossRatio} suffix="%" target={60} color={execReport.lossRatio > 70 ? 'red' : execReport.lossRatio > 50 ? 'amber' : 'green'} />
                <KPIGauge label="Combined Ratio" value={execReport.combinedRatio} suffix="%" target={100} color={execReport.combinedRatio > 100 ? 'red' : execReport.combinedRatio > 90 ? 'amber' : 'green'} />
                <KPIGauge label="Retention Rate" value={execReport.retentionRate} suffix="%" target={85} color={execReport.retentionRate > 80 ? 'green' : execReport.retentionRate > 60 ? 'amber' : 'red'} />
                <KPIGauge label="Collection Rate" value={execReport.collectionRate} suffix="%" target={95} color={execReport.collectionRate > 90 ? 'green' : execReport.collectionRate > 70 ? 'amber' : 'red'} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Expense Ratio</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{execReport.expenseRatio}%</p>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Avg Claim Cycle</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{execReport.avgClaimCycleTime} <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">days</span></p>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Avg Claim Severity</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(execReport.avgClaimSeverity)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Report Templates */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-body-sm font-semibold text-neutral-800 dark:text-neutral-200">Report Templates</h2>
          <span className="text-small text-neutral-400">Quick-run pre-configured reports</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Monthly Portfolio Summary', desc: 'Active policies, premium collected, claims ratio, and NPA status', icon: BarChart3, schedule: 'Monthly' },
            { name: 'Claims Aging Report', desc: 'Outstanding claims grouped by DPD buckets with NPA classification', icon: Calendar, schedule: 'Weekly' },
            { name: 'Underwriting Pipeline', desc: 'Pending evaluations, approval rates, and referral queue status', icon: Shield, schedule: 'Daily' },
            { name: 'Premium Collection Report', desc: 'Collection efficiency, overdue accounts, and payment method breakdown', icon: CreditCard, schedule: 'Monthly' },
            { name: 'Regulatory Compliance', desc: 'IRDAI-mandated metrics including solvency ratio and grievance resolution', icon: FileText, schedule: 'Quarterly' },
            { name: 'Lender-wise Performance', desc: 'Portfolio performance segmented by lender with delinquency trends', icon: Users, schedule: 'Monthly' },
          ].map((template) => (
            <div key={template.name} className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 hover:shadow-elevation-2 transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-50 dark:bg-accent-950/30 flex items-center justify-center shrink-0">
                  <template.icon size={18} className="text-accent-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100">{template.name}</h4>
                  <p className="text-small text-neutral-500 dark:text-neutral-400 mt-0.5">{template.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-neutral-400 uppercase font-medium">{template.schedule}</span>
                    <button className="flex items-center gap-1 px-2.5 py-1 text-small font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/30 hover:bg-accent-100 dark:hover:bg-accent-950/50 rounded-md transition-colors">
                      <Play size={12} /> Run
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPIGauge({ label, value, suffix, target, color }: {
  label: string; value: number; suffix: string; target: number; color: 'green' | 'amber' | 'red';
}) {
  const colorMap = { green: 'text-success', amber: 'text-warning', red: 'text-error' };
  const bgMap = { green: 'bg-emerald-100 dark:bg-emerald-950', amber: 'bg-amber-100 dark:bg-amber-950', red: 'bg-red-100 dark:bg-red-950' };
  const barMap = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' };
  const pct = Math.min(100, (value / target) * 100);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-elevation-1 border border-surface-border dark:border-neutral-700 p-4 text-center">
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}{suffix}</p>
      <div className={`mt-3 h-2 rounded-full ${bgMap[color]}`}>
        <div className={`h-full rounded-full ${barMap[color]} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Target: {target}{suffix}</p>
    </div>
  );
}
