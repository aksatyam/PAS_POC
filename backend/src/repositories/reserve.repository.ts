import { BaseRepository } from './base.repository';
import { Reserve } from '../models';

class ReserveRepository extends BaseRepository<Reserve> {
  constructor() {
    super('reserves.json');
  }

  findByClaimId(claimId: string): Reserve[] {
    return this.loadData().filter((r) => r.claimId === claimId);
  }

  getCurrentReserve(claimId: string): number {
    const reserves = this.findByClaimId(claimId);
    if (reserves.length === 0) return 0;
    // Latest reserve entry holds the current amount
    const sorted = reserves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted[0].amount;
  }
}

export const reserveRepository = new ReserveRepository();
