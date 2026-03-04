import { Claim, ClaimStatus, AdjudicationStatus, FNOL, Reserve, LossMitigation } from '../models';
import { claimRepository } from '../repositories/claim.repository';
import { fnolRepository } from '../repositories/fnol.repository';
import { reserveRepository } from '../repositories/reserve.repository';
import { mitigationRepository } from '../repositories/mitigation.repository';
import { auditRepository } from '../repositories/audit.repository';
import { generateClaimId, generateLogId } from '../utils/id-generator';
import { assessFraud } from './fraudScoring';

const VALID_CLAIM_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  Filed: ['Under Review'],
  'Under Review': ['Approved', 'Rejected'],
  Approved: ['Settled'],
  Rejected: [],
  Settled: [],
};

function generateFnolId(): string {
  const existing = fnolRepository.findAll();
  const num = existing.length + 1;
  return `FNOL-${String(num).padStart(5, '0')}`;
}

function generateReserveId(): string {
  const existing = reserveRepository.findAll();
  const num = existing.length + 1;
  return `RSV-${String(num).padStart(5, '0')}`;
}

function generateMitigationId(): string {
  const existing = mitigationRepository.findAll();
  const num = existing.length + 1;
  return `MIT-${String(num).padStart(5, '0')}`;
}

export class ClaimService {
  // ─── FNOL ──────────────────────────────────────────────────
  async submitFNOL(data: Partial<FNOL>, userId: string): Promise<FNOL> {
    const now = new Date().toISOString();
    const fnol: FNOL = {
      id: generateFnolId(),
      policyId: data.policyId || '',
      claimType: data.claimType || 'Other',
      incidentDate: data.incidentDate || now,
      incidentLocation: data.incidentLocation || '',
      description: data.description || '',
      reportedBy: data.reportedBy || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail,
      damageDescription: data.damageDescription || '',
      estimatedAmount: data.estimatedAmount || 0,
      partiesInvolved: data.partiesInvolved || [],
      documents: data.documents || [],
      status: 'Submitted',
      createdAt: now,
      createdBy: userId,
    };

    await fnolRepository.create(fnol);
    await this.logAudit('CREATE', fnol.id, userId, undefined, fnol);
    return fnol;
  }

  async processFNOL(fnolId: string, userId: string): Promise<{ fnol: FNOL; claim: Claim }> {
    const fnol = fnolRepository.findById(fnolId);
    if (!fnol) throw new Error('FNOL not found');
    if (fnol.status === 'Claim Created') throw new Error('FNOL already processed');

    // Create claim from FNOL
    const claim = await this.registerClaim({
      policyId: fnol.policyId,
      claimType: fnol.claimType,
      description: fnol.description,
      amount: fnol.estimatedAmount,
      incidentDate: fnol.incidentDate,
      incidentLocation: fnol.incidentLocation,
      reportedBy: fnol.reportedBy,
      contactPhone: fnol.contactPhone,
    }, userId);

    // Update FNOL
    const updatedFnol = await fnolRepository.update(fnolId, {
      status: 'Claim Created',
      claimId: claim.id,
    });

    // Link FNOL to claim
    await claimRepository.update(claim.id, { fnolId: fnol.id });

    return { fnol: updatedFnol!, claim };
  }

  getFNOL(fnolId: string): FNOL | undefined {
    return fnolRepository.findById(fnolId);
  }

  listFNOLs(status?: FNOL['status']): FNOL[] {
    if (status) return fnolRepository.findByStatus(status);
    return fnolRepository.findAll();
  }

  // ─── Claims (original + enhanced) ─────────────────────────
  async registerClaim(data: Partial<Claim>, userId: string): Promise<Claim> {
    const now = new Date().toISOString();
    const claim: Claim = {
      id: generateClaimId(),
      policyId: data.policyId || '',
      claimType: data.claimType || 'Other',
      description: data.description || '',
      amount: data.amount || 0,
      status: 'Filed',
      filedDate: now,
      documents: data.documents || [],
      createdBy: userId,
      updatedAt: now,
      incidentDate: data.incidentDate,
      incidentLocation: data.incidentLocation,
      reportedBy: data.reportedBy,
      contactPhone: data.contactPhone,
      fnolId: data.fnolId,
    };

    // Auto fraud assessment
    await claimRepository.create(claim);
    const fraud = assessFraud(claim);
    await claimRepository.update(claim.id, {
      fraudScore: fraud.score,
      fraudIndicators: fraud.indicators.filter((i) => i.triggered).map((i) => i.description),
    });
    claim.fraudScore = fraud.score;
    claim.fraudIndicators = fraud.indicators.filter((i) => i.triggered).map((i) => i.description);

    await this.logAudit('CREATE', claim.id, userId, undefined, claim);
    return claim;
  }

