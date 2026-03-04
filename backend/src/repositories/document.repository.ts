import { BaseRepository } from './base.repository';
import { PolicyDocument, DocumentCategory } from '../models';

class DocumentRepository extends BaseRepository<PolicyDocument> {
  constructor() {
    super('documents.json');
  }

  findByPolicyId(policyId: string): PolicyDocument[] {
    return this.loadData().filter((d) => d.policyId === policyId);
  }

  findByClaimId(claimId: string): PolicyDocument[] {
    return this.loadData().filter((d) => d.claimId === claimId);
  }

  findByType(type: string): PolicyDocument[] {
    return this.loadData().filter((d) => d.type === type);
  }

  findByCategory(category: DocumentCategory): PolicyDocument[] {
    return this.loadData().filter((d) => d.category === category);
  }

  findByUploader(userId: string): PolicyDocument[] {
    return this.loadData().filter((d) => d.uploadedBy === userId);
  }

  findVersions(parentDocumentId: string): PolicyDocument[] {
    return this.loadData()
      .filter((d) => d.parentDocumentId === parentDocumentId || d.id === parentDocumentId)
      .sort((a, b) => b.version - a.version);
  }

  getLatestVersion(parentDocumentId: string): PolicyDocument | undefined {
    const versions = this.findVersions(parentDocumentId);
    return versions.length > 0 ? versions[0] : undefined;
  }
}

export const documentRepository = new DocumentRepository();
