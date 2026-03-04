import { Referral, ReferralStatus, UWAuthority, UnderwritingRecord } from '../models';
import { generateId } from '../utils/id-generator';
import fs from 'fs';
import path from 'path';

const REFERRALS_PATH = path.resolve(__dirname, '../../mock-data/referrals.json');
const AUTHORITY_PATH = path.resolve(__dirname, '../../mock-data/uwAuthority.json');

function loadReferrals(): Referral[] {
  try { return JSON.parse(fs.readFileSync(REFERRALS_PATH, 'utf-8')); } catch { return []; }
}
function saveReferrals(data: Referral[]) {
  fs.writeFileSync(REFERRALS_PATH, JSON.stringify(data, null, 2));
}
function loadAuthority(): UWAuthority[] {
  try { return JSON.parse(fs.readFileSync(AUTHORITY_PATH, 'utf-8')); } catch { return []; }
}
function saveAuthority(data: UWAuthority[]) {
  fs.writeFileSync(AUTHORITY_PATH, JSON.stringify(data, null, 2));
}

export class ReferralEngine {
  createReferral(record: UnderwritingRecord, triggerRules: string[], assignTo?: string): Referral {
    const referrals = loadReferrals();
    const priority = record.riskScore > 70 ? 'Critical' : record.riskScore > 50 ? 'High' : record.riskScore > 30 ? 'Medium' : 'Low';
    const slaHours = priority === 'Critical' ? 24 : priority === 'High' ? 48 : 72;
    const sla = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    const referral: Referral = {
      id: generateId('REF'),
      underwritingId: record.id,
      policyId: record.policyId,
      assignedTo: assignTo || this.findBestAssignee(record),
      assignedBy: 'system',
      status: 'Pending',
      priority,
      reason: `Triggered by rules: ${triggerRules.join(', ')}`,
      triggerRules,
      riskScore: record.riskScore,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: sla,
    };
    referrals.push(referral);
    saveReferrals(referrals);
    return referral;
  }

  findBestAssignee(record: UnderwritingRecord): string {
    const authorities = loadAuthority();
    const eligible = authorities.filter(
      (a) => a.maxRiskScore >= record.riskScore && a.maxCoverageAmount >= record.propertyValue
    );
    return eligible.length > 0 ? eligible[0].userId : authorities[0]?.userId || 'USR001';
  }

  getReferrals(status?: ReferralStatus): Referral[] {
    const all = loadReferrals();
    if (status) return all.filter((r) => r.status === status);
    return all;
  }

  getReferralById(id: string): Referral | undefined {
    return loadReferrals().find((r) => r.id === id);
  }

  getReferralsByAssignee(userId: string): Referral[] {
    return loadReferrals().filter((r) => r.assignedTo === userId || r.escalatedTo === userId);
  }

  resolveReferral(id: string, resolution: string, decision: 'Accepted' | 'Declined', userId: string): Referral {
    const referrals = loadReferrals();
    const idx = referrals.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Referral not found');

    referrals[idx] = {
      ...referrals[idx],
      status: decision,
      resolution,
      resolvedBy: userId,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveReferrals(referrals);
    return referrals[idx];
  }

  escalateReferral(id: string, escalateTo: string): Referral {
    const referrals = loadReferrals();
    const idx = referrals.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Referral not found');

    referrals[idx] = {
      ...referrals[idx],
      status: 'Escalated',
      escalatedTo: escalateTo,
      updatedAt: new Date().toISOString(),
    };
    saveReferrals(referrals);
    return referrals[idx];
  }

  // --- Authority Management ---
  getAuthorities(): UWAuthority[] {
    return loadAuthority();
  }

  getAuthorityByUser(userId: string): UWAuthority | undefined {
    return loadAuthority().find((a) => a.userId === userId);
  }

  setAuthority(auth: UWAuthority): UWAuthority {
    const authorities = loadAuthority();
    const idx = authorities.findIndex((a) => a.userId === auth.userId);
    if (idx >= 0) {
      authorities[idx] = { ...authorities[idx], ...auth, updatedAt: new Date().toISOString() };
    } else {
      authorities.push({ ...auth, updatedAt: new Date().toISOString() });
    }
    saveAuthority(authorities);
    return authorities[idx >= 0 ? idx : authorities.length - 1];
  }

  getSummary() {
    const referrals = loadReferrals();
    const pending = referrals.filter((r) => r.status === 'Pending').length;
    const escalated = referrals.filter((r) => r.status === 'Escalated').length;
    const overdue = referrals.filter((r) => r.status === 'Pending' && new Date(r.slaDeadline) < new Date()).length;
    return { total: referrals.length, pending, escalated, overdue, resolved: referrals.length - pending - escalated };
  }
}

export const referralEngine = new ReferralEngine();
