import { policyRepository } from '../repositories/policy.repository';
import { claimRepository } from '../repositories/claim.repository';
import { underwritingRepository } from '../repositories/underwriting.repository';
import { billingService } from './billing.service';

export class KPIEngine {
  /** Loss Ratio = Total Incurred Losses / Total Earned Premium */
  getLossRatio(): number {
    const totalPremium = policyRepository.getTotalPremium();
    const totalClaimed = claimRepository.getTotalClaimedAmount();
    if (totalPremium === 0) return 0;
    return Math.round((totalClaimed / totalPremium) * 10000) / 100;
  }

  /** Expense Ratio (mock) — typically 25-35% */
  getExpenseRatio(): number {
    return 28.5;
  }

  /** Combined Ratio = Loss Ratio + Expense Ratio (< 100 = profitable) */
  getCombinedRatio(): number {
    return Math.round((this.getLossRatio() + this.getExpenseRatio()) * 100) / 100;
  }

  /** Retention Rate = (Active + Issued + Endorsed + Reinstated) / Total */
  getRetentionRate(): number {
    const byStatus = policyRepository.getCountByStatus();
    const total = policyRepository.count();
    if (total === 0) return 0;
    const retained = (byStatus['Active'] || 0) + (byStatus['Issued'] || 0) +
      (byStatus['Endorsed'] || 0) + (byStatus['Reinstated'] || 0);
    return Math.round((retained / total) * 10000) / 100;
  }

  /** Average Claim Cycle Time (days) — mock based on settled claims */
  getAvgClaimCycleTime(): number {
    const claims = claimRepository.findAll();
    const settled = claims.filter((c) => c.status === 'Settled' && c.settlementDate);
    if (settled.length === 0) return 0;
    let totalDays = 0;
    for (const c of settled) {
      const filed = new Date(c.filedDate).getTime();
      const settledAt = new Date(c.settlementDate!).getTime();
      totalDays += Math.max(1, Math.round((settledAt - filed) / (1000 * 60 * 60 * 24)));
    }
    return Math.round(totalDays / settled.length);
  }

  /** Severity = Avg claim amount */
  getAvgClaimSeverity(): number {
    const claims = claimRepository.findAll();
    if (claims.length === 0) return 0;
    const total = claims.reduce((s, c) => s + c.amount, 0);
    return Math.round(total / claims.length);
  }

  /** Collection Rate = Collected / (Collected + Outstanding) */
  getCollectionRate(): number {
    const summary = billingService.getSummary();
    const total = summary.totalCollected + summary.totalOutstanding;
    if (total === 0) return 0;
    return Math.round((summary.totalCollected / total) * 10000) / 100;
  }

  getExecutiveKPIs() {
    return {
      lossRatio: this.getLossRatio(),
      expenseRatio: this.getExpenseRatio(),
      combinedRatio: this.getCombinedRatio(),
      retentionRate: this.getRetentionRate(),
      avgClaimCycleTime: this.getAvgClaimCycleTime(),
      avgClaimSeverity: this.getAvgClaimSeverity(),
      collectionRate: this.getCollectionRate(),
    };
  }

  /** Role-specific dashboard data */
  getRoleDashboard(role: string) {
    const kpis = this.getExecutiveKPIs();
    const policySummary = {
      total: policyRepository.count(),
      byStatus: policyRepository.getCountByStatus(),
      byType: policyRepository.getCountByType(),
      totalPremium: policyRepository.getTotalPremium(),
      totalCoverage: policyRepository.getTotalCoverage(),
    };
    const claimsSummary = {
      total: claimRepository.count(),
      byStatus: claimRepository.getCountByStatus(),
      totalClaimed: claimRepository.getTotalClaimedAmount(),
      totalSettled: claimRepository.getTotalSettledAmount(),
    };
    const uwSummary = {
      total: underwritingRepository.count(),
      decisions: underwritingRepository.getDecisionDistribution(),
      riskDist: underwritingRepository.getRiskScoreDistribution(),
    };
    const billingSummary = billingService.getSummary();

    switch (role) {
      case 'Admin':
      case 'Executive':
        return { role, kpis, policySummary, claimsSummary, uwSummary, billingSummary };
      case 'Underwriter':
        return {
          role,
          kpis: { lossRatio: kpis.lossRatio, retentionRate: kpis.retentionRate },
          uwSummary,
          policySummary: { total: policySummary.total, byStatus: policySummary.byStatus },
        };
      case 'Claims':
        return {
          role,
          kpis: { lossRatio: kpis.lossRatio, avgClaimCycleTime: kpis.avgClaimCycleTime, avgClaimSeverity: kpis.avgClaimSeverity },
          claimsSummary,
        };
      case 'Operations':
        return {
          role,
          kpis: { retentionRate: kpis.retentionRate, collectionRate: kpis.collectionRate },
          policySummary,
          billingSummary,
        };
      default:
        return { role, kpis, policySummary };
    }
  }
}

export const kpiEngine = new KPIEngine();
