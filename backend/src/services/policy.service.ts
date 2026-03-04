import { Policy, PolicyStatus, PolicyVersion, Endorsement, Renewal, PremiumCalculation } from '../models';
import { policyRepository } from '../repositories/policy.repository';
import { policyVersionRepository } from '../repositories/policy-version.repository';
import { endorsementRepository } from '../repositories/endorsement.repository';
import { renewalRepository } from '../repositories/renewal.repository';
import { auditRepository } from '../repositories/audit.repository';
import { generatePolicyId, generateId, generateLogId, generateEndorsementId, generateRenewalId } from '../utils/id-generator';
import { calculatePremium, calculateRenewalPremium } from './premiumEngine';

const VALID_STATUS_TRANSITIONS: Record<PolicyStatus, PolicyStatus[]> = {
  Draft: ['Quoted', 'Cancelled'],
  Quoted: ['Bound', 'Cancelled'],
  Bound: ['Issued', 'Cancelled'],
  Issued: ['Active'],
  Active: ['Endorsed', 'Renewal_Pending', 'Lapsed', 'Cancelled', 'Expired'],
  Endorsed: ['Active', 'Cancelled'],
  Renewal_Pending: ['Active', 'Cancelled', 'Expired'],
  Reinstated: ['Active'],
  Lapsed: ['Reinstated', 'Cancelled'],
  Cancelled: [],
  Expired: [],
};

export class PolicyService {
  // ─── Create / CRUD ─────────────────────────────────────────────

  async createPolicy(data: Partial<Policy>, userId: string): Promise<Policy> {
    const now = new Date().toISOString();
    const policy: Policy = {
      id: generatePolicyId(),
      customerId: data.customerId || '',
      policyType: data.policyType || 'Mortgage Guarantee',
      status: 'Draft',
      premiumAmount: data.premiumAmount || 0,
      coverageAmount: data.coverageAmount || 0,
      startDate: data.startDate || now.split('T')[0],
      endDate: data.endDate || '',
      riskCategory: data.riskCategory || 'Medium',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };

    await policyRepository.create(policy);
    await this.logAudit('CREATE', 'policy', policy.id, userId, undefined, policy);
    return policy;
  }

