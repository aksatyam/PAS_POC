import { BaseRepository } from './base.repository';
import { Renewal } from '../models';

class RenewalRepository extends BaseRepository<Renewal> {
  constructor() {
    super('renewals.json');
  }

  findByOriginalPolicyId(policyId: string): Renewal[] {
    return this.loadData().filter((r) => r.originalPolicyId === policyId);
  }

  findByStatus(status: Renewal['status']): Renewal[] {
    return this.loadData().filter((r) => r.status === status);
  }

  findPendingRenewals(): Renewal[] {
    return this.loadData().filter((r) => r.status === 'Pending' || r.status === 'Quoted');
  }

  findByRenewedPolicyId(policyId: string): Renewal | undefined {
    return this.loadData().find((r) => r.renewedPolicyId === policyId);
  }
}

export const renewalRepository = new RenewalRepository();
