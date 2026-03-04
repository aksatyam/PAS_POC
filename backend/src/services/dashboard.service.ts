import { policyRepository } from '../repositories/policy.repository';
import { claimRepository } from '../repositories/claim.repository';
import { underwritingRepository } from '../repositories/underwriting.repository';

export class DashboardService {
  getSummary() {
    const policiesByStatus = policyRepository.getCountByStatus();
    const totalPolicies = policyRepository.count();
    const totalPremium = policyRepository.getTotalPremium();
    const totalCoverage = policyRepository.getTotalCoverage();

    const policiesByType = policyRepository.getCountByType();

    return {
      totalPolicies,
      policiesByStatus,
      policiesByType,
      totalPremium,
      totalCoverage,
      activePolicies: policiesByStatus['Active'] || 0,
      draftPolicies: policiesByStatus['Draft'] || 0,
    };
  }

  getClaimsAnalytics() {
    const claimsByStatus = claimRepository.getCountByStatus();
    const totalClaims = claimRepository.count();
    const totalClaimedAmount = claimRepository.getTotalClaimedAmount();
    const totalSettledAmount = claimRepository.getTotalSettledAmount();

    return {
      totalClaims,
      claimsByStatus,
      totalClaimedAmount,
      totalSettledAmount,
      settlementRatio: totalClaimedAmount > 0
        ? Math.round((totalSettledAmount / totalClaimedAmount) * 10000) / 100
        : 0,
    };
  }

  getUnderwritingStats() {
    const decisionDistribution = underwritingRepository.getDecisionDistribution();
    const totalEvaluations = underwritingRepository.count();
    const riskDistribution = underwritingRepository.getRiskScoreDistribution();
    const allEvals = underwritingRepository.findAll();
    const avgRisk = allEvals.length > 0
      ? allEvals.reduce((sum: number, e: any) => sum + (e.riskScore || 0), 0) / allEvals.length
      : 0;

    return {
      totalEvaluations,
      decisionDistribution,
      riskDistribution,
      averageRiskScore: avgRisk,
      autoApproveRate: totalEvaluations > 0
        ? Math.round(((decisionDistribution['Auto-Approve'] || 0) / totalEvaluations) * 10000) / 100
        : 0,
    };
  }

  getRiskBreakdown() {
    const policies = policyRepository.findAll();
    const riskCounts: Record<string, number> = { Low: 0, Medium: 0, High: 0 };

    for (const p of policies) {
      riskCounts[p.riskCategory] = (riskCounts[p.riskCategory] || 0) + 1;
    }

    const total = policies.length;
    return {
      distribution: riskCounts,
      percentages: {
        Low: total > 0 ? Math.round((riskCounts['Low'] / total) * 10000) / 100 : 0,
        Medium: total > 0 ? Math.round((riskCounts['Medium'] / total) * 10000) / 100 : 0,
        High: total > 0 ? Math.round((riskCounts['High'] / total) * 10000) / 100 : 0,
      },
    };
  }
}

export const dashboardService = new DashboardService();
