import { EvaluationRequest, UnderwritingRecord, UnderwritingDecision, RuleResult, UnderwritingRule } from '../models';
import { underwritingRepository } from '../repositories/underwriting.repository';
import { auditRepository } from '../repositories/audit.repository';
import { referralEngine } from './referralEngine';
import { generateId, generateLogId } from '../utils/id-generator';
import fs from 'fs';
import path from 'path';

const RULES_PATH = path.resolve(__dirname, '../../mock-data/uwRules.json');
function loadConfigurableRules(): UnderwritingRule[] {
  try { return JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8')); } catch { return []; }
}

export class UnderwritingService {
  async evaluate(request: EvaluationRequest, userId: string): Promise<UnderwritingRecord> {
    const ltvRatio = (request.loanAmount / request.propertyValue) * 100;
    const rulesApplied: string[] = [];
    const ruleResults: RuleResult[] = [];
    let decision: UnderwritingDecision = 'Auto-Approve';

    const restrictedZones = underwritingRepository.getRestrictedZones();
    const configurableRules = loadConfigurableRules().filter((r) => r.isActive);

    if (request.creditScore >= 750 && ltvRatio <= 70) {
      rulesApplied.push('R001');
      ruleResults.push({ ruleId: 'R001', ruleName: 'High Credit Low LTV', category: 'Risk Assessment', passed: true, decision: 'Auto-Approve', detail: `Credit ${request.creditScore} >= 750, LTV ${ltvRatio.toFixed(1)}% <= 70%` });
    }
    if ((request.creditScore >= 650 && request.creditScore < 750) || (ltvRatio > 70 && ltvRatio <= 80)) {
      rulesApplied.push('R002'); decision = 'Refer';
      ruleResults.push({ ruleId: 'R002', ruleName: 'Moderate Credit or LTV', category: 'Risk Assessment', passed: true, decision: 'Refer', detail: `Credit ${request.creditScore}, LTV ${ltvRatio.toFixed(1)}%` });
    }
    if (request.creditScore < 650 || ltvRatio > 80) {
      rulesApplied.push('R003'); decision = 'Reject';
      ruleResults.push({ ruleId: 'R003', ruleName: 'Low Credit or High LTV', category: 'Risk Assessment', passed: true, decision: 'Reject', detail: `Credit ${request.creditScore} < 650 or LTV ${ltvRatio.toFixed(1)}% > 80%` });
    }
    if (request.applicantAge < 21 || request.applicantAge > 65) {
      rulesApplied.push('R004'); if (decision !== 'Reject') decision = 'Refer';
      ruleResults.push({ ruleId: 'R004', ruleName: 'Age Boundary Check', category: 'Eligibility', passed: true, decision: 'Refer', detail: `Age ${request.applicantAge} outside 21-65` });
    }
    if (request.income < 3 * request.annualPremium) {
      rulesApplied.push('R005'); decision = 'Reject';
      ruleResults.push({ ruleId: 'R005', ruleName: 'Affordability Check', category: 'Compliance', passed: true, decision: 'Reject', detail: `Income ${request.income} < 3x premium` });
    }
    if (restrictedZones.includes(request.propertyZone)) {
      rulesApplied.push('R006'); decision = 'Reject';
      ruleResults.push({ ruleId: 'R006', ruleName: 'Restricted Zone', category: 'Compliance', passed: true, decision: 'Reject', detail: `Zone "${request.propertyZone}" restricted` });
    }
    // R007: High-value property (configurable)
    const r007 = configurableRules.find((r) => r.id === 'R007');
    if (r007 && request.propertyValue > (r007.value as number)) {
      rulesApplied.push('R007'); if (decision !== 'Reject') decision = 'Refer';
      ruleResults.push({ ruleId: 'R007', ruleName: r007.name, category: r007.category, passed: true, decision: 'Refer', detail: `Property value > ${r007.value}` });
    }
    // R008: Premium/income ratio (may be inactive)
    const r008 = configurableRules.find((r) => r.id === 'R008');
    if (r008 && request.annualPremium > (r008.value as number) * request.income) {
      rulesApplied.push('R008'); if (decision !== 'Reject') decision = 'Refer';
      ruleResults.push({ ruleId: 'R008', ruleName: r008.name, category: r008.category, passed: true, decision: 'Refer', detail: `Premium burden exceeds threshold` });
    }

    if (rulesApplied.length === 0) {
      rulesApplied.push('R001');
      ruleResults.push({ ruleId: 'R001', ruleName: 'Default Approval', category: 'Risk Assessment', passed: true, decision: 'Auto-Approve', detail: 'No risk triggers' });
    }

    const riskScore = this.calculateRiskScore(request, ltvRatio, restrictedZones);

    const record: UnderwritingRecord = {
      id: generateId('UW'),
      policyId: request.policyId,
      applicantAge: request.applicantAge,
      creditScore: request.creditScore,
      income: request.income,
      propertyValue: request.propertyValue,
      ltvRatio: Math.round(ltvRatio * 100) / 100,
      propertyZone: request.propertyZone,
      annualPremium: request.annualPremium,
      riskScore, decision, rulesApplied, ruleResults,
      notes: `Automated evaluation. Decision: ${decision}`,
      evaluatedBy: userId,
      evaluatedAt: new Date().toISOString(),
      overridden: false,
    };

    await underwritingRepository.create(record);

    // Auto-create referral for Refer decisions
    if (decision === 'Refer') {
      const referral = referralEngine.createReferral(record, rulesApplied);
      record.referralId = referral.id;
      await underwritingRepository.update(record.id, { referralId: referral.id });
    }

    await this.logAudit('EVALUATE', record.id, userId, record);
    return record;
  }

  async overrideDecision(
    id: string,
    newDecision: UnderwritingDecision,
    reason: string,
    userId: string
  ): Promise<UnderwritingRecord> {
    const existing = underwritingRepository.findById(id);
    if (!existing) {
      throw new Error('Underwriting record not found');
    }

    const updated = await underwritingRepository.update(id, {
      decision: newDecision,
      overridden: true,
      overrideBy: userId,
      overrideReason: reason,
      notes: `${existing.notes} | Override by ${userId}: ${reason}`,
    });

    if (!updated) {
      throw new Error('Failed to override decision');
    }

    await this.logAudit('OVERRIDE', id, userId, updated);

    return updated;
  }

  getById(id: string): UnderwritingRecord | undefined {
    return underwritingRepository.findById(id);
  }

  getByPolicyId(policyId: string): UnderwritingRecord | undefined {
    return underwritingRepository.findByPolicyId(policyId);
  }

  listAll(page: number = 1, limit: number = 20): { data: UnderwritingRecord[]; total: number } {
    const all = underwritingRepository.findAll();
    return underwritingRepository.paginate(all, page, limit);
  }

  getRules() {
    return underwritingRepository.getRules();
  }

  private calculateRiskScore(request: EvaluationRequest, ltvRatio: number, restrictedZones: string[]): number {
    let score = 0;

    // Credit score factor (0-30 points)
    if (request.creditScore < 600) score += 30;
    else if (request.creditScore < 650) score += 25;
    else if (request.creditScore < 700) score += 18;
    else if (request.creditScore < 750) score += 12;
    else score += 5;

    // LTV factor (0-25 points)
    if (ltvRatio > 90) score += 25;
    else if (ltvRatio > 80) score += 20;
    else if (ltvRatio > 70) score += 14;
    else if (ltvRatio > 60) score += 8;
    else score += 3;

    // Age factor (0-15 points)
    if (request.applicantAge < 21 || request.applicantAge > 65) score += 15;
    else if (request.applicantAge < 25 || request.applicantAge > 60) score += 10;
    else score += 3;

    // Income/premium ratio factor (0-20 points)
    const ratio = request.income / request.annualPremium;
    if (ratio < 3) score += 20;
    else if (ratio < 5) score += 12;
    else if (ratio < 8) score += 6;
    else score += 2;

    // Zone factor (0-10 points)
    if (restrictedZones.includes(request.propertyZone)) score += 10;
    else score += 2;

    return Math.min(100, Math.max(1, score));
  }

  private async logAudit(action: 'EVALUATE' | 'OVERRIDE', resourceId: string, userId: string, data: any): Promise<void> {
    try {
      await auditRepository.create({
        id: generateLogId(),
        actor: { userId, role: '' },
        action,
        resource: { type: 'underwriting', id: resourceId },
        after: data,
        ipAddress: 'internal',
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Silently fail
    }
  }
}

export const underwritingService = new UnderwritingService();
