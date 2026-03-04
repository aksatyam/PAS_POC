import { BaseRepository } from './base.repository';
import { PolicyVersion } from '../models';

// Policy versions are stored in memory only (no JSON file), since there's no mock file for them
class PolicyVersionRepository {
  private versions: PolicyVersion[] = [];

  findAll(): PolicyVersion[] {
    return [...this.versions];
  }

  findById(id: string): PolicyVersion | undefined {
    return this.versions.find((v) => v.id === id);
  }

  findByPolicyId(policyId: string): PolicyVersion[] {
    return this.versions
      .filter((v) => v.policyId === policyId)
      .sort((a, b) => a.version - b.version);
  }

  async create(version: PolicyVersion): Promise<PolicyVersion> {
    this.versions.push(version);
    return version;
  }

  getLatestVersion(policyId: string): PolicyVersion | undefined {
    const versions = this.findByPolicyId(policyId);
    return versions.length > 0 ? versions[versions.length - 1] : undefined;
  }
}

export const policyVersionRepository = new PolicyVersionRepository();
