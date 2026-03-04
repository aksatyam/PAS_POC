import { BaseRepository } from './base.repository';
import { LossMitigation } from '../models';

class MitigationRepository extends BaseRepository<LossMitigation> {
  constructor() {
    super('mitigations.json');
  }

  findByClaimId(claimId: string): LossMitigation[] {
    return this.loadData().filter((m) => m.claimId === claimId);
  }

  findByStatus(status: LossMitigation['status']): LossMitigation[] {
    return this.loadData().filter((m) => m.status === status);
  }
}

export const mitigationRepository = new MitigationRepository();
