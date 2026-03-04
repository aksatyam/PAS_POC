import { BaseRepository } from './base.repository';
import { FNOL } from '../models';

class FNOLRepository extends BaseRepository<FNOL> {
  constructor() {
    super('fnol.json');
  }

  findByPolicyId(policyId: string): FNOL[] {
    return this.loadData().filter((f) => f.policyId === policyId);
  }

  findByStatus(status: FNOL['status']): FNOL[] {
    return this.loadData().filter((f) => f.status === status);
  }

  findByClaimId(claimId: string): FNOL | undefined {
    return this.loadData().find((f) => f.claimId === claimId);
  }
}

export const fnolRepository = new FNOLRepository();
