import { BaseRepository } from './base.repository';
import { Endorsement } from '../models';

class EndorsementRepository extends BaseRepository<Endorsement> {
  constructor() {
    super('endorsements.json');
  }

  findByPolicyId(policyId: string): Endorsement[] {
    return this.loadData().filter((e) => e.policyId === policyId);
  }

  findByStatus(status: Endorsement['status']): Endorsement[] {
    return this.loadData().filter((e) => e.status === status);
  }

  findPendingByPolicyId(policyId: string): Endorsement[] {
    return this.loadData().filter((e) => e.policyId === policyId && e.status === 'Pending');
  }
}

export const endorsementRepository = new EndorsementRepository();
