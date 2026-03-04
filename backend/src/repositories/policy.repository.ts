import { BaseRepository } from './base.repository';
import { Policy, PolicyStatus, PolicyType } from '../models';

class PolicyRepository extends BaseRepository<Policy> {
  constructor() {
    super('policies.json');
  }

  findByStatus(status: PolicyStatus): Policy[] {
    return this.loadData().filter((p) => p.status === status);
  }

  findByCustomer(customerId: string): Policy[] {
    return this.loadData().filter((p) => p.customerId === customerId);
  }

  findByType(policyType: PolicyType): Policy[] {
    return this.loadData().filter((p) => p.policyType === policyType);
  }

  findFiltered(filters: {
    status?: PolicyStatus;
    policyType?: PolicyType;
    customerId?: string;
    riskCategory?: string;
  }): Policy[] {
    return this.loadData().filter((p) => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.policyType && p.policyType !== filters.policyType) return false;
      if (filters.customerId && p.customerId !== filters.customerId) return false;
      if (filters.riskCategory && p.riskCategory !== filters.riskCategory) return false;
      return true;
    });
  }

  getTotalPremium(): number {
    return this.loadData().reduce((sum, p) => sum + p.premiumAmount, 0);
  }

  getTotalCoverage(): number {
    return this.loadData().reduce((sum, p) => sum + p.coverageAmount, 0);
  }

  getCountByStatus(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const p of this.loadData()) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return counts;
  }

  getCountByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const p of this.loadData()) {
      counts[p.policyType] = (counts[p.policyType] || 0) + 1;
    }
    return counts;
  }
}

export const policyRepository = new PolicyRepository();