  async updatePolicy(id: string, data: Partial<Policy>, userId: string): Promise<Policy> {
    const existing = policyRepository.findById(id);
    if (!existing) throw new Error('Policy not found');

    const beforeState = { ...existing };
    const changes: Record<string, { from: any; to: any }> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'version' && (existing as any)[key] !== value) {
        changes[key] = { from: (existing as any)[key], to: value };
      }
    }

    const newVersion = existing.version + 1;
    const versionRecord: PolicyVersion = {
      id: generateId('VER'),
      policyId: id,
      version: existing.version,
      changes,
      timestamp: new Date().toISOString(),
      changedBy: userId,
    };

    await policyVersionRepository.create(versionRecord);
    const updated = await policyRepository.update(id, {
      ...data,
      version: newVersion,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) throw new Error('Failed to update policy');
    await this.logAudit('UPDATE', 'policy', id, userId, beforeState, updated);
    return updated;
  }

  async changeStatus(id: string, newStatus: PolicyStatus, userId: string): Promise<Policy> {
    const existing = policyRepository.findById(id);
    if (!existing) throw new Error('Policy not found');

    const allowedTransitions = VALID_STATUS_TRANSITIONS[existing.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${existing.status} → ${newStatus}. Allowed: ${allowedTransitions.join(', ') || 'none'}`
      );
    }

    const beforeState = { ...existing };
    const updated = await policyRepository.update(id, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) throw new Error('Failed to update policy status');
    await this.logAudit('STATUS_CHANGE', 'policy', id, userId, beforeState, updated);
    return updated;
  }

  // ─── Quoting & Rating ──────────────────────────────────────────

  async createQuote(data: {
    customerId: string;
    policyType: Policy['policyType'];
    coverageAmount: number;
    startDate: string;
    endDate: string;
    riskCategory: 'Low' | 'Medium' | 'High';
    ltvRatio?: number;
    creditScore?: number;
  }, userId: string): Promise<{ policy: Policy; premium: PremiumCalculation }> {
    const premium = calculatePremium(
      data.coverageAmount,
      data.policyType,
      data.riskCategory,
      data.ltvRatio,
      data.creditScore
    );

    const now = new Date().toISOString();
    const policy: Policy = {
      id: generatePolicyId(),
      customerId: data.customerId,
      policyType: data.policyType,
      status: 'Quoted',
      premiumAmount: premium.totalPremium,
      coverageAmount: data.coverageAmount,
      startDate: data.startDate,
      endDate: data.endDate,
      riskCategory: data.riskCategory,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };

    await policyRepository.create(policy);
    await this.logAudit('QUOTE', 'policy', policy.id, userId, undefined, { policy, premium });
    return { policy, premium };
  }

  calculateQuotePremium(data: {
    policyType: Policy['policyType'];
    coverageAmount: number;
    riskCategory: 'Low' | 'Medium' | 'High';
    ltvRatio?: number;
    creditScore?: number;
  }): PremiumCalculation {
    return calculatePremium(data.coverageAmount, data.policyType, data.riskCategory, data.ltvRatio, data.creditScore);
  }

  async bindPolicy(id: string, userId: string): Promise<Policy> {
    const existing = policyRepository.findById(id);
    if (!existing) throw new Error('Policy not found');
    if (existing.status !== 'Quoted') throw new Error('Only quoted policies can be bound');

    const beforeState = { ...existing };
    const updated = await policyRepository.update(id, { status: 'Bound', updatedAt: new Date().toISOString() });
    if (!updated) throw new Error('Failed to bind policy');

    await this.logAudit('BIND', 'policy', id, userId, beforeState, updated);
    return updated;
  }

  async issuePolicy(id: string, userId: string): Promise<Policy> {
    const existing = policyRepository.findById(id);
    if (!existing) throw new Error('Policy not found');
    if (existing.status !== 'Bound') throw new Error('Only bound policies can be issued');

    const beforeState = { ...existing };
    const updated = await policyRepository.update(id, { status: 'Issued', updatedAt: new Date().toISOString() });
    if (!updated) throw new Error('Failed to issue policy');

    await this.logAudit('ISSUE', 'policy', id, userId, beforeState, updated);
    return updated;
  }

  // ─── Endorsements ──────────────────────────────────────────────

  async createEndorsement(policyId: string, data: {
    type: Endorsement['type'];
    description: string;
    changes: Record<string, { from: any; to: any }>;
    effectiveDate: string;
  }, userId: string): Promise<Endorsement> {
    const policy = policyRepository.findById(policyId);
    if (!policy) throw new Error('Policy not found');
    if (!['Active', 'Issued'].includes(policy.status)) {
      throw new Error('Endorsements can only be created for active or issued policies');
    }

    let premiumDelta = 0;
    if (data.changes.coverageAmount) {
      const oldPremium = calculatePremium(data.changes.coverageAmount.from, policy.policyType, policy.riskCategory);
      const newPremium = calculatePremium(data.changes.coverageAmount.to, policy.policyType, policy.riskCategory);
      premiumDelta = newPremium.totalPremium - oldPremium.totalPremium;
    }
    if (data.changes.premiumAmount) {
      premiumDelta = data.changes.premiumAmount.to - data.changes.premiumAmount.from;
    }

    const endorsement: Endorsement = {
      id: generateEndorsementId(),
      policyId,
      type: data.type,
      description: data.description,
      changes: data.changes,
      premiumDelta,
      effectiveDate: data.effectiveDate,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    await endorsementRepository.create(endorsement);
    await this.logAudit('ENDORSE', 'endorsement', endorsement.id, userId, undefined, endorsement);
    return endorsement;
  }

  async approveEndorsement(endorsementId: string, userId: string): Promise<Endorsement> {
    const endorsement = endorsementRepository.findById(endorsementId);
    if (!endorsement) throw new Error('Endorsement not found');
    if (endorsement.status !== 'Pending') throw new Error('Only pending endorsements can be approved');

    const updated = await endorsementRepository.update(endorsementId, {
      status: 'Approved',
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error('Failed to approve endorsement');
    return updated;
  }

  async applyEndorsement(endorsementId: string, userId: string): Promise<{ endorsement: Endorsement; policy: Policy }> {
    const endorsement = endorsementRepository.findById(endorsementId);
    if (!endorsement) throw new Error('Endorsement not found');
    if (endorsement.status !== 'Approved') throw new Error('Only approved endorsements can be applied');

    const policy = policyRepository.findById(endorsement.policyId);
    if (!policy) throw new Error('Policy not found');

    const policyUpdates: Partial<Policy> = { updatedAt: new Date().toISOString() };
    for (const [key, change] of Object.entries(endorsement.changes)) {
      (policyUpdates as any)[key] = change.to;
    }
    if (endorsement.premiumDelta !== 0) {
      policyUpdates.premiumAmount = policy.premiumAmount + endorsement.premiumDelta;
    }
    policyUpdates.status = 'Endorsed';

    const updatedPolicy = await policyRepository.update(policy.id, policyUpdates);
    const updatedEndorsement = await endorsementRepository.update(endorsementId, { status: 'Applied' });

    if (!updatedPolicy || !updatedEndorsement) throw new Error('Failed to apply endorsement');
    await this.logAudit('ENDORSE', 'policy', policy.id, userId, policy, updatedPolicy);
    return { endorsement: updatedEndorsement, policy: updatedPolicy };
  }

  getEndorsements(policyId: string): Endorsement[] {
    return endorsementRepository.findByPolicyId(policyId);
  }

  // ─── Renewals ──────────────────────────────────────────────────

  async initiateRenewal(policyId: string, userId: string): Promise<Renewal> {
    const policy = policyRepository.findById(policyId);
    if (!policy) throw new Error('Policy not found');
    if (!['Active', 'Expired'].includes(policy.status)) {
      throw new Error('Only active or expired policies can be renewed');
    }

    const existingRenewals = renewalRepository.findByOriginalPolicyId(policyId);
    const pendingRenewal = existingRenewals.find((r) => ['Pending', 'Quoted'].includes(r.status));
    if (pendingRenewal) throw new Error('A pending renewal already exists for this policy');

    const claimsCount = 0;
    const yearsAsCustomer = Math.max(1, Math.floor(
      (new Date().getTime() - new Date(policy.createdAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    ));

    const { newPremium, changePercent, factors } = calculateRenewalPremium(
      policy.premiumAmount, claimsCount, yearsAsCustomer, policy.riskCategory
    );

    const currentEnd = new Date(policy.endDate);
    const newStart = new Date(currentEnd);
    newStart.setDate(newStart.getDate() + 1);
    const newEnd = new Date(newStart);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    const renewal: Renewal = {
      id: generateRenewalId(),
      originalPolicyId: policyId,
      renewalDate: policy.endDate,
      newPremiumAmount: newPremium,
      newCoverageAmount: policy.coverageAmount,
      newStartDate: newStart.toISOString().split('T')[0],
      newEndDate: newEnd.toISOString().split('T')[0],
      premiumChange: changePercent,
      status: 'Pending',
      uwReEvaluated: false,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    await renewalRepository.create(renewal);

    if (policy.status === 'Active') {
      await policyRepository.update(policyId, {
        status: 'Renewal_Pending',
        updatedAt: new Date().toISOString(),
      });
    }

    await this.logAudit('RENEW', 'renewal', renewal.id, userId, undefined, renewal);
    return renewal;
  }

  async acceptRenewal(renewalId: string, userId: string): Promise<{ renewal: Renewal; newPolicy: Policy }> {
    const renewal = renewalRepository.findById(renewalId);
    if (!renewal) throw new Error('Renewal not found');
    if (!['Pending', 'Quoted'].includes(renewal.status)) throw new Error('Renewal cannot be accepted in current state');

    const originalPolicy = policyRepository.findById(renewal.originalPolicyId);
    if (!originalPolicy) throw new Error('Original policy not found');

    const now = new Date().toISOString();
    const newPolicy: Policy = {
      id: generatePolicyId(),
      customerId: originalPolicy.customerId,
      policyType: originalPolicy.policyType,
      status: 'Active',
      premiumAmount: renewal.newPremiumAmount,
      coverageAmount: renewal.newCoverageAmount,
      startDate: renewal.newStartDate,
      endDate: renewal.newEndDate,
      riskCategory: originalPolicy.riskCategory,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      renewalOf: renewal.originalPolicyId,
    };

    await policyRepository.create(newPolicy);

    const updatedRenewal = await renewalRepository.update(renewalId, {
      status: 'Accepted',
      renewedPolicyId: newPolicy.id,
    });

    await policyRepository.update(originalPolicy.id, {
      status: 'Expired',
      updatedAt: now,
    });

    if (!updatedRenewal) throw new Error('Failed to update renewal');
    await this.logAudit('RENEW', 'policy', newPolicy.id, userId, originalPolicy, newPolicy);
    return { renewal: updatedRenewal, newPolicy };
  }

  async declineRenewal(renewalId: string, userId: string): Promise<Renewal> {
    const renewal = renewalRepository.findById(renewalId);
    if (!renewal) throw new Error('Renewal not found');

    const updated = await renewalRepository.update(renewalId, { status: 'Declined' });
    if (!updated) throw new Error('Failed to decline renewal');

    const originalPolicy = policyRepository.findById(renewal.originalPolicyId);
    if (originalPolicy && originalPolicy.status === 'Renewal_Pending') {
      await policyRepository.update(originalPolicy.id, { status: 'Active', updatedAt: new Date().toISOString() });
    }

    return updated;
  }

  getRenewals(policyId: string): Renewal[] {
    return renewalRepository.findByOriginalPolicyId(policyId);
  }

  getAllPendingRenewals(): Renewal[] {
    return renewalRepository.findPendingRenewals();
  }

  // ─── Reinstatement ─────────────────────────────────────────────

  async reinstatePolicy(id: string, userId: string): Promise<Policy> {
    const existing = policyRepository.findById(id);
    if (!existing) throw new Error('Policy not found');
    if (existing.status !== 'Lapsed') throw new Error('Only lapsed policies can be reinstated');

    const daysSinceLapse = Math.floor(
      (new Date().getTime() - new Date(existing.updatedAt).getTime()) / (24 * 60 * 60 * 1000)
    );
    if (daysSinceLapse > 90) throw new Error('Policy cannot be reinstated after 90 days of lapse');

    const beforeState = { ...existing };
    const updated = await policyRepository.update(id, {
      status: 'Reinstated',
      updatedAt: new Date().toISOString(),
    });

    if (!updated) throw new Error('Failed to reinstate policy');
    await this.logAudit('REINSTATE', 'policy', id, userId, beforeState, updated);
    return updated;
  }

  // ─── Read Operations ───────────────────────────────────────────

  getPolicy(id: string): (Policy & { versionHistory: PolicyVersion[] }) | undefined {
    const policy = policyRepository.findById(id);
    if (!policy) return undefined;
    const versionHistory = policyVersionRepository.findByPolicyId(id);
    return { ...policy, versionHistory };
  }

  listPolicies(
    filters: { status?: PolicyStatus; policyType?: any; customerId?: string; riskCategory?: string },
    page: number = 1,
    limit: number = 20
  ): { data: Policy[]; total: number } {
    const filtered = policyRepository.findFiltered(filters);
    return policyRepository.paginate(filtered, page, limit);
  }

  getPolicyAudit(id: string) {
    return auditRepository.findByResource('policy', id);
  }

  getStatusTransitions(status: PolicyStatus): PolicyStatus[] {
    return VALID_STATUS_TRANSITIONS[status] || [];
  }

  // ─── Audit Helper ──────────────────────────────────────────────

  private async logAudit(action: any, resourceType: string, resourceId: string, userId: string, before?: any, after?: any): Promise<void> {
    try {
      await auditRepository.create({
        id: generateLogId(),
        actor: { userId, role: '' },
        action,
        resource: { type: resourceType, id: resourceId },
        before,
        after,
        ipAddress: 'internal',
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Silently fail
    }
  }
}

export const policyService = new PolicyService();
