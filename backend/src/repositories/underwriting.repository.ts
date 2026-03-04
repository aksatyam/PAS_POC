import { BaseRepository } from './base.repository';
import { UnderwritingRecord, UnderwritingDecision } from '../models';
import fs from 'fs';
import path from 'path';

class UnderwritingRepository extends BaseRepository<UnderwritingRecord> {
  constructor() {
    super('underwriting.json');
  }

  findByPolicyId(policyId: string): UnderwritingRecord | undefined {
    return this.loadData().find((r) => r.policyId === policyId);
  }

  findByDecision(decision: UnderwritingDecision): UnderwritingRecord[] {
    return this.loadData().filter((r) => r.decision === decision);
  }

  findByEvaluator(userId: string): UnderwritingRecord[] {
    return this.loadData().filter((r) => r.evaluatedBy === userId);
  }

  getDecisionDistribution(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const r of this.loadData()) {
      counts[r.decision] = (counts[r.decision] || 0) + 1;
    }
    return counts;
  }

  getRiskScoreDistribution(): { low: number; medium: number; high: number } {
    const records = this.loadData();
    return {
      low: records.filter((r) => r.riskScore <= 33).length,
      medium: records.filter((r) => r.riskScore > 33 && r.riskScore <= 66).length,
      high: records.filter((r) => r.riskScore > 66).length,
    };
  }

  getRules() {
    try {
      const configPath = path.resolve(__dirname, '../../mock-data/config.json');
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return configData.underwritingRules || [];
    } catch {
      return [];
    }
  }

  getRestrictedZones(): string[] {
    try {
      const configPath = path.resolve(__dirname, '../../mock-data/config.json');
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return configData.restrictedZones || [];
    } catch {
      return [];
    }
  }
}

export const underwritingRepository = new UnderwritingRepository();
