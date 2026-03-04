import { policyRepository } from '../repositories/policy.repository';
import { claimRepository } from '../repositories/claim.repository';
import { underwritingRepository } from '../repositories/underwriting.repository';
import { billingService } from './billing.service';
import { kpiEngine } from './kpiEngine';
import { toCSV } from './reportExport';

function inRange(dateStr: string, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  const d = new Date(dateStr).getTime();
  if (from && d < new Date(from).getTime()) return false;
  if (to && d > new Date(to).getTime()) return false;
  return true;
}

export class ReportService {
  getPolicyReport(from?: string, to?: string) {
    let policies = policyRepository.findAll();
    if (from || to) {
      policies = policies.filter((p) => inRange(p.createdAt, from, to));
    }
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalPremium = 0;
    let totalCoverage = 0;
    for (const p of policies) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      byType[p.policyType] = (byType[p.policyType] || 0) + 1;
      totalPremium += p.premiumAmount;
      totalCoverage += p.coverageAmount;
    }
    const active = byStatus['Active'] || 0;
    return { total: policies.length, active, totalPremium, totalCoverage, byStatus, byType };
  }

  getClaimsReport(from?: string, to?: string) {
    let claims = claimRepository.findAll();
    if (from || to) {
      claims = claims.filter((c) => inRange(c.filedDate, from, to));
    }
    const byStatus: Record<string, number> = {};
    let totalAmount = 0;
    let totalSettled = 0;
    for (const c of claims) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      totalAmount += c.amount;
      if (c.status === 'Settled' && c.settlementAmount) totalSettled += c.settlementAmount;
    }
    return { total: claims.length, totalAmount, totalSettled, byStatus };
  }

  getUnderwritingReport(from?: string, to?: string) {
    let records = underwritingRepository.findAll();
    if (from || to) {
      records = records.filter((r) => inRange(r.evaluatedAt, from, to));
    }
    const byDecision: Record<string, number> = {};
    let totalScore = 0;
    for (const r of records) {
      byDecision[r.decision] = (byDecision[r.decision] || 0) + 1;
      totalScore += r.riskScore;
    }
    return {
      total: records.length,
      avgRiskScore: records.length > 0 ? Math.round((totalScore / records.length) * 10) / 10 : 0,
      byDecision,
      autoApproveRate: records.length > 0
        ? Math.round(((byDecision['Auto-Approve'] || 0) / records.length) * 10000) / 100
        : 0,
    };
  }

  getBillingReport() {
    return billingService.getSummary();
  }

  getExecutiveReport() {
    return kpiEngine.getExecutiveKPIs();
  }

  // CSV exports
  getPoliciesCSV(from?: string, to?: string): string {
    let policies = policyRepository.findAll();
    if (from || to) {
      policies = policies.filter((p) => inRange(p.createdAt, from, to));
    }
    return toCSV(
      policies.map((p) => ({
        id: p.id,
        type: p.policyType,
        status: p.status,
        customerId: p.customerId,
        premium: p.premiumAmount,
        coverage: p.coverageAmount,
        startDate: p.startDate,
        endDate: p.endDate,
        riskCategory: p.riskCategory,
        createdAt: p.createdAt,
      }))
    );
  }

  getClaimsCSV(from?: string, to?: string): string {
    let claims = claimRepository.findAll();
    if (from || to) {
      claims = claims.filter((c) => inRange(c.filedDate, from, to));
    }
    return toCSV(
      claims.map((c) => ({
        id: c.id,
        policyId: c.policyId,
        type: c.claimType,
        status: c.status,
        amount: c.amount,
        settlementAmount: c.settlementAmount || '',
        filedDate: c.filedDate,
        updatedAt: c.updatedAt,
      }))
    );
  }
}

export const reportService = new ReportService();
