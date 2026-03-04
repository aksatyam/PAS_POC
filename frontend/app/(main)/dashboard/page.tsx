'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';
import KPICard from '@/components/ui/KPICard';
import { SkeletonKPICard, SkeletonChart } from '@/components/ui/Skeleton';
import {
  FileText, AlertTriangle, DollarSign, TrendingUp, CreditCard,
  ShieldCheck, Clock, Target, Percent, Activity, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Link from 'next/link';
import MyTasksWidget from '@/components/tasks/MyTasksWidget';

const CHART_COLORS = ['#1E3A5F', '#0D9488', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'];
const RISK_COLORS: Record<string, string> = { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' };
const DECISION_COLORS: Record<string, string> = { 'Auto-Approve': '#10B981', Refer: '#F59E0B', Decline: '#EF4444' };

/* ── KPI Gauge (Executive KPIs) ────────────────────────────────── */
function KPIGauge({ label, value, target, suffix = '%', good = 'low' }: {
  label: string; value: number; target: number; suffix?: string; good?: 'low' | 'high';
}) {
  const pct = Math.min((value / target) * 100, 100);
  const isGood = good === 'low' ? value <= target : value >= target;
  const color = isGood ? 'bg-success' : value <= target * 1.15 && good === 'low' ? 'bg-warning' : good === 'high' && value >= target * 0.85 ? 'bg-warning' : 'bg-error';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-small text-neutral-500 dark:text-neutral-400">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">Target: {target}{suffix}</span>
      </div>
      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-slow ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-h4 font-bold tabular-nums ${isGood ? 'text-success' : 'text-error'}`}>{value}{suffix}</p>
    </div>
  );
}

/* ── Chart Card Wrapper ───────────────────────────────────────── */
function ChartCard({ title, height = 280, children }: { title: string; height?: number; children: React.ReactElement }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden hover:shadow-card-hover transition-shadow duration-standard">
      <div className="px-5 py-3.5 border-b border-surface-border dark:border-neutral-700 flex items-center justify-between">
        <h3 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">{title}</h3>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Custom Recharts Tooltip ──────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-800 border border-surface-border dark:border-neutral-700 rounded-lg shadow-elevation-2 px-3 py-2 text-body-sm">
      <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-neutral-600 dark:text-neutral-400">
          {entry.name || 'Value'}: <span className="font-semibold text-neutral-900 dark:text-neutral-100">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [claimsSummary, setClaimsSummary] = useState<any>(null);
  const [uwSummary, setUwSummary] = useState<any>(null);
  const [billingSummary, setBillingSummary] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [recentUW, setRecentUW] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role || 'Viewer';

  useEffect(() => {
    async function loadData() {
      try {
        const promises: Promise<any>[] = [
          api.get('/dashboard/summary'),
          api.get('/dashboard/claims'),
          api.get('/dashboard/underwriting'),
          api.get('/billing/summary').catch(() => ({ success: false, data: null })),
          api.get('/underwriting').catch(() => ({ success: false, data: [] })),
        ];
        if (['Admin', 'Executive', 'Operations'].includes(role)) {
          promises.push(api.get('/dashboard/kpis').catch(() => ({ success: false, data: null })));
        }
        const results = await Promise.all(promises);
        if (results[0].success) setSummary(results[0].data);
        if (results[1].success) setClaimsSummary(results[1].data);
        if (results[2].success) setUwSummary(results[2].data);
        if (results[3].success) setBillingSummary(results[3].data);
        if (results[4]?.success) setRecentUW(Array.isArray(results[4].data) ? results[4].data.slice(0, 6) : []);
        if (results[5]?.success) setKpis(results[5].data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [role]);

  /* ── Derived chart data ──────────────────────────────────────── */
  const policyStatusData = summary?.policiesByStatus
    ? Object.entries(summary.policiesByStatus).map(([name, value]) => ({ name, value }))
    : [];
  const policyTypeData = summary?.policiesByType
    ? Object.entries(summary.policiesByType)
        .filter(([name]) => name && name !== 'undefined' && name !== 'null')
        .map(([name, value]) => ({ name, value }))
    : [];
  const riskData = uwSummary?.riskDistribution
    ? Object.entries(uwSummary.riskDistribution).map(([name, value]) => ({ name: String(name).charAt(0).toUpperCase() + String(name).slice(1), value }))
    : [];
  const claimsStatusData = claimsSummary?.claimsByStatus
    ? Object.entries(claimsSummary.claimsByStatus).map(([name, value]) => ({ name, value }))
    : [];
  const uwDecisionData = uwSummary?.decisionDistribution
    ? Object.entries(uwSummary.decisionDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const roleLabel: Record<string, string> = {
    Admin: 'Executive', Executive: 'Executive', Underwriter: 'Underwriting',
    Claims: 'Claims', Operations: 'Operations', Viewer: '',
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </p>
        </div>
        {roleLabel[role] && (
          <span className="text-small font-semibold bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400 px-3 py-1 rounded-full">
            {roleLabel[role]} View
          </span>
        )}
      </div>

      {/* ── Executive KPI Gauges (Admin/Executive/Operations) ────── */}
      {!loading && kpis && ['Admin', 'Executive', 'Operations'].includes(role) && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-surface-border dark:border-neutral-700 flex items-center gap-2">
            <Target size={16} className="text-accent-500" />
            <h3 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Executive KPIs</h3>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5">
            <KPIGauge label="Loss Ratio" value={kpis.lossRatio} target={65} good="low" />
            <KPIGauge label="Expense Ratio" value={kpis.expenseRatio} target={35} good="low" />
            <KPIGauge label="Combined Ratio" value={kpis.combinedRatio} target={100} good="low" />
            <KPIGauge label="Retention Rate" value={kpis.retentionRate} target={85} good="high" />
            <KPIGauge label="Collection Rate" value={kpis.collectionRate} target={90} good="high" />
            <KPIGauge label="Avg Cycle Time" value={kpis.avgClaimCycleTime} target={30} suffix=" days" good="low" />
            <KPIGauge label="Avg Severity" value={kpis.avgClaimSeverity} target={50000} suffix="" good="low" />
          </div>
        </div>
      )}

      {/* ── Role KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <><SkeletonKPICard /><SkeletonKPICard /><SkeletonKPICard /><SkeletonKPICard /></>
        ) : role === 'Underwriter' ? (
          <>
            <KPICard title="Total Evaluations" value={uwSummary?.totalEvaluations || 0} icon={ShieldCheck} variant="primary" animationDelay={0} />
            <KPICard title="Avg Risk Score" value={uwSummary?.averageRiskScore?.toFixed(1) || '0'} icon={Activity} variant="secondary" animationDelay={75} />
            <KPICard title="Auto-Approve Rate" value={`${((uwSummary?.decisionDistribution?.['Auto-Approve'] || 0) / Math.max(uwSummary?.totalEvaluations || 1, 1) * 100).toFixed(0)}%`} icon={Percent} variant="accent" animationDelay={150} />
            <KPICard title="Pending Reviews" value={uwSummary?.decisionDistribution?.['Refer'] || 0} icon={Clock} subtitle="referrals" animationDelay={225} />
          </>
        ) : role === 'Claims' ? (
          <>
            <KPICard title="Total Claims" value={claimsSummary?.totalClaims || 0} icon={AlertTriangle} variant="primary" animationDelay={0} />
            <KPICard title="Total Claimed" value={formatCurrency(claimsSummary?.totalClaimedAmount || 0)} icon={DollarSign} variant="accent" animationDelay={75} />
            <KPICard title="Total Settled" value={formatCurrency(claimsSummary?.totalSettledAmount || 0)} icon={TrendingUp} variant="secondary" animationDelay={150} />
            <KPICard title="Avg Cycle Time" value={`${kpis?.avgClaimCycleTime || '—'} days`} icon={Clock} animationDelay={225} />
          </>
        ) : (
          <>
            <KPICard title="Total Policies" value={summary?.totalPolicies || 0} icon={FileText} subtitle={`${summary?.activePolicies || 0} active`} variant="primary" animationDelay={0} />
            <KPICard title="Total Premium" value={formatCurrency(summary?.totalPremium || 0)} icon={DollarSign} variant="accent" animationDelay={75} />
            <KPICard title="Total Coverage" value={formatCurrency(summary?.totalCoverage || 0)} icon={TrendingUp} variant="secondary" animationDelay={150} />
            <KPICard title="Total Claims" value={claimsSummary?.totalClaims || 0} icon={AlertTriangle} subtitle={`${formatCurrency(claimsSummary?.totalClaimedAmount || 0)} total`} animationDelay={225} />
          </>
        )}
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkeletonChart /><SkeletonChart />
        </div>
      ) : role === 'Underwriter' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Risk Distribution">
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" outerRadius={95} dataKey="value" label>
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={RISK_COLORS[entry.name] || CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} /><Legend />
            </PieChart>
          </ChartCard>
          <ChartCard title="Underwriting Decisions">
            <PieChart>
              <Pie data={uwDecisionData} cx="50%" cy="50%" outerRadius={95} dataKey="value" label>
                {uwDecisionData.map((entry, i) => (
                  <Cell key={i} fill={DECISION_COLORS[entry.name] || CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} /><Legend />
            </PieChart>
          </ChartCard>
        </div>
      ) : role === 'Claims' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Claims by Status">
            <BarChart data={claimsStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
          <ChartCard title="Policy Type Distribution">
            <PieChart>
              <Pie data={policyTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {policyTypeData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ChartCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Policies by Status">
            <BarChart data={policyStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
          <ChartCard title="Policy Type Distribution">
            <PieChart>
              <Pie data={policyTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {policyTypeData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ChartCard>
        </div>
      )}

      {/* ── Charts Row 2 (Admin/Executive/Operations/Viewer) ───── */}
      {!loading && !['Underwriter', 'Claims'].includes(role) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="Risk Distribution" height={230}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label>
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={RISK_COLORS[entry.name] || CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} /><Legend />
            </PieChart>
          </ChartCard>
          <ChartCard title="Claims by Status" height={230}>
            <BarChart data={claimsStatusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartCard>
          <ChartCard title="Underwriting Decisions" height={230}>
            <PieChart>
              <Pie data={uwDecisionData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label>
                {uwDecisionData.map((entry, i) => (
                  <Cell key={i} fill={DECISION_COLORS[entry.name] || CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} /><Legend />
            </PieChart>
          </ChartCard>
        </div>
      )}

      {/* ── My Tasks + UW Review ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MyTasksWidget />
        {uwSummary && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden hover:shadow-card-hover transition-shadow duration-standard">
            <div className="px-5 py-3.5 border-b border-surface-border dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent-500" />
                <h3 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Underwriting Review</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  <span className="text-small text-neutral-500 dark:text-neutral-400">{uwSummary.decisionDistribution?.['Refer'] || 0} pending</span>
                </div>
                <Link href="/underwriting" className="text-small font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400 flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </Link>
              </div>
            </div>
            <div className="p-4 grid grid-cols-4 gap-3 border-b border-surface-border dark:border-neutral-700">
              <div className="text-center">
                <p className="text-data-md font-bold text-neutral-900 dark:text-neutral-100">{uwSummary.totalEvaluations}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Evaluations</p>
              </div>
              <div className="text-center">
                <p className="text-data-md font-bold text-neutral-900 dark:text-neutral-100">{uwSummary.averageRiskScore?.toFixed(1)}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Avg Risk</p>
              </div>
              <div className="text-center">
                <p className="text-data-md font-bold text-success">{uwSummary.decisionDistribution?.['Auto-Approve'] || 0}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-data-md font-bold text-error">{uwSummary.decisionDistribution?.['Reject'] || 0}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Rejected</p>
              </div>
            </div>
            <div className="divide-y divide-surface-border dark:divide-neutral-700 max-h-[280px] overflow-y-auto">
              {recentUW.length > 0 ? recentUW.map((uw) => (
                <Link key={uw.id} href={`/policies/${uw.policyId}`} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      uw.decision === 'Auto-Approve' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' :
                      uw.decision === 'Refer' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' :
                      'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                    }`}>
                      {uw.riskScore}
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{uw.policyId}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Score {uw.creditScore} · LTV {uw.ltvRatio}% · {uw.propertyZone}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    uw.decision === 'Auto-Approve' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    uw.decision === 'Refer' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {uw.decision}
                  </span>
                </Link>
              )) : (
                <div className="px-4 py-8 text-center text-small text-neutral-400">No recent evaluations</div>
              )}
            </div>
            {recentUW.length > 0 && (
              <div className="px-4 py-2.5 border-t border-surface-border dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
                <Link href="/underwriting" className="text-small font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400 flex items-center justify-center gap-1">
                  View all evaluations <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Billing Overview (Admin/Executive/Operations) ─────────── */}
      {billingSummary && ['Admin', 'Executive', 'Operations', 'Viewer'].includes(role) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden hover:shadow-card-hover transition-shadow duration-standard">
            <div className="px-5 py-3.5 border-b border-surface-border dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-accent-500" />
                <h3 className="text-body-sm font-semibold text-neutral-700 dark:text-neutral-200">Billing Overview</h3>
              </div>
              <Link href="/billing" className="text-small font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400 flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-5 grid grid-cols-2 gap-5">
              <div>
                <p className="text-small text-neutral-500 dark:text-neutral-400">Total Accounts</p>
                <p className="text-data-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1">{billingSummary.totalAccounts}</p>
              </div>
              <div>
                <p className="text-small text-neutral-500 dark:text-neutral-400">Active Accounts</p>
                <p className="text-data-lg font-bold text-success mt-1">{billingSummary.activeAccounts}</p>
              </div>
              <div>
                <p className="text-small text-neutral-500 dark:text-neutral-400">Total Outstanding</p>
                <p className="text-data-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1">{formatCurrency(billingSummary.totalOutstanding)}</p>
              </div>
              <div>
                <p className="text-small text-neutral-500 dark:text-neutral-400">Total Collected</p>
                <p className="text-data-lg font-bold text-success mt-1">{formatCurrency(billingSummary.totalCollected)}</p>
              </div>
            </div>
          </div>
          {billingSummary.overdueCount > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-elevation-1 border border-surface-border dark:border-neutral-700 overflow-hidden border-l-4 border-l-error">
              <div className="px-5 py-3.5 border-b border-surface-border dark:border-neutral-700">
                <h3 className="text-body-sm font-semibold text-error">Overdue Accounts</h3>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-error" />
                  </div>
                  <div>
                    <p className="text-data-lg font-bold text-error">{billingSummary.overdueCount}</p>
                    <p className="text-small text-neutral-500 dark:text-neutral-400">overdue account(s)</p>
                  </div>
                </div>
                <p className="text-body-sm text-neutral-600 dark:text-neutral-400">
                  Total overdue: <span className="font-semibold text-error">{formatCurrency(billingSummary.totalOverdue)}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