  async updateStatus(id: string, newStatus: ClaimStatus, userId: string): Promise<Claim> {
    const existing = claimRepository.findById(id);
    if (!existing) throw new Error('Claim not found');

    const allowed = VALID_CLAIM_TRANSITIONS[existing.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status transition: ${existing.status} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`);
    }

    const beforeState = { ...existing };
    const updateData: Partial<Claim> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (newStatus === 'Under Review') {
      updateData.reviewDate = new Date().toISOString();
      updateData.assignedTo = userId;
      updateData.adjudicationStatus = 'Investigation';
    }

    const updated = await claimRepository.update(id, updateData);
    if (!updated) throw new Error('Failed to update claim status');

    await this.logAudit('STATUS_CHANGE', id, userId, beforeState, updated);
    return updated;
  }

  async settleClaim(id: string, settlementAmount: number, userId: string): Promise<Claim> {
    const existing = claimRepository.findById(id);
    if (!existing) throw new Error('Claim not found');
    if (existing.status !== 'Approved') throw new Error('Only approved claims can be settled');

    const beforeState = { ...existing };
    const updated = await claimRepository.update(id, {
      status: 'Settled',
      settlementAmount,
      settlementDate: new Date().toISOString(),
      adjudicationStatus: 'Settlement',
      updatedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error('Failed to settle claim');

    await this.logAudit('SETTLEMENT', id, userId, beforeState, updated);
    return updated;
  }

  // ─── Adjudication ──────────────────────────────────────────
  async updateAdjudicationStatus(id: string, adjStatus: AdjudicationStatus, userId: string): Promise<Claim> {
    const existing = claimRepository.findById(id);
    if (!existing) throw new Error('Claim not found');
    if (existing.status !== 'Under Review' && existing.status !== 'Approved') {
      throw new Error('Adjudication only available for claims Under Review or Approved');
    }

    const beforeState = { ...existing };
    const updated = await claimRepository.update(id, {
      adjudicationStatus: adjStatus,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error('Failed to update adjudication status');

    await this.logAudit('UPDATE', id, userId, beforeState, updated);
    return updated;
  }

  // ─── Reserves ──────────────────────────────────────────────
  async setReserve(claimId: string, amount: number, reason: string, userId: string): Promise<Reserve> {
    const claim = claimRepository.findById(claimId);
    if (!claim) throw new Error('Claim not found');

    const currentReserve = reserveRepository.getCurrentReserve(claimId);
    const reserve: Reserve = {
      id: generateReserveId(),
      claimId,
      type: currentReserve === 0 ? 'Initial' : 'Adjustment',
      amount,
      previousAmount: currentReserve,
      reason,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    await reserveRepository.create(reserve);
    await claimRepository.update(claimId, { reserveAmount: amount, updatedAt: new Date().toISOString() });

    await this.logAudit('UPDATE', claimId, userId, { reserveAmount: currentReserve }, { reserveAmount: amount });
    return reserve;
  }

  getReserveHistory(claimId: string): Reserve[] {
    return reserveRepository.findByClaimId(claimId);
  }

  // ─── Fraud ─────────────────────────────────────────────────
  getFraudAssessment(claimId: string) {
    const claim = claimRepository.findById(claimId);
    if (!claim) throw new Error('Claim not found');
    return assessFraud(claim);
  }

  // ─── Loss Mitigation ──────────────────────────────────────
  async addMitigation(claimId: string, data: Partial<LossMitigation>, userId: string): Promise<LossMitigation> {
    const claim = claimRepository.findById(claimId);
    if (!claim) throw new Error('Claim not found');

    const mitigation: LossMitigation = {
      id: generateMitigationId(),
      claimId,
      type: data.type || 'Other',
      description: data.description || '',
      status: 'Proposed',
      startDate: data.startDate || new Date().toISOString(),
      terms: data.terms,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    await mitigationRepository.create(mitigation);
    return mitigation;
  }

  async updateMitigationStatus(mitigationId: string, status: LossMitigation['status'], userId: string): Promise<LossMitigation> {
    const existing = mitigationRepository.findById(mitigationId);
    if (!existing) throw new Error('Mitigation action not found');

    const updateData: Partial<LossMitigation> = { status };
    if (status === 'Completed' || status === 'Failed') {
      updateData.endDate = new Date().toISOString();
    }

    const updated = await mitigationRepository.update(mitigationId, updateData);
    if (!updated) throw new Error('Failed to update mitigation');
    return updated;
  }

  getMitigations(claimId: string): LossMitigation[] {
    return mitigationRepository.findByClaimId(claimId);
  }

  // ─── Read ──────────────────────────────────────────────────
  getClaim(id: string): Claim | undefined {
    return claimRepository.findById(id);
  }

  listClaims(
    filters: { status?: ClaimStatus; policyId?: string; claimType?: string },
    page: number = 1,
    limit: number = 20
  ): { data: Claim[]; total: number } {
    const filtered = claimRepository.findFiltered(filters);
    return claimRepository.paginate(filtered, page, limit);
  }

  getClaimsByPolicy(policyId: string): Claim[] {
    return claimRepository.findByPolicyId(policyId);
  }

  getClaimsByAdjudicationStatus(adjStatus: AdjudicationStatus): Claim[] {
    return claimRepository.findAll().filter((c) => c.adjudicationStatus === adjStatus);
  }

  // ─── Audit ─────────────────────────────────────────────────
  private async logAudit(action: any, resourceId: string, userId: string, before?: any, after?: any): Promise<void> {
    try {
      await auditRepository.create({
        id: generateLogId(),
        actor: { userId, role: '' },
        action,
        resource: { type: 'claim', id: resourceId },
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

export const claimService = new ClaimService();
