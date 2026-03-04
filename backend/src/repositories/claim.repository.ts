import { BaseRepository } from './base.repository';
import { Claim, ClaimStatus } from '../models';

class ClaimRepository extends BaseRepository<Claim> {
  constructor() {
    super('claims.json');
  }

  findByPolicyId(policyId: string): Claim[] {
    return this.loadData().filter((c) => c.policyId === policyId);
  }

  findByStatus(status: ClaimStatus): Claim[] {
    return this.loadData().filter((c) => c.status === status);
  }

  findFiltered(filters: {
    status?: ClaimStatus;
    policyId?: string;
    claimType?: string;
  }): Claim[] {
    return this.loadData().filter((c) => {
      if (filters.status && c.status !== filters.status) return false;
      if (filters.policyId && c.policyId !== filters.policyId) return false;
      if (filters.claimType && c.claimType !== filters.claimType) return false;
      return true;
    });
  }

  getCountByStatus(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const c of this.loadData()) {
      counts[c.status] = (counts[c.status] || 0) + 1;
    }
    return counts;
  }

  getTotalClaimedAmount(): number {
    return this.loadData().reduce((sum, c) => sum + c.amount, 0);
  }

  getTotalSettledAmount(): number {
    return this.loadData()
      .filter((c) => c.status === 'Settled' && c.settlementAmount)
      .reduce((sum, c) => sum + (c.settlementAmount || 0), 0);
  }
}

export const claimRepository = new ClaimRepository();
